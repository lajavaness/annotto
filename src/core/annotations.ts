import mongoose from 'mongoose'
import { ExternalEntity, ExternalRelation, ImportEntryPayload, InternalEntity, InternalRelation, User } from '../types'
import AnnotationModel, { Annotation, AnnotationDocument } from '../db/models/annotations'
import { Item } from '../db/models/items'
import { Log } from '../db/models/logs'
import { Project } from '../db/models/projects'
import { Task } from '../db/models/tasks'
import { bulkInsertComments } from './comments'
import { updateItemsTags, updateItemsAfterBulkAnnotation, toCompositeUuid, findItemsByCompositeUuid } from './items'
import { saveLogs, logNewAnnotations, logRemoveAnnotations, genLogTagsPayloads } from './logs'
import { updateProjectStats, validateTasksAndAddObject } from './projects'
import { updateClassificationStats } from './tasks'

export const changeAnnotationsStatus = <T extends Annotation>(annotations: T[], status = 'cancelled') =>
  annotations.map((annotation) => {
    if (status === 'draft' || status === 'cancelled' || status === 'refused' || status === 'done') {
      annotation.status = status
    }
    return annotation
  })

const isSameClassification = (annotation: Annotation, payload: InternalEntity & { task?: Task }) =>
  payload.task && annotation.task._id.equals(payload.task._id)

const isSameNER = (annotation: Annotation, payload: InternalEntity) =>
  isSameClassification(annotation, payload) &&
  annotation.ner &&
  payload.ner &&
  payload.ner.start === annotation.ner.start &&
  payload.ner.end === annotation.ner.end

const isSameZone = (annotation: Annotation, payload: InternalEntity) => {
  const zone1CoordsSum = (annotation.zone || []).reduce((total, coords) => total + coords.x + coords.y, 0)
  const zone2CoordsSum = (payload.zone || []).reduce((total, coords) => total + coords.x + coords.y, 0)

  return isSameClassification(annotation, payload) && zone1CoordsSum === zone2CoordsSum
}

const isNewClassificationPayload = (payload: InternalEntity, annotations: Annotation[]) => {
  const classificationAnnotations = annotations.filter((annotation) => !annotation.ner && !annotation.zone)

  return (
    !payload.ner &&
    !payload.zone &&
    !classificationAnnotations.find((annotation) => isSameClassification(annotation, payload))
  )
}

const isNewNERPayload = (payload: InternalEntity, annotations: Annotation[]) => {
  const nerAnnotations = annotations.filter((annotation) => annotation.ner)

  return payload.ner && !nerAnnotations.find((annotation) => isSameNER(annotation, payload))
}

const isNewZonePayload = (payload: InternalEntity, annotations: Annotation[]) => {
  const zoneAnnotations = annotations.filter((annotation) => annotation.zone)

  return payload.zone && !zoneAnnotations.find((annotation) => isSameZone(annotation, payload))
}

const isNewTextPayload = (payload: InternalEntity, annotations: Annotation[]) => {
  const textAnnotations = annotations.filter((annotation) => annotation.text)

  return payload.text && !textAnnotations.find((annotation) => annotation.text === payload.text)
}

export const isClassificationAnnotationToCancel = (annotation: Annotation, payloads: InternalEntity[]) =>
  !annotation.ner &&
  !annotation.zone &&
  !payloads.find((payload) => !payload.ner && !payload.zone && isSameClassification(annotation, payload))

export const isNerAnnotationToCancel = (annotation: Annotation, payloads: InternalEntity[]) =>
  annotation.ner && !payloads.find((payload) => payload.ner && isSameNER(annotation, payload))

/*
  Zone annotation to cancel is one with different coordinates Sum
*/
export const isZoneAnnotationToCancel = (annotation: Annotation, payloads: InternalEntity[]) =>
  annotation.zone &&
  !payloads.find((payload) => {
    if (!payload.zone) return false

    return isSameClassification(annotation, payload) && isSameZone(annotation, payload)
  })

const isTextAnnotationToCancel = (annotation: Annotation, payloads: InternalEntity[]) =>
  annotation.text &&
  !payloads.find((payload) => {
    if (!payload.text) return false

    return isSameClassification(annotation, payload) && annotation.text === payload.text
  })

const filterAnnotationsToUpdate = async (itemIds: mongoose.Types.ObjectId[], newAnnotations: InternalEntity[]) => {
  const annotations = await AnnotationModel.find({ item: { $in: itemIds }, status: 'done' }).populate('task')

  const toCancel = changeAnnotationsStatus(
    annotations.filter(
      (annotation) =>
        isClassificationAnnotationToCancel(annotation, newAnnotations) ||
        isNerAnnotationToCancel(annotation, newAnnotations) ||
        isZoneAnnotationToCancel(annotation, newAnnotations) ||
        isTextAnnotationToCancel(annotation, newAnnotations)
    )
  )

  const toInsert = newAnnotations
    .filter(
      (annotation) =>
        isNewClassificationPayload(annotation, annotations) ||
        isNewNERPayload(annotation, annotations) ||
        isNewZonePayload(annotation, annotations) ||
        isNewTextPayload(annotation, annotations)
    )
    .map((a) => new AnnotationModel(a))

  return { toInsert, toCancel }
}

/**
 * Avoids looking twice at an item in an array.
 * Divides by 1000 the time it takes to run registerAnnotationLogs.
 * @param {*} array The array.
 * @param {*} itemId The itemId.
 * @returns {Array} The array without unused items.
 */
const filterAndRemove = (array: (Annotation & { _itemId?: string })[], itemId: mongoose.Types.ObjectId) => {
  const out: (Annotation & { _itemId?: string })[] = []
  const keep: (Annotation & { _itemId?: string })[] = []
  const strItemId = itemId.toString()
  array.forEach((elem) => {
    // ObjectId.equals() is really slow, use a stringified version instead and cache it
    if (!elem._itemId) {
      elem._itemId = elem.item.toString()
    }
    if (elem._itemId === strItemId) {
      out.push(elem)
    } else {
      keep.push(elem)
    }
  })
  array.length = 0
  array.push(...keep)
  return out
}

const registerAnnotationLogs = (
  itemIds: mongoose.Types.ObjectId[],
  toInsert: Annotation[],
  toCancel: Annotation[],
  user: User,
  project: Project
) => {
  const logs: Log[] = []
  const perItem: {
    itemId: mongoose.Types.ObjectId
    inserted: Annotation[]
    cancelled: Annotation[]
  }[] = []
  const toInsertCopy = [...toInsert]
  const toCancelCopy = [...toCancel]
  itemIds.forEach((itemId) => {
    const inserted = filterAndRemove(toInsertCopy, itemId)
    if (inserted.length) {
      logs.push(logNewAnnotations(inserted, itemId, user, project).toObject({ depopulate: true }))
    }

    const cancelled = filterAndRemove(toCancelCopy, itemId)
    if (cancelled.length) {
      logs.push(logRemoveAnnotations(cancelled, itemId, user, project).toObject({ depopulate: true }))
    }
    perItem.push({ itemId, cancelled, inserted })
  })
  return { logs, perItem }
}

const bulkWriteAnnotations = (toInsert: AnnotationDocument[], toCancel: AnnotationDocument[]) =>
  AnnotationModel.collection.bulkWrite(
    [
      ...toInsert.map((annotation) => ({
        insertOne: { document: annotation.toObject({ depopulate: true }) },
      })),
      {
        updateMany: {
          filter: { _id: { $in: toCancel.map((a) => a._id) } },
          update: { $set: { status: 'cancelled' } },
        },
      },
    ],
    { ordered: false }
  )

const updateStats = (
  projectId: mongoose.Types.ObjectId,
  items: Item[],
  perItem: {
    itemId: mongoose.Types.ObjectId
    inserted: Annotation[]
    cancelled: Annotation[]
  }[]
) =>
  Promise.all([updateProjectStats(projectId, items, true), updateClassificationStats(projectId, items.length, perItem)])

const genLogTagsMultipleItems = (items: Item[]) => items.flatMap((item) => genLogTagsPayloads(item))

/**
 * Bulk insert or update annotations.
 * @param {{item: {_id: object}, annotations: object[]}[]} payloads The payloads.
 * @param {object} user The user.
 * @param {object} project The project.
 */
const bulkInsertOrUpdateAnnotations = async (
  payloads: {
    item: Item
    annotations: InternalEntity[]
    seenAt: Date
    annotatedAt: Date
    lastAnnotator?: { email?: string }
  }[],
  user: User,
  project: Project
) => {
  const items = payloads.map((p) => p.item)
  const itemIds = payloads.map((p) => p.item._id)

  const oneAnnotationPerSlot = payloads.flatMap((p) =>
    p.annotations.map((annotation) => ({
      ...annotation,
      item: p.item._id,
      _user: user,
      project: project._id,
    }))
  )

  const { toInsert, toCancel } = await filterAnnotationsToUpdate(itemIds, oneAnnotationPerSlot)

  const { logs, perItem } = registerAnnotationLogs(itemIds, toInsert, toCancel, user, project)

  await Promise.all([
    bulkWriteAnnotations(toInsert, toCancel),
    saveLogs([...logs, ...genLogTagsMultipleItems(items)]),
    updateItemsAfterBulkAnnotation(items, perItem, payloads, user),
    updateStats(project._id, items, perItem),
  ])
}

export const insertOrUpdateAnnotations = async (
  payloads: (InternalEntity & { item?: mongoose.Types.ObjectId; user?: User; project?: Project })[],
  itemId: mongoose.Types.ObjectId,
  params: { _user: User; project: Project }
) => {
  payloads.forEach((p) => {
    p.item = itemId
    p.user = params._user
    p.project = params.project
  })

  const { toInsert, toCancel } = await filterAnnotationsToUpdate([itemId], payloads)

  const { logs } = registerAnnotationLogs([itemId], toInsert, toCancel, params._user, params.project)

  return Promise.all([
    Promise.all(toInsert.map((annotation) => annotation.save(<mongoose.SaveOptions>params))),
    Promise.all(toCancel.map((annotation) => annotation.save(<mongoose.SaveOptions>params))),
    saveLogs(logs),
  ])
}

/**
 * @typedef {object} ExternalEntity
 * @prop {string} value
 * @prop {object} [coords]
 * @prop {number} [start_char]
 * @prop {number} [end_char]
 * @prop {number} [ent_id]
 */

/**
 * @typedef {object} InternalEntity
 * @prop {string} value
 * @prop {object} [zone]
 * @prop {{ start: number, end: number, ent_id: number }} [ner]
 */

/**
 * @typedef {object} ExternalRelation
 * @prop {string} value
 * @prop {number} src
 * @prop {number} dest
 */

/**
 * @typedef {object} InternalRelation
 * @prop {string} value
 * @prop {InternalEntity} src
 * @prop {InternalEntity} dest
 */

/**
 * Entity mapper function.
 * @param {function(ExternalEntity): InternalEntity} fn The function to map.
 * @returns {function({ entities: Array }): Array} The generated mapper.
 */
const entityMapper =
  (fn: (entity: ExternalEntity) => InternalEntity): ((arg: { entities: ExternalEntity[] }) => InternalEntity[]) =>
  ({ entities }) =>
    entities.map(fn)

/**
 * We don't need the name of the category to name an entity.
 * @param {('classifications'|'ner'|'zone')} type The type.
 * @returns {function({ labels: any[], entities: ExternalEntity[] }): InternalEntity[] } The return value.
 */
const categoryMapper = (type: string) => {
  switch (type) {
    case 'classifications':
      return ({ labels }: { labels: ExternalEntity[] }) => labels
    case 'ner':
      return entityMapper((entity) => ({
        value: entity.value,
        ner: {
          ent_id: entity.ent_id,
          start: entity.start_char || 0,
          end: entity.end_char || 0,
        },
      }))
    case 'zone':
      return entityMapper((entity) => ({
        value: entity.value,
        zone: entity.coords,
      }))
    case 'text':
      return entityMapper((entity) => ({
        value: entity.value,
        text: entity.text,
      }))
    default:
      return (): InternalEntity[] => []
  }
}

const relationsToEntitiesRelations = (relations: ExternalRelation[], annotations: InternalEntity[]) =>
  relations.reduce((internalRelations, relation: ExternalRelation) => {
    const src = annotations.find((a) => a.ner && a.ner.ent_id === relation.src)
    const dest = annotations.find((a) => a.ner && a.ner.ent_id === relation.dest)

    if (!src || !src.ner || !dest || !dest.ner || !relation.label) return internalRelations

    internalRelations.push({
      value: relation.label,
      src: {
        value: src.value,
        ner: { ...src.ner },
      },
      dest: {
        value: dest.value,
        ner: { ...dest.ner },
      },
    })

    return internalRelations
  }, <InternalRelation[]>[])

const deleteEntId = (annotations: InternalEntity[]) =>
  annotations.forEach((a) => {
    if (a.ner) {
      delete a.ner.ent_id
    }
  })

const formatAnnotationsForImport = (project: Project, entry: ImportEntryPayload) => {
  const types = Object.entries(entry.annotation)
  const entitiesRelations: InternalRelation[] = []

  const annotations = types.flatMap(([type, categories]) => {
    let tmpRelations
    if (Array.isArray(categories.relations)) {
      tmpRelations = categories.relations
      delete categories.relations
    }

    const parsed = Object.values(categories).flatMap(categoryMapper(type))

    if (tmpRelations) {
      entitiesRelations.push(...relationsToEntitiesRelations(tmpRelations, parsed))
    }

    // ent_id is not used internally, we delete it after use
    // because entitiesRelations contain references to src and dest, it will also be
    // deleted here
    deleteEntId(parsed)

    return parsed
  })
  entitiesRelations.forEach((e) => deleteEntId([e.src, e.dest]))

  return {
    uuid: entry.item.uuid,
    compositeUuid: toCompositeUuid(project, entry.item),
    seenAt: new Date(entry.itemMetadata.seenAt),
    annotatedAt: new Date(entry.annotationMetadata.annotatedAt),
    lastAnnotator: { email: entry.annotationMetadata.annotatedBy },
    tags: entry.markers || entry.tags,
    comments: entry.comments,
    entitiesRelations,
    annotations,
  }
}

const findRelationWithProps = (payload: InternalEntity) => (annotation: ExternalEntity) =>
  payload.value === annotation.value &&
  payload.ner &&
  payload.ner.start === annotation.start_char &&
  payload.ner.end === annotation.end_char

export const formatNerRelations = (
  doc: Item,
  annotations: { ner?: { [category: string]: { entities: { ent_id: number }[] } } | { relations: ExternalRelation[] } }
) => {
  if (!annotations.ner) {
    return annotations
  }

  const ner = Object.values(annotations.ner)

  annotations.ner.relations = doc.entitiesRelations
    .map((relationPayload) => {
      const output: {
        label: string
        src?: number
        dest?: number
      } = {
        label: relationPayload.value,
      }

      for (const category of ner) {
        const src = category.entities.find(findRelationWithProps(relationPayload.src))
        const dest = category.entities.find(findRelationWithProps(relationPayload.dest))

        if (src) output.src = src.ent_id
        if (dest) output.dest = dest.ent_id
        if (output.src && output.dest) {
          break
        }
      }

      return output
    })
    .filter((r) => typeof r.src === 'number' && typeof r.dest === 'number')

  return annotations
}

const getCategoryFormatFromType = (
  type: string
): { labels: ExternalEntity[] } | { entities: ExternalEntity[] } | undefined => {
  switch (type) {
    case 'classifications':
      return { labels: [] }
    case 'zone':
    case 'ner':
    case 'text':
      return { entities: [] }
    default:
      return undefined
  }
}

const createAnnotationObject = (
  obj: {
    [type: string]: {
      [category: string]: { labels: ExternalEntity[] } | { entities: ExternalEntity[] }
    }
  },
  type: string,
  category: string
) => {
  if (!obj[type]) obj[type] = {}

  if (!obj[type][category]) {
    const categoryFormatFromType = getCategoryFormatFromType(type)
    if (categoryFormatFromType) {
      obj[type][category] = categoryFormatFromType
    }
  }
  return obj[type][category]
}

export const formatAnnotationsForExport = (annotations: Annotation[], isOld = false) => {
  let nerRelationIndex = 0

  return annotations.reduce((output, annotation) => {
    const { category, type } = annotation.task

    const curr = createAnnotationObject(output, type, category)

    let entity: {
      value: string
      createdAt?: Date
      updatedAt?: Date
      start_char?: number
      end_char?: number
      ent_id?: number
      coords?: { x: number; y: number }[]
      text?: string
    } = {
      value: annotation.task.value,
    }

    if (isOld) {
      entity.createdAt = annotation.createdAt
      entity.updatedAt = annotation.updatedAt
    }

    if (type === 'classifications') {
      if ('labels' in curr) {
        curr.labels.push(entity)
      }
      return output
    }

    const field = annotation[type as keyof Annotation]
    switch (type) {
      case 'ner':
        entity = {
          ...entity,
          start_char: field.start,
          end_char: field.end,
          ent_id: nerRelationIndex++,
        }
        break
      case 'zone':
        entity.coords = field
        break
      case 'text':
        entity.text = field
        break
      default:
        break
    }

    if ('entities' in curr) {
      curr.entities.push(entity)
    }
    return output
  }, {})
}

const addItemsToAnnotations = <A extends { compositeUuid: string }, I extends { compositeUuid: string }>(
  annotations: A[],
  items: I[]
) => annotations.map((a) => ({ ...a, item: items.find((item) => item.compositeUuid === a.compositeUuid) }))

const addEntitiesRelationsToItems = (
  annotations: { item: { entitiesRelations: InternalRelation[] }; entitiesRelations?: InternalRelation[] }[]
) => {
  annotations.forEach((a) => {
    if (a.entitiesRelations) {
      a.item.entitiesRelations = a.entitiesRelations
      delete a.entitiesRelations
    }
  })
}

const removeAnnotationsWithNoItem = <A extends { uuid: string; item?: Item }>(
  annotations: A[],
  uuidNotFound: string[]
) =>
  annotations.filter((a) => {
    if (!a.item) uuidNotFound.push(a.uuid)
    return a.item
  })

/**
 * Insert a batch of annotations.
 * @param {Project} project Project model.
 * @param {Array<Annotations>} batch .
 * @param {User} user .
 * @param {{inserted: number, uuidNotFound: Array<string>}} response .
 * @param {number} response.inserted .
 * @param {string[]} response.uuidNotFound .
 * @returns {Promise<void>}
 */
export const insertAnnotationsBatch = async (
  project: Project,
  batch: ImportEntryPayload[],
  user: User,
  response: { inserted: number; uuidNotFound: string[] }
) => {
  let annotationsToCreate = batch.map((line) => formatAnnotationsForImport(project, line))

  const items = await findItemsByCompositeUuid(annotationsToCreate.map(({ compositeUuid }) => compositeUuid))

  annotationsToCreate = addItemsToAnnotations(annotationsToCreate, items)
  annotationsToCreate = removeAnnotationsWithNoItem(annotationsToCreate, response.uuidNotFound)

  if (!annotationsToCreate.length) return

  type AnnotationsToCreateWithItem = typeof annotationsToCreate[0] & { item: Item }

  addEntitiesRelationsToItems(annotationsToCreate as AnnotationsToCreateWithItem[])

  annotationsToCreate.forEach((item) => validateTasksAndAddObject(project, item))

  await Promise.all([
    bulkInsertOrUpdateAnnotations(annotationsToCreate as AnnotationsToCreateWithItem[], user, project),
    bulkInsertComments(annotationsToCreate as AnnotationsToCreateWithItem[], project._id),
    updateItemsTags(annotationsToCreate),
  ])

  response.inserted += batch.length
}

export default {
  changeAnnotationsStatus,
  insertAnnotationsBatch,
  insertOrUpdateAnnotations,
  isClassificationAnnotationToCancel,
  isNerAnnotationToCancel,
  isZoneAnnotationToCancel,
  formatAnnotationsForExport,
  formatNerRelations,
}
