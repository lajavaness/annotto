import fs from 'fs/promises'
import { escapeRegExp } from 'lodash'
import { User } from '../../../types'
import { generateError } from '../../../utils/error'
import { logger } from '../../../utils/logger'
import ProjectModel, { Project } from '../../../db/models/projects'
import { removeCascade, createProjectAndTasks } from '..'
import { importJsonLines } from '../../file-upload/jsonlines'
import {
  handleItemStream,
  handleItemPredictionStream,
  handleAnnotationsImportStream,
} from '../../file-upload/stream-handler'
import { projectConfigV2Schema } from '../../../router/validation/project'

const parseProjectNumber = (project: Project) => {
  const match = project.name.match(/ \(([0-9]+)\)$/)
  if (!match) {
    return 0
  }
  return parseInt(match[1])
}

const findLatestDuplicateProjectNumber = async (name: string) => {
  const tmpName = name.replace(/ \([0-9]+\)$/, '')
  const projects = await ProjectModel.find({ name: { $regex: `^${escapeRegExp(name)}( \\([0-9]+\\))?$` } }).select(
    'name'
  )
  if (!projects.length) {
    return tmpName
  }

  projects.sort((a, b) => parseProjectNumber(b) - parseProjectNumber(a))

  const lastNumber = parseProjectNumber(projects[0])

  return `${tmpName} (${lastNumber + 1})`
}

const createProject = async ({
  file,
  _user,
  renameIfDuplicateName = false,
}: {
  file: { path: string }
  _user: User
  renameIfDuplicateName: boolean
}) => {
  let config

  try {
    const configStream = await fs.readFile(file.path, 'utf8')
    config = JSON.parse(configStream)
    projectConfigV2Schema.validate(config)
  } catch (error) {
    logger.info(error)
    logger.error(error instanceof Error ? error.stack : 'Invalid Error')

    throw generateError({
      message: 'ERROR_PROJECT_VALIDATION',
      infos: `Invalid JSON (config.json): (${error instanceof Error ? error.message : 'Invalid Error'})`,
    })
  }

  if (renameIfDuplicateName) {
    config.name = await findLatestDuplicateProjectNumber(config.name)
  }

  return createProjectAndTasks({ config, _user })
}

export const importAllFromFiles = async ({
  projectFile,
  itemsFile,
  predictionsFile,
  annotationsFile,
  _user,
  renameIfDuplicateName,
}: {
  projectFile: { path: string }
  itemsFile: { path: string }
  predictionsFile?: { path: string }
  annotationsFile?: { path: string }
  _user: User
  renameIfDuplicateName: boolean
}) => {
  let predictions
  let annotations
  let projectId
  try {
    // The project needs to be created first
    const project = await createProject({
      renameIfDuplicateName,
      file: projectFile,
      _user,
    })
    projectId = project._id

    const opts = { project, _user }

    const items = await importJsonLines({
      file: itemsFile,
      field: 'items',
      handler: handleItemStream,
      ...opts,
    })

    if (predictionsFile) {
      predictions = await importJsonLines({
        file: predictionsFile,
        field: 'predictions',
        handler: handleItemPredictionStream,
        ...opts,
      })
    }

    if (annotationsFile) {
      annotations = await importJsonLines({
        file: annotationsFile,
        field: 'annotations',
        handler: handleAnnotationsImportStream,
        ...opts,
      })
    }

    return {
      project,
      items,
      predictions,
      annotations,
    }
  } catch (error) {
    // Rollback on error if project was created (expects transactions to be available, >= Mongo 4.0)
    if (projectId) {
      await removeCascade(projectId)
    }
    throw error
  }
}

export default {
  importAllFromFiles,
}
