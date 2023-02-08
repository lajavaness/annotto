import mongoose from 'mongoose'
import { ItemPayload, S3, User } from '../../types'
import { decrypt } from '../../utils/crypto'
import queryBuilder, { QueryPayload } from '../../utils/query-builder'
import { Annotation } from '../../db/models/annotations'
import ItemModel, { Item, ItemDocument, ItemS3Document } from '../../db/models/items'
import { Project } from '../../db/models/projects'
import { logTags } from '../logs'
import { updateProjectStats } from '../projects'
import { updateClassificationStats } from '../tasks'
import S3Client from '../s3-client'

const { setQuery } = queryBuilder('mongo')

export const browse = (criteria: Record<string, unknown> = {}, params: QueryPayload = {}) => {
  const q = ItemModel.find(criteria)
  setQuery(q, params)

  return q.lean()
}

export const toCompositeUuid = (project: Project | string, item: { uuid?: string }) =>
  `${typeof project === 'string' ? project : project._id}_${item.uuid}`

export const findItemsByCompositeUuid = (compositeUuids: string[]) =>
  ItemModel.find({ compositeUuid: { $in: compositeUuids } })

export const findItemByCompositeUuid = (compositeUuid: string) => ItemModel.findOne({ compositeUuid })

const deleteUndefinedProps = <T extends Record<string, unknown>>(obj: T) => {
  Object.keys(obj).forEach((prop) => {
    if (typeof obj[prop] === 'undefined') {
      delete obj[prop]
    }
  })
  return obj
}

export const transformLineToItem = (
  line: ItemPayload,
  projectId: mongoose.Types.ObjectId | string,
  isUpdate = false
) => {
  const body: string = line.data && line.data.text ? line.data.text : (line.data && line.data.body) || ''

  const undefIfUpdate = <T>(val: T) => (isUpdate ? undefined : val)

  const obj = {
    raw: line || undefIfUpdate({}),
    predictions: undefIfUpdate({}),
    highlights: undefIfUpdate([]),
    project: new mongoose.Types.ObjectId(projectId),
    uuid: line.uuid,
    compositeUuid: `${projectId}_${line.uuid}`,
    data: line.data,
    type: <'text' | 'image' | 'video' | 'audio' | 'html'>(line.type || line.datatype),
    body,
    tags: <string[]>(line.tags ? line.tags : line.markers) || undefIfUpdate([]),
    metadata: line.metadata || undefIfUpdate({}),
    description: line.description || undefIfUpdate(''),
    status: <'todo'>undefIfUpdate('todo'),
    annotated: undefIfUpdate(false),
    annotatedBy: undefIfUpdate([]),
    annotationValues: undefIfUpdate([]),
    entitiesRelations: undefIfUpdate([]),
    updatedAt: new Date(),
    createdAt: undefIfUpdate(new Date()),
    velocity: undefIfUpdate(undefined),
    annotationTimes: undefIfUpdate([]),
    lastAnnotator: undefIfUpdate(undefined),
    commentCount: undefIfUpdate(0),
    logCount: undefIfUpdate(0),
    sourceHighlights: undefIfUpdate([]),
  }

  return isUpdate ? deleteUndefinedProps(obj) : obj
}

export const insertItemsBatch = (projectId: mongoose.Types.ObjectId | string, items: ItemPayload[]) => {
  const batch = items.map((i) => transformLineToItem(i, projectId.toString(), false))

  // we don't need to validate the object because it's already done by joi validators in an earlier stage
  return ItemModel.collection.insertMany(batch, { ordered: false })
}

export const updateItemsBatch = (
  batch: ItemPayload[],
  projectId: mongoose.Types.ObjectId | string,
  response: { updated: number }
) =>
  Promise.all(
    batch.map(async (line) => {
      const update = transformLineToItem(line, projectId, true)
      const item = await ItemModel.findOneAndUpdate(
        { compositeUuid: toCompositeUuid(projectId.toString(), line) },
        update
      )

      if (!item) throw new Error('Error project creation: Cannot find item uuid to update')
      else response.updated += 1
    })
  )

export const updateItemsTags = (items: ItemPayload[]) =>
  ItemModel.bulkWrite(
    items.map((i) => ({
      updateOne: {
        filter: { compositeUuid: i.compositeUuid },
        update: { $set: { tags: i.tags } },
      },
    }))
  )

/**
 * When project highlight is removed, item.highlight is also removed
 * When project highlight was updated ( item.sourceHighlights doesn't match )
 * item.highlights and item.sourceHighlights are updated.
 * @param {string[]} projectHighlights The project highlights.
 * @param {string[]} sourceHighlights The source highlights.
 * @returns {Promise.<{ highlights: string[], sourceHighlights: string[] }>} The updated highlights.
 */
export const updateHighlights = async (
  projectHighlights: string[],
  sourceHighlights: string[]
): Promise<{ highlights: string[]; sourceHighlights: string[] }> => {
  if (!Array.isArray(projectHighlights) || !projectHighlights.length) {
    return {
      highlights: [],
      sourceHighlights: [],
    }
  }

  if (
    !Array.isArray(sourceHighlights) ||
    projectHighlights.length !== sourceHighlights.length ||
    projectHighlights.some((highlight) => !sourceHighlights.includes(highlight))
  ) {
    return {
      highlights: [],
      sourceHighlights: projectHighlights,
    }
  }

  return {
    highlights: [],
    sourceHighlights,
  }
}

/**
 * Update item stats.
 * @param {object} item The item.
 * @param {object | string} item._id To know which tasks stats to update.
 * @param {object | string} item.project To know which project to update.
 * @param {boolean} item.firstAnnotationVirtual To update project stats.
 * @param {{inserted: object[], cancelled: object[]}} item.annotationsVirtual To update task stats.
 * @returns {Promise} Nothing.
 */
export const updateItemStats = async ({
  _id: itemId,
  project,
  firstAnnotationVirtual,
  annotationsVirtual,
}: {
  _id: mongoose.Types.ObjectId
  project: mongoose.Types.ObjectId
  firstAnnotationVirtual: boolean
  annotationsVirtual: { inserted: Annotation[]; cancelled: Annotation[] }
}): Promise<
  [
    mongoose.UpdateWriteOpResult,
    {
      insertedCount?: number
      matchedCount?: number
      modifiedCount?: number
      deletedCount?: number
      upsertedCount?: number
      insertedIds?: { [index: number]: unknown }
      upsertedIds?: { [index: number]: unknown }
      result?: unknown
    }
  ]
> => {
  const annotatedItems = await ItemModel.find({
    project,
    annotated: true,
  })
    .select('velocity')
    .lean()

  return Promise.all([
    updateProjectStats(project, annotatedItems, firstAnnotationVirtual),
    updateClassificationStats(project, annotatedItems.length, [
      {
        itemId,
        ...annotationsVirtual,
      },
    ]),
  ])
}

export const filterAnnotationValues = (
  annotationValues: string[],
  newAnnotations: Annotation[],
  canceledAnnotations: Annotation[]
) => {
  const vals = annotationValues.filter(
    (value) => !canceledAnnotations.find((annotation) => annotation.task.value === value)
  )
  newAnnotations.forEach((annotation) => vals.push(annotation.task.value))

  return vals
}

/**
 * Velocity is the median of all annotationTimes.
 * @param {object} item The item.
 * @param {number} item.seenAt The seenAt prop of the item.
 * @param {number} item.annotatedAt The annotatedAt prop of the item.
 * @param {number[]} item.annotationTimes The annotationTimes prop of the item.
 * @returns {{annotationTime: number, velocity: number}} The annotation time and velocity.
 */
export const calculateAnnotationTimesAndVelocity = (item: Item) => {
  if (!item.seenAt) {
    return null
  }
  const diffTime = Math.abs(item.annotatedAt.getTime() - item.seenAt.getTime())
  const annotationTime = Math.ceil(diffTime / 1000)

  const sorted = [...item.annotationTimes, annotationTime].sort((a, b) => a - b)
  const velocity = sorted[Math.round((sorted.length - 1) / 2)]
  return {
    annotationTime,
    velocity,
  }
}

export const updateItemsAfterBulkAnnotation = async (
  items: Item[],
  annotations: { itemId: mongoose.Types.ObjectId; cancelled: Annotation[]; inserted: Annotation[] }[],
  itemMetadata: { item: Item; seenAt: Date; lastAnnotator?: { email?: string }; annotatedAt: Date }[],
  user: User
) => {
  annotations.forEach(({ itemId, cancelled, inserted }) => {
    const meta = itemMetadata.find((v) => v.item._id.equals(itemId))

    if (!meta) return

    const { item } = meta
    item.annotationValues = filterAnnotationValues(item.annotationValues, inserted, cancelled)
    item.seenAt = meta.seenAt
    item.annotatedAt = meta.annotatedAt

    const result = calculateAnnotationTimesAndVelocity(item)
    if (result) {
      item.annotationTimes.push(result.annotationTime)
      item.velocity = result.velocity
    }

    if (!item.annotatedBy.includes(user.email)) {
      item.annotatedBy.push(user.email)
    }

    item.lastAnnotator = user
    if (!item.annotated) {
      item.annotated = true
    }
  })

  await ItemModel.bulkWrite(
    items.map((item) => ({
      updateOne: {
        filter: { _id: item._id },
        update: {
          $set: {
            lastAnnotator: item.lastAnnotator,
            annotationValues: item.annotationValues,
            annotatedAt: item.annotatedAt,
            annotationTimes: item.annotationTimes,
            velocity: item.velocity,
            seenAt: item.seenAt,
            annotatedBy: item.annotatedBy,
            entitiesRelations: item.entitiesRelations,
            annotated: true,
          },
          $inc: {
            logCount: 1, // item changed so + 1
          },
        },
      },
    })),
    { ordered: false }
  )
}

export const convertToS3Url = async (item: ItemS3Document, config: S3) => {
  return new S3Client().getSignedUrl(
    decrypt(config.accessKeyId),
    decrypt(config.secretAccessKey),
    item.data.url,
    config.region
  )
}

export const saveItem = async (
  item: ItemDocument & {
    firstAnnotationVirtual?: boolean
    annotationsVirtual?: { inserted: Annotation[]; cancelled: Annotation[] }
  },
  user?: User
) => {
  await item.save(<mongoose.SaveOptions>{ _user: user })

  await mongoose
    .model('Project')
    .updateOne({ _id: item.project }, { $addToSet: { itemTags: item.tags } })
    .exec()

  if (item.annotationsVirtual && item.annotationsVirtual)
    await updateItemStats({
      _id: item._id,
      project: item.project,
      firstAnnotationVirtual: item.firstAnnotationVirtual || false,
      annotationsVirtual: item.annotationsVirtual,
    })
  await logTags(item)
  return item
}

export default {
  saveItem,
  browse,
  insertItemsBatch,
  updateItemsBatch,
  updateItemsTags,
  toCompositeUuid,
  findItemsByCompositeUuid,
  findItemByCompositeUuid,
  transformLineToItem,
  updateHighlights,
  updateItemsAfterBulkAnnotation,
  updateItemStats,
  convertToS3Url,
  filterAnnotationValues,
  calculateAnnotationTimesAndVelocity,
}
