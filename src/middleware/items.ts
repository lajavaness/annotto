import _ from 'lodash'
import Busboy from 'busboy'
import express from 'express'
import mongoose from 'mongoose'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'
import { InternalEntity, InternalRelation } from '../types'
import { generateError } from '../utils/error'
import { logger } from '../utils/logger'
import AnnotationModel, { Annotation } from '../db/models/annotations'
import FilterModel from '../db/models/filters'
import ItemModel, { Item, ItemDocument, ItemS3Document } from '../db/models/items'
import ProjectModel from '../db/models/projects'
import { handleItemStream, handleItemPredictionStream } from '../core/file-upload/stream-handler'
import { browse, updateHighlights, convertToS3Url, saveItem } from '../core/items'
import annotateItem from '../core/items/annotateItem'
import { getProjectTags } from '../core/projects'
import { paginate, Paginate } from '../utils/paginate'
import {
  setParams,
  singleValueOrArrayToMongooseSelector,
  stringToRegExpOrUndefined,
  valueToMongooseArraySelector,
} from '../utils/query'
import type { ParamsPayload } from '../utils/query'

type NextItemQuery = {
  filterId: string
}

type UpdatePayload = {
  _id?: string
  tags: string[]
}

type AnnotatePayload = {
  annotations: InternalEntity[]
  entitiesRelations: InternalRelation[]
}

type UploadPayload = {
  file: unknown
}

type ItemsUploadQuery = {
  isUpdate: string
}

type ItemsUploadResponse = {
  inserted: number
  updated: number
}

type PredictionUploadResponse = {
  inserted: number
}

const _indexByFilter = async (
  req: express.Request<{}, {}, {}, ParamsPayload> & { filterCriteria?: mongoose.FilterQuery<Item> },
  res: express.Response<Paginate<Item>>,
  next: express.NextFunction
) => {
  try {
    const params = setParams(req.query, {
      orderBy: ['updatedAt'],
      limit: 100,
      select: {
        tags: true,
        commentCount: true,
        logCount: true,
        lastAnnotator: true,
        annotationValues: true,
        annotatedAt: true,
        velocity: true,
        body: true,
        annotated: true,
      },
    })

    const [total, data] = await Promise.all([
      ItemModel.countDocuments(req.filterCriteria || {}),
      browse(req.filterCriteria, params),
    ])

    res.status(200).json(paginate({ ...params, total }, data))
  } catch (error) {
    next(error)
  }
}

const index = async (
  req: express.Request<{}, {}, {}, ParamsPayload> & { filterCriteria?: mongoose.FilterQuery<Item> },
  res: express.Response<Paginate<Item>>,
  next: express.NextFunction
) => {
  try {
    if (req.query.filterId) {
      const filter = await FilterModel.findById(req.query.filterId)

      if (!filter) {
        throw generateError({
          code: 404,
          message: 'ERROR_FILTER_NOT_FOUND',
        })
      }
      req.filterCriteria = JSON.parse(filter.criteria)

      if (req.filterCriteria) {
        await _indexByFilter(req, res, next)
        return
      }
    }
    /**
     *  projectId: { key: 'project', type: 'number' },
     *  status: { key: 'status', type: 'string' },
     *  itemId: { key: '_id', type: 'number' },
     *  type: { key: 'type', type: 'string' },
     *  body: { key: 'body', type: 'text' },
     *  tags: { key: 'tags', type: 'array' },
     *  annotated: { key: 'annotated', type: 'boolean' },
     *  uuid: { key: 'uuid', type: 'string' },
     *  compositeUuid: { key: 'compositeUuid', type: 'string' },
     *  updatedAt: { key: 'updatedAt', type: 'string' },
     */
    const criteria = {
      project: singleValueOrArrayToMongooseSelector(<string | string[] | undefined>req.query.projectId),
      status: singleValueOrArrayToMongooseSelector(<string | string[] | undefined>req.query.status),
      _id: singleValueOrArrayToMongooseSelector(<string | string[] | undefined>req.query.itemId),
      type: singleValueOrArrayToMongooseSelector(<string | string[] | undefined>req.query.type),
      body: stringToRegExpOrUndefined(<string | undefined>req.query.body),
      tags: valueToMongooseArraySelector(<string | string[] | undefined>req.query.tags),
      annotated: singleValueOrArrayToMongooseSelector(<string | string[] | undefined>req.query.annotated),
      uuid: singleValueOrArrayToMongooseSelector(<string | string[] | undefined>req.query.uuid),
      compositeUuid: valueToMongooseArraySelector(<string | string[] | undefined>req.query.compositeUuid),
      updatedAt: singleValueOrArrayToMongooseSelector(<string | string[] | undefined>req.query.updatedAt),
    }
    const params = setParams(<ParamsPayload>req.query, {
      limit: 100,
      orderBy: ['updatedAt'],
      select: {
        tags: true,
        commentCount: true,
        logCount: true,
        lastAnnotator: true,
        annotationValues: true,
        annotatedAt: true,
        velocity: true,
        body: true,
        annotated: true,
      },
    })

    const data = await browse(criteria, params)

    res.status(200).json(paginate({ ...params, total: req._project.itemCount || 0 }, data))
  } catch (error) {
    next(error)
  }
}

const fetchMostRelevantNextItem = async (projectId: string) => {
  const alreadySeen = {
    project: projectId,
    seenAt: { $ne: <null>null },
  }

  const neverSeen = [
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
        seenAt: <null>null,
      },
    },
    {
      $sample: { size: 1 }, // mongodb "random" selector
    },
  ]

  const items = await ItemModel.aggregate(neverSeen)

  if (!items.length) {
    return ItemModel.findOne(alreadySeen).sort({ seenAt: 'asc' })
  }

  return ItemModel.hydrate(items[0])
}

const sanitizeFilterCriteria = (criteria: string, projectId: string) => {
  const customQuery = JSON.parse(criteria)

  // filter out empty or wrong filter.criteria
  if (!customQuery || customQuery.project !== projectId || Object.keys(customQuery).length === 1) {
    return null
  }
  return customQuery
}

const saveAndPopulateItem = async (req: express.Request, item: ItemDocument) => {
  const hl = await updateHighlights(req._project.highlights, item.sourceHighlights)
  item.highlights = hl.highlights
  item.sourceHighlights = hl.sourceHighlights

  item.seenAt = new Date()
  await saveItem(item, req._user)

  if (req._project.s3 && item?.data?.url) {
    item.data.url = await convertToS3Url(item as ItemS3Document, req._project.s3) // eslint-disable-line no-use-before-define
  }

  return item
}

/*
  Find one item, by oldest seenAt date
  update item’s seenAt before res
  update item’s highlights ( a first time and when project highlights have been updated or removed )
  Sends content as base64 if s3 was set in project config
*/
const nextItem = async (
  req: express.Request<{ projectId: string }, {}, {}, NextItemQuery>,
  res: express.Response<Item>,
  next: express.NextFunction
) => {
  try {
    const { projectId } = req.params
    const { filterId } = req.query
    let item: ItemDocument | null
    let customQuery

    if (filterId) {
      const filter = await FilterModel.findById(filterId)

      if (!filter) {
        throw generateError({
          code: 404,
          message: 'ERROR_FILTER_NOT_FOUND',
        })
      }
      customQuery = sanitizeFilterCriteria(filter.criteria, projectId)
    }

    if (customQuery) {
      item = await ItemModel.findOne(customQuery).sort({ seenAt: 'asc' })
    } else {
      item = await fetchMostRelevantNextItem(projectId)
    }

    if (!item) {
      res.sendStatus(200)
      return
    }

    item = await saveAndPopulateItem(req, item)
    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

const getById = async (
  req: express.Request<{ projectId: string; itemId: string }>,
  res: express.Response<Item>,
  next: express.NextFunction
) => {
  try {
    const { projectId, itemId } = req.params

    let item = await ItemModel.findById(itemId)
    if (!item) {
      throw generateError({
        code: 404,
        message: 'ERROR_ITEM_NOT_FOUND',
      })
    }

    if (item.project.toString() !== projectId) {
      throw generateError({
        code: 404,
        message: 'ERROR_PROJECT_NOT_FOUND',
      })
    }

    item = await saveAndPopulateItem(req, item)
    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

const getByUuid = async (
  req: express.Request<{ projectId: string; itemUuid: string }>,
  res: express.Response<Item>,
  next: express.NextFunction
) => {
  try {
    const { projectId, itemUuid } = req.params

    let item = await ItemModel.findOne({ uuid: itemUuid })
    if (!item) {
      throw generateError({
        code: 404,
        message: 'ERROR_ITEM_NOT_FOUND',
      })
    }

    if (item.project.toString() !== projectId) {
      throw generateError({
        code: 404,
        message: 'ERROR_PROJECT_NOT_FOUND',
      })
    }

    item = await saveAndPopulateItem(req, item)
    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

const annotations = async (
  req: express.Request<{ itemId: string }>,
  res: express.Response<Annotation[]>,
  next: express.NextFunction
) => {
  try {
    res.status(200).json(await AnnotationModel.find({ item: req.params.itemId }))
  } catch (error) {
    next(error)
  }
}

const update = async (
  req: express.Request<{ itemId: string }, {}, UpdatePayload>,
  res: express.Response<Item>,
  next: express.NextFunction
) => {
  try {
    const { itemId } = req.params

    const item = await ItemModel.findById(itemId)
    if (!item) {
      throw generateError({
        code: 404,
        message: 'ERROR_ITEM_NOT_FOUND',
      })
    }

    if (req.body._id) {
      delete req.body._id
    }

    const updated = _.extend(item, req.body)

    await saveItem(updated, req._user)

    res.status(200).json(updated)
  } catch (error) {
    next(error)
  }
}

const annotate = async (
  req: express.Request<{ itemId: string; projectId: string }, {}, AnnotatePayload>,
  res: express.Response<Annotation[]>,
  next: express.NextFunction
) => {
  try {
    const { itemId, projectId } = req.params

    const project = await ProjectModel.findById(projectId)
    if (!project) {
      throw generateError({
        code: 404,
        message: 'ERROR_PROJECT_NOT_FOUND',
      })
    }

    const params = {
      _user: req._user,
      project,
    }

    const item = await ItemModel.findById(itemId)
    if (!item) {
      throw generateError({
        code: 404,
        message: 'ERROR_ITEM_NOT_FOUND',
      })
    }

    res.status(200).json(await annotateItem(item, req.body, params))
  } catch (error) {
    logger.info(error)
    next(error)
  }
}

const getTags = async (
  req: express.Request<{ projectId: string }>,
  res: express.Response<string[]>,
  next: express.NextFunction
) => {
  try {
    const projectTags = await getProjectTags(req.params.projectId)
    const tags = _.uniq(projectTags)

    res.status(200).json(tags)
  } catch (error) {
    next(error)
  }
}

/*
  Insert items in stream to control mem usage and in batch to reduce latency : Pipe req stream to busboy
*/
const itemsUpload = async (
  req: express.Request<{ projectId: string }, {}, UploadPayload, ItemsUploadQuery>,
  res: express.Response<ItemsUploadResponse>,
  next: express.NextFunction
) => {
  const { projectId } = req.params
  const project = await ProjectModel.findById(projectId)

  if (!project) {
    next(
      generateError({
        code: 404,
        message: 'ERROR_PROJECT_NOT_FOUND',
        infos: projectId,
      })
    )
    return
  }

  if (!req.headers['content-type']) {
    next(
      generateError({
        code: 400,
        message: 'MISSING_CONTENT_TYPE',
      })
    )
    return
  }

  const busboyStream = new Busboy({
    headers: {
      'content-type':
        req.headers['content-type'] ||
        (Array.isArray(req.headers['Content-Type']) && req.headers['Content-Type'][0]) ||
        '',
    },
  })

  busboyStream.on('file', async (fieldname, stream: Readable) => {
    try {
      const response = await handleItemStream({
        isUpdate: req.query.isUpdate === 'true',
        stream,
        project,
      })

      res.status(200).json(response)
    } catch (error) {
      logger.info(error)

      next(
        generateError({
          code: 400,
          message: 'ERROR_ITEMS',
          infos: error instanceof Error ? error.message : 'Invalid Error',
        })
      )
    }
  })

  try {
    await pipeline(req, busboyStream)
  } catch (error) {
    if (res.headersSent) return

    next(
      generateError({
        code: 500,
        message: 'BUSBOY_STREAM_ERROR',
        infos: error instanceof Error ? error.message : 'Invalid Error',
      })
    )
  }
}

const predictionUpload = async (
  req: express.Request<{ projectId: string }, {}, UploadPayload>,
  res: express.Response<PredictionUploadResponse>,
  next: express.NextFunction
) => {
  const { projectId } = req.params
  const project = await ProjectModel.findById(projectId)

  if (!project) {
    next(
      generateError({
        code: 404,
        message: 'ERROR_PROJECT_NOT_FOUND',
        infos: projectId,
      })
    )
    return
  }

  if (!req.headers['content-type']) {
    next(
      generateError({
        code: 400,
        message: 'MISSING_CONTENT_TYPE',
      })
    )
    return
  }

  const busboyStream = new Busboy({
    headers: {
      'content-type':
        req.headers['content-type'] ||
        (Array.isArray(req.headers['Content-Type']) && req.headers['Content-Type'][0]) ||
        '',
    },
  })

  busboyStream.on('file', async (fieldname, stream) => {
    try {
      const result = await handleItemPredictionStream({
        stream,
        project,
      })

      res.status(200).json(result)
    } catch (error) {
      logger.info(error)

      next(
        generateError({
          code: 400,
          message: 'ERROR_PREDICTIONS',
          infos: error instanceof Error ? error.message : 'Invalid Error',
        })
      )
    }
  })

  try {
    await pipeline(req, busboyStream)
  } catch (error) {
    logger.info(error)

    if (res.headersSent) return
    next(
      generateError({
        code: 500,
        message: 'BUSBOY_STREAM_ERROR',
        infos: error instanceof Error ? error.message : 'Invalid Error',
      })
    )
  }
}

export default {
  index,
  getById,
  getByUuid,
  next: nextItem,
  annotations,
  annotate,
  update,
  getTags,
  itemsUpload,
  predictionUpload,
}
