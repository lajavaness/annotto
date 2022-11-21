import { InternalEntity, InternalRelation, User } from '../../types'
import AnnotationModel, { Annotation } from '../../db/models/annotations'
import { ItemDocument } from '../../db/models/items'
import { ProjectDocument } from '../../db/models/projects'
import { insertOrUpdateAnnotations } from '../annotations'
import { validateTasksAndAddObject } from '../projects'
import { logRelations } from '../logs'
import { filterAnnotationValues, calculateAnnotationTimesAndVelocity, saveItem } from './index'

/**
 * Takes a list of annotations payload and create/cancel modified annotations
 * Create annotations and update annotated item document with stats and dates
 * ( date coming either from params for annotation imports or current date for
 * a new annotation ).
 * @param {*} item The item.
 * @param {*} payload The payload.
 * @param {Array.<InternalRelation.model>} payload.entitiesRelations .
 * @param {Array.<InternalEntity.model>}payload.annotations .
 * @param {*} payload.text .
 * @param {*} params The params.
 * @param {Date} params.annotatedAt .
 * @param {Project.model} params.project .
 * @param {User.model} params._user .
 * @returns {Promise.<object>} The annotation.
 */
const annotateItem = async (
  item: ItemDocument & {
    firstAnnotationVirtual?: boolean
    annotationsVirtual?: { inserted: Annotation[]; cancelled: Annotation[] }
  },
  payload: {
    entitiesRelations: InternalRelation[]
    annotations: InternalEntity[]
    text?: { value?: unknown }[]
  },
  params: { annotatedAt?: Date; project: ProjectDocument; _user: User }
) => {
  if (!params.project.populated('tasks')) {
    await params.project.populate('tasks').execPopulate()
  }
  const { project } = params

  const payloadWithClassificationId = validateTasksAndAddObject(project, payload)

  const [newAnnotations, canceledAnnotations] = await insertOrUpdateAnnotations(
    payloadWithClassificationId,
    item._id,
    params
  )

  // virtual passed by item post hook save to task.updateStats
  item.annotationsVirtual = { inserted: newAnnotations, cancelled: canceledAnnotations }

  if (payload.entitiesRelations) {
    await logRelations(item, payload.entitiesRelations, project, params)
    item.entitiesRelations = payload.entitiesRelations
  }

  if (
    (payload.annotations && payload.annotations.length) ||
    (payload.entitiesRelations && payload.entitiesRelations.length)
  ) {
    item.annotationValues = filterAnnotationValues(item.annotationValues, newAnnotations, canceledAnnotations)
    item.annotatedAt = params.annotatedAt || new Date()

    const result = calculateAnnotationTimesAndVelocity(item)

    if (result) {
      item.annotationTimes.push(result.annotationTime)
      item.velocity = result.velocity
    }

    if (!item.annotatedBy.includes(params._user.email)) {
      item.annotatedBy.push(params._user.email)
    }

    item.lastAnnotator = params._user
    if (!item.annotated) {
      item.annotated = true
      // virtual passed by item post save to project.updateStats
      item.firstAnnotationVirtual = true
    }
  }
  await saveItem(item, params._user)

  const result = await AnnotationModel.find({ item: item._id, status: 'done' })
  return result
}

export default annotateItem
