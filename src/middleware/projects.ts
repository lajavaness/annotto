import archiver from 'archiver'
import _ from 'lodash'
import express from 'express'
import formidable from 'formidable'
import tmp from 'tmp'
import { S3, TaskPayload, User } from '../types'
import { AnnottoError, generateError } from '../utils/error'
import { logger } from '../utils/logger'
import { Item } from '../db/models/items'
import ProjectModel, { Project, EntitiesRelationsGroup } from '../db/models/projects'
import { Task } from '../db/models/tasks'
import itemMiddleware from './items'
import classificationMiddleware from './tasks'
import { importJsonLines } from '../core/file-upload/jsonlines'
import { handleAnnotationsImportStream } from '../core/file-upload/stream-handler'
import { listUsers, getClient, removeCascade, saveProject } from '../core/projects'
import downloadCore from '../core/projects/download'
import { importAllFromFiles } from '../core/projects/import'
import tasks from '../core/tasks'
import config from '../../config'
import { paginate } from '../utils/paginate'
import type { Paginate } from '../utils/paginate'
import { applyParamsToQuery, setParams, cleanRecord } from '../utils/query'
import type { ParamsPayload } from '../utils/query'
import { mongooseEq, mongooseRegexp } from '../utils/mongoose'

type ProjectPayload = {
  client?: string
  s3?: S3
  type?: 'text' | 'image' | 'video' | 'audio' | 'html'
  entitiesRelationsGroup?: EntitiesRelationsGroup
  name?: string
  description?: string
  active?: boolean
  guidelines?: string
  defaultTags?: string[]
  highlights?: string[]
  similarityEndpoint?: string
  showPredictions?: string
  prefillPredictions?: boolean
  deadline?: Date
  admins?: string[]
  users?: string[]
  dataScientists: string[]
  tasks?: TaskPayload[]
}

type ImportAnnotationsResponse = {
  inserted: number
  uuidNotFound: string[]
}

type CreateProjectQuery = {
  renameIfDuplicateName?: string
}

type CreateProjectResponse = {
  project: Project
  items: {
    inserted: number
    updated: number
  }
  predictions?: {
    inserted: number
  }
  annotations?: {
    inserted: number
    uuidNotFound: string[]
  }
}

type DownloadQuery = {
  config?: boolean
  annotationsAndComments?: boolean
  allItems?: boolean
}

const {
  fileUpload: { maxFileSize },
} = config

/*
  Returns DEMO projects and active projects with stats, filtered for non admin users by project config
*/
const index = async (
  req: express.Request<ParamsPayload, {}, {}, ParamsPayload>,
  res: express.Response<Paginate<Project>>,
  next: express.NextFunction
) => {
  const queryParams = { ...req.query, ...req.params }
  const criteria = cleanRecord({
    _id: mongooseEq(queryParams.projectId),
    client: mongooseEq(queryParams.clientId),
    name: mongooseRegexp(queryParams.name),
    description: mongooseRegexp(queryParams.description),
    active: true,
  })
  if (req._user && req._user.profile && req._user.profile.role !== 'admin') {
    criteria.$or = [
      { admins: { $in: [req._user.email] } },
      { dataScientists: { $in: [req._user.email] } },
      { users: { $in: [req._user.email] } },
    ]
  }
  logger.debug(JSON.stringify(criteria))

  const params = setParams(req.query, {
    orderBy: ['name'],
    limit: 100,
    select: {
      client: true,
      admins: true,
      users: true,
      dataScientists: true,
      itemCount: true,
      commentCount: true,
      deadline: true,
      progress: true,
      velocity: true,
      remainingWork: true,
      lastAnnotationTime: true,
      name: true,
      updatedAt: true,
    },
  })
  try {
    const [total, projects] = await Promise.all([
      ProjectModel.countDocuments(criteria),
      applyParamsToQuery(ProjectModel.find(criteria), params),
    ])

    res.status(200).json(paginate({ ...params, total }, projects))
  } catch (error) {
    next(error)
  }
}

/*
  Get project, filtered for non admin users by project config
  Adds DEMO projects with no users or admins
*/
const getById = async (
  req: express.Request<{ projectId: string }>,
  res: express.Response<Project>,
  next: express.NextFunction
) => {
  const { projectId } = req.params
  try {
    const project = await ProjectModel.findById(projectId).populate('tasks').populate('client')

    if (!project) {
      throw generateError({
        code: 404,
        message: 'ERROR_PROJECT_NOT_FOUND',
      })
    }

    if (!project.active) {
      throw generateError({
        code: 403,
        message: 'ERROR_PROJECT_IS_ARCHIVED',
      })
    }

    res.status(200).json(project)
  } catch (error) {
    next(error)
  }
}

const getUsers = async (
  req: express.Request<{ projectId: string }>,
  res: express.Response<User[]>,
  next: express.NextFunction
) => {
  const { projectId } = req.params
  try {
    const users = await listUsers({ projectId })
    res.json(users)
  } catch (error) {
    next(error)
  }
}

// Update project and tasks ( if _id is given update task, else create it ).
const update = async (
  req: express.Request<{ projectId: string }, {}, ProjectPayload>,
  res: express.Response<Project>,
  next: express.NextFunction
) => {
  try {
    const { projectId } = req.params
    const project = await tasks.createAndUpdate(req._project.tasks || [], req.body.tasks, projectId)

    if (!project) {
      throw generateError({
        code: 404,
        message: 'ERROR_PROJECT_NOT_FOUND',
      })
    }

    if (req.body.client) {
      project.client = await getClient(req.body.client, { _user: req._user })
    }

    if (req.body.entitiesRelationsGroup) {
      req.body.entitiesRelationsGroup.forEach((payloadGroup) => {
        if (payloadGroup._id) {
          let group = project.entitiesRelationsGroup.find((g) => g && g._id && g._id.toString() === payloadGroup._id)

          // TODO : What does this whole block do ? The group isn't used anywhere, so maybe even the req.body.entitiesRelationsGroup neither. Delete ?
          if (group) group = _.extend(group, payloadGroup)
          else {
            throw generateError({
              code: 400,
              message: 'ERROR_PROJECT_VALIDATION',
              infos: `invalid relation group _id (${payloadGroup._id})`,
            })
          }
        } else {
          project.entitiesRelationsGroup.push(payloadGroup)
        }
      })
    }

    delete req.body.entitiesRelationsGroup
    delete req.body.tasks
    delete req.body.client

    const updated = _.extend(project, req.body)

    await saveProject(updated, req._user)

    res.status(200).json(updated)
  } catch (error) {
    logger.info(error)
    logger.error(error instanceof Error ? error.stack : 'Invalid Error')
    next(error)
  }
}

const remove = async (
  req: express.Request<{ projectId: string }>,
  res: express.Response<void>,
  next: express.NextFunction
) => {
  try {
    const { projectId } = req.params

    const project = await ProjectModel.findById(projectId)
    if (!project) {
      throw generateError({
        code: 404,
        message: 'ERROR_PROJECT_NOT_FOUND',
        infos: projectId,
      })
    }

    await removeCascade(projectId)

    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
}

const extractFilesFromReq = (
  req: express.Request<{}, {}, Record<string, unknown>>,
  res: express.Response,
  opts: { keepExtensions: boolean }
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    // TODO REMOVE SYNC METHODS IN WHOLE FILE
    const tmpObj = tmp.dirSync({ unsafeCleanup: true })

    res.on('finish', () => tmpObj.removeCallback())
    res.on('error', () => tmpObj.removeCallback())

    const form = new formidable.IncomingForm({
      maxFileSize,
      uploadDir: tmpObj.name,
      ...opts,
    })

    let lastProgress = 0
    form.on('progress', (bytesReceived, bytesExpected) => {
      const rec = Math.round((bytesReceived / 1024 / 1024) * 100) / 100
      const total = Math.round((bytesExpected / 1024 / 1024) * 100) / 100
      const percent = Math.round((rec / total) * 100)
      if (lastProgress < percent - 20) {
        logger.info(`${percent}%`, rec, '/', `${total}Mb`)
        lastProgress = percent
      }
    })

    form.parse(req, (err, fields, files) => {
      if (err) reject(new Error(err))
      else resolve({ fields, files })
    })
  })
}

const importAnnotations = async (
  req: express.Request,
  res: express.Response<ImportAnnotationsResponse>,
  next: express.NextFunction
) => {
  try {
    if (!req.headers['content-type']) {
      next(
        generateError({
          code: 400,
          message: 'MISSING_CONTENT_TYPE',
        })
      )
      return
    }

    const { files } = await extractFilesFromReq(req, res, { keepExtensions: true })

    // only parse first file found
    const [file] = Object.values(files)

    const response = await importJsonLines({
      file: Array.isArray(file) ? file[0] : file,
      field: 'annotations',
      handler: handleAnnotationsImportStream,
      project: req._project,
      _user: req._user,
    })

    res.status(200).json(response)
  } catch (error) {
    logger.info(error)

    if (error instanceof AnnottoError && error.infos) {
      error.code = 400
      next(error)
      return
    }

    next(
      generateError({
        code: 400,
        message: 'ERROR_ANNOTATION_IMPORT',
        infos: error instanceof Error ? error.message : 'Invalid Error',
      })
    )
  }
}

const stats = async (
  req: express.Request<{ projectId: string; view?: string }>,
  res: express.Response<Paginate<Task> | Paginate<Item>>,
  next: express.NextFunction
) => {
  try {
    switch (req.params.view) {
      case 'tasks':
        await classificationMiddleware.index(
          <express.Request<{ projectId: string }, {}, {}, ParamsPayload>>req,
          res,
          next
        )
        return
      case 'items':
        await itemMiddleware.index(<express.Request<{ projectId: string }, {}, {}, ParamsPayload>>req, res, next)
        return
      default:
        next('route')
        return
    }
  } catch (error) {
    next(error)
  }
}

const createProject = async (
  req: express.Request<{}, {}, Record<string, unknown>, CreateProjectQuery>,
  res: express.Response<CreateProjectResponse>,
  next: express.NextFunction
) => {
  try {
    const { files } = await extractFilesFromReq(req, res, { keepExtensions: true })

    if (!files.project) {
      throw generateError({
        code: 400,
        message: 'ERROR_MISSING_PROJECT_FILE',
      })
    }
    if (!files.items) {
      throw generateError({
        code: 400,
        message: 'ERROR_MISSING_ITEMS_FILE',
      })
    }

    const out = await importAllFromFiles({
      renameIfDuplicateName: !!req.query.renameIfDuplicateName || false,
      projectFile: Array.isArray(files.project) ? files.project[0] : files.project,
      itemsFile: Array.isArray(files.items) ? files.items[0] : files.items,
      predictionsFile: Array.isArray(files.predictions) ? files.predictions[0] : files.predictions,
      annotationsFile: Array.isArray(files.annotations) ? files.annotations[0] : files.annotations,
      _user: req._user,
    })

    res.status(200).json(out)
    return
  } catch (error) {
    logger.info(error)
    logger.error(error instanceof Error ? error.stack : 'Invalid Error')

    if (error instanceof AnnottoError && error.infos) {
      error.code = 400
      next(error)
      return
    }

    if (error instanceof Error && error.message && error.message.includes('E11000')) {
      next(
        generateError({
          code: 400,
          message: 'ERROR_PROJECT_CREATION_DUPLICATE_NAME',
        })
      )
      return
    }

    next(
      generateError({
        code: 400,
        message: 'ERROR_PROJECT_CREATION',
        infos: error instanceof Error ? error.message : 'Invalid Error',
      })
    )
  }
}

const prettyDate = (date: Date) =>
  date
    .toISOString()
    .replace('T', '_')
    .replace(/\.[0-9]{3}Z$/, '')

/*
 * Creates Zip folder to export, includes files depending on req.query ( default : annotation file )
 * files are created using "tmp" module for auto delete, and added to a zip folder using "archiver" module.
 */
const download = async (
  req: express.Request<{ projectId: string }, {}, {}, DownloadQuery>,
  res: express.Response<archiver.Archiver>,
  next: express.NextFunction
) => {
  const {
    params: { projectId },
    _project,
  } = req
  const date = prettyDate(new Date())
  const zipName = `export-${_project.name}-${date}.zip`

  let param

  if (req.query.config || req.query.annotationsAndComments || req.query.allItems) {
    param = req.query
  } else {
    param = { allItems: true }
  }

  try {
    const archive = await downloadCore.download(projectId, _project, param)

    // the pipe to res needs to be set before archive.finalize()
    // to avoid having full buffer situations (>7Mo files apparently)
    archive.pipe(res)

    res.attachment(zipName).type('application/zip')

    await archive.finalize()
  } catch (error) {
    next(
      generateError({
        code: 500,
        message: error instanceof Error ? error.message : 'Invalid Error',
      })
    )
  }
}

export default {
  index,
  getById,
  getUsers,
  update,
  download,
  importAnnotations,
  remove,
  createProject,
  stats,
}
