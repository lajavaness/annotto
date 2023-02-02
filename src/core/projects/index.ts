import mongoose from 'mongoose'
import { InternalEntity, InternalRelation, User } from '../../types'
import { encrypt } from '../../utils/crypto'
import { generateError } from '../../utils/error'
import AnnotationModel from '../../db/models/annotations'
import ClientModel from '../../db/models/clients'
import CommentModel from '../../db/models/comments'
import FilterModel from '../../db/models/filters'
import ItemModel, { Item } from '../../db/models/items'
import LogModel from '../../db/models/logs'
import ProjectModel, { Project, ProjectDocument } from '../../db/models/projects'
import TaskModel, { Task } from '../../db/models/tasks'
import UserService from '../../services/user'
import { logProject } from '../logs'

type ObjectIdOrString = mongoose.Types.ObjectId | string

const validateRelations = (project: Project, relationsPayload: InternalRelation[]) => {
  relationsPayload.forEach((relation) => {
    const src = project.tasks.find((c) => c.value === relation.src.value)
    const dest = project.tasks.find((c) => c.value === relation.dest.value)

    const relationLabel = project.entitiesRelationsGroup.some((group) =>
      group.values.some((label) => label.value === relation.value)
    )

    const cnt = project.entitiesRelationsGroup.map((group) => {
      const total = {
        name: group.name,
        count: 0,
        min: group.min,
        max: group.max,
      }
      relationsPayload.forEach((annotation) => {
        if (group.values.some((obj) => obj.value === annotation.value)) {
          total.count++
        }
      })

      return total
    })

    const noMinMatchGroup = cnt.find((group) => group && group.min && group.count < group.min)
    const noMaxMatchGroup = cnt.find((group) => group && group.max && group.count > group.max)

    if (noMinMatchGroup) {
      throw generateError({
        code: 400,
        message: 'TOO_FEW_RELATIONS_ANNOTATED',
        infos: `Group (${noMinMatchGroup.name}) require MIN : ${noMinMatchGroup.min} relations`,
      })
    }
    if (noMaxMatchGroup) {
      throw generateError({
        code: 400,
        message: 'TOO_MANY_RELATIONS_ANNOTATED',
        infos: `Group (${noMaxMatchGroup.name}) require MAX  : ${noMaxMatchGroup.min} relations`,
      })
    }
    if (!src) {
      throw generateError({
        code: 400,
        message: 'RELATION_SRC_NOT_FOUND',
        infos: `Relation src (${relation.src.value}) is not a project task`,
      })
    }
    if (!dest) {
      throw generateError({
        code: 400,
        message: 'RELATION_DEST_NOT_FOUND',
        infos: `Relation dest (${relation.dest.value}) is not a project task`,
      })
    }
    if (!relationLabel) {
      throw generateError({
        code: 400,
        message: 'RELATION_LABEL_NOT_FOUND',
        infos: `Relation label (${relation.value}) is not in any project entitiesRelationsGroup`,
      })
    }
  })
}

const validateAnnotations = (project: Project, annotationsPayload: InternalEntity[]) => {
  annotationsPayload.forEach((annotation) => {
    const task = project.tasks.find((c) => c.value === annotation.value)
    if (!task) {
      throw generateError({
        code: 404,
        message: 'CLASSIFICATION_NOT_FOUND',
        infos: `Classification ${annotation.value} is not a project task`,
      })
    }
  })
}

const validateCategories = (project: Project, annotationsPayload: InternalEntity[]) => {
  const categories: {
    [category: string]: {
      min: number
      max: number
      annotations: 0
    }
  } = project.tasks.reduce((obj, current) => {
    obj[current.category] = {
      min: current.min,
      max: current.max,
      annotations: 0,
    }
    return obj
  }, {})

  annotationsPayload.forEach((annotation) => {
    const { category } = project.tasks.find((c) => c.value === annotation.value)
    ++categories[category].annotations
  })

  Object.entries(categories).forEach(([key, value]) => {
    if (value.min && value.annotations < value.min) {
      throw generateError({
        code: 400,
        message: 'TOO_FEW_ANNOTATIONS',
        infos: `Min for this category ( ${key} ) is : ${value.min}`,
      })
    }

    if (value.max && value.annotations > value.max) {
      throw generateError({
        code: 400,
        message: 'TOO_MUCH_ANNOTATIONS',
        infos: `Max for this category ( ${key} ) is : ${value.max}`,
      })
    }
  })
}

const validateTextAnnotation = (project: Project, textAnnotations: { value?: unknown }[]) => {
  const wrongTask = textAnnotations.find(
    (textAnnotation) => !project.tasks.find((task) => textAnnotation.value === task.name)
  )

  if (wrongTask) {
    throw generateError({
      code: 400,
      message: 'TASK_NOT_FOUND',
      infos: `Text task (${wrongTask.value}) is not a project task`,
    })
  }
}

export const validateTasksAndAddObject = (
  project: Project,
  payload: {
    annotations?: (InternalEntity & { task?: Task })[]
    entitiesRelations?: InternalRelation[]
    text?: { value?: unknown }[]
  }
) => {
  if (payload.entitiesRelations) validateRelations(project, payload.entitiesRelations)
  if (payload.text) validateTextAnnotation(project, payload.text)
  if (payload.annotations) {
    validateAnnotations(project, payload.annotations)
    validateCategories(project, payload.annotations)
    payload.annotations.forEach((annotation) => {
      annotation.task = project.tasks.find((c) => c.value === annotation.value)
    })

    return payload.annotations
  }
  // return null // FIXME ? should we throw ?
  return []
}

export const updateItemCount = async (projectId: mongoose.Types.ObjectId) => {
  const itemCount = await ItemModel.countDocuments({ project: projectId })
  await ProjectModel.updateOne({ _id: projectId }, { itemCount })
  return itemCount
}

export const listUsers = async ({ projectId }: { projectId: ObjectIdOrString }) => {
  const project = await ProjectModel.findById(projectId).select('users admins dataScientists').lean()
  const emails: string[] = []
  if (project && project.users) emails.push(...project.users)
  if (project && project.admins) emails.push(...project.admins)
  if (project && project.dataScientists) emails.push(...project.dataScientists)

  if (!emails.length) {
    return []
  }

  const result = await UserService.find()

  return result
    .filter((oneUser) => emails.some((oneEmail) => oneEmail === oneUser.email))
    .map((user) => ({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    }))
}

export const getClient = async (clientName: string, { _user }: { _user: User }) => {
  const client = await ClientModel.findOne({ name: clientName })
  if (client) return client

  const newClient = new ClientModel({ name: clientName })
  return newClient.save(<mongoose.SaveOptions>{ _user })
}

export const saveProject = async (project: ProjectDocument, user: User) => {
  await project.save({ _user: user } as mongoose.SaveOptions)
  await logProject(project)
  return project
}

/*
  Adding creator in project admins, for non demo and when not already in config.admins
  Give tasks ids with already populated array to buildSpec()
*/
export const createProjectAndTasks = async ({ config, _user }: { config: Project; _user: User }) => {
  const projectId = new mongoose.Types.ObjectId()
  const admins = []
  const tasksToInsert = new Map()
  config.tasks?.forEach((task) => {
    const _id = new mongoose.Types.ObjectId()
    tasksToInsert.set(_id, {
      _id,
      project: projectId,
      description: task.description,
      color: task.color,
      value: task.value,
      hotkey: task.hotkey,
      label: task.label,
      type: task.type,
      conditions: task.conditions,
      category: task.category,
      exposed: task.exposed,
      min: task.min,
      max: task.max,
    })
  })

  try {
    await TaskModel.insertMany(Array.from(tasksToInsert.values()))

    const client = await getClient(config.client, { _user })

    admins.push(_user.email)
    if (config.admins) {
      const adminsWithoutCreator = config.admins.filter((user) => user !== _user.email)
      admins.push(...adminsWithoutCreator)
    }

    const projectPayload = {
      _id: projectId,
      name: config.name,
      type: config.type,
      defaultTags: config.defaultTags,
      description: config.description,
      guidelines: config.guidelines,
      admins,
      deadline: config.deadline,
      users: config.users,
      dataScientists: config.dataScientists,
      tasks: Array.from(tasksToInsert.keys()),
      similarityEndpoint: config.similarityEndpoint,
      highlights: config.highlights,
      showPredictions: config.showPredictions,
      prefillPredictions: config.prefillPredictions,
      filterPredictionsMinimum: config.filterPredictionsMinimum,
      entitiesRelationsGroup: config.entitiesRelationsGroup,
      client,
      s3: <{ accessKeyId: string; secretAccessKey: string } | undefined>undefined,
    }

    if (config.s3) {
      projectPayload.s3 = {
        accessKeyId: encrypt(config.s3.accessKeyId),
        secretAccessKey: encrypt(config.s3.secretAccessKey),
      }
    }

    const project = new ProjectModel(projectPayload)
    return saveProject(project, _user)
  } catch (err) {
    throw new Error(
      `Project cannot be saved: project: ${config.name}\n. Caused by ${
        err instanceof Error ? err.message : 'Invalid Error'
      }`
    )
  }
}

export const getProjectTags = async (id: ObjectIdOrString) => {
  const p = await ProjectModel.findById(id).select('defaultTags itemTags').lean()
  const itemTags = (p && p.itemTags) || []
  const defaultTags = (p && p.defaultTags) || []

  return [...defaultTags, ...itemTags]
}

export const removeCascade = async (projectId: ObjectIdOrString) => {
  const session = await mongoose.startSession()

  await session.withTransaction(async () => {
    await Promise.all([
      ProjectModel.deleteOne({ _id: projectId }, { session }),
      CommentModel.deleteMany({ project: projectId }, { session }),
      ItemModel.deleteMany({ project: projectId }, { session }),
      AnnotationModel.deleteMany({ project: projectId }, { session }),
      TaskModel.deleteMany({ project: projectId }, { session }),
      LogModel.deleteMany({ project: projectId }, { session }),
      FilterModel.deleteMany({ project: projectId }, { session }),
    ])
  })

  session.endSession()
}

/**
 * Velocity is the median of the annotations times.
 * @param {Array.<{ velocity: number }>} annotatedItems The annotated items.
 * @returns {number} The velocity.
 */
const getVelocity = (annotatedItems: Item[]) => {
  if (!annotatedItems.length) return null

  const velocities = annotatedItems.map((item) => item.velocity).sort((a, b) => (a || 0) - (b || 0))
  return velocities[Math.round((velocities.length - 1) / 2)]
}

const getProjectProgressionStats = (itemCount: number, velocity: number, annotatedCount: number) => {
  const unannotatedItemsCount = itemCount - annotatedCount
  const progress = Math.round((annotatedCount / itemCount) * 100)

  const remainingWork = unannotatedItemsCount ? Math.ceil((velocity * unannotatedItemsCount) / 3600) : 0

  return {
    progress,
    remainingWork,
  }
}

export const updateProjectStats = async (
  projectId: ObjectIdOrString,
  annotatedItems: Item[],
  isNewAnnotation: boolean
) => {
  const project = await ProjectModel.findById(projectId).select('itemCount')
  const itemCount = (project && project.itemCount) || 0

  const velocity = getVelocity(annotatedItems)
  // this.lastAnnotationTime = this.annotatedAt // this.annotatedAt is never set before calling updateStats()
  let other = {}
  if (isNewAnnotation) {
    other = getProjectProgressionStats(itemCount, velocity || 0, annotatedItems.length)
  }

  return ProjectModel.updateOne(
    { _id: projectId },
    {
      velocity: velocity || undefined,
      ...other,
    }
  )
}

export default {
  createProjectAndTasks,
  getClient,
  getProjectProgressionStats,
  getProjectTags,
  getVelocity,
  listUsers,
  removeCascade,
  saveProject,
  updateItemCount,
  updateProjectStats,
  validateTasksAndAddObject,
}
