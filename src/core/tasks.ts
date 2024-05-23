import mongoose from 'mongoose'
import { TaskPayload } from '../types'
import { generateError } from '../utils/error'
import TaskModel, { Task } from '../db/models/tasks'
import ProjectModel, { Project } from '../db/models/projects'
import { Annotation } from '../db/models/annotations'
import { setQuery, QueryPayload } from '../utils/paginate'

export const browse = (criteria: Record<string, unknown> = {}, params: QueryPayload = {}) => {
  const q = TaskModel.find(criteria)
  setQuery(q, params)

  return q.lean()
}

/**
 * @typedef {object} Classif
 */

/**
 * @typedef {object} ClassificationType
 * @property {string} name
 * @property {number} min
 * @property {number} max
 * @property {Classif[]} values
 */

/**
 * @typedef {Object<string, ClassificationType[]>} ClassificationTree
 */

/**
 * Update all project's task stat, for new ( as in : task was not annotated ) and canceled annotations
 * annotationCount: number of items annotated with the same task
 * annotationPourcent: percentage of annotations classified with a specific task.
 * @param {object} project The project.
 * @param {number} annotatedItemsCount The annotated items count.
 * @param {{itemId: object, inserted: object[], cancelled: object[]}[]} annotationsPerItem The annotations per item.
 * @returns {Promise} Nothing.
 */
export const updateClassificationStats = async (
  project: mongoose.Types.ObjectId | string,
  annotatedItemsCount: number,
  annotationsPerItem: {
    itemId: mongoose.Types.ObjectId
    inserted: Annotation[]
    cancelled: Annotation[]
  }[]
) => {
  const tasks = await TaskModel.find({ project }).select('annotationCount')

  const hasClassif = (annotations: Annotation[], classifId: mongoose.Types.ObjectId) =>
    annotations.filter((a) => a.task._id.equals(classifId))

  const toUpdate = tasks.map((c) => {
    // we only want to count an item once, so we substract its additions and substractions
    // if the result is > 0, we add 1, < 0, we substract 1
    const annotationCount = annotationsPerItem
      .map(({ inserted, cancelled }: { inserted: Annotation[]; cancelled: Annotation[] }) => {
        const sum = hasClassif(inserted, c._id).length - hasClassif(cancelled, c._id).length
        if (sum === 0) return 0
        if (sum >= 1) return 1
        return -1
      })
      .reduce((a, b) => a + b, c.annotationCount)

    return {
      updateOne: {
        filter: { _id: c._id },
        update: {
          annotationCount,
          annotationPourcent: annotatedItemsCount ? Math.ceil((annotationCount / annotatedItemsCount) * 100) : 0,
        },
      },
    }
  })

  return TaskModel.bulkWrite(toUpdate)
}

const update = (tasks: TaskPayload[]) =>
  Promise.all(
    tasks.map((task) => {
      const fieldsToUpdate = {
        category: task.category,
        min: task.min,
        max: task.max,
        color: task.color,
        hotkey: task.hotkey,
        description: task.description,
        exposed: task.exposed,
        label: task.label,
      }
      return TaskModel.updateOne({ _id: task._id }, fieldsToUpdate)
    })
  )

/*
  Parse front end task payload ( with string values in .parents array )
  Parents to create is one not pushed yet in document project.tasks
*/
const createTasksByProject = async (project: Project, newClassificationsPayload: TaskPayload[]) => {
  const tasksToCreate = newClassificationsPayload.filter(
    (newTask) => !project.tasks.find((oneTask) => oneTask.value === newTask.value)
  )

  // Again Create tasks in series to avoid race condition between concurrent identical parent creation
  for (const t of tasksToCreate) {
    const doc = new TaskModel({
      project: project._id,
      ...t,
    })
    doc.save()
    project.tasks.push(doc)
  }
}

/*
  Takes array of tasks, update the ones with _id, create the others ( recursively if their parent need to be created )
*/
const createAndUpdate = async (
  currentClassifications: Task[],
  classificationsPayload: TaskPayload[] = [],
  projectId: mongoose.Types.ObjectId | string | undefined = undefined
) => {
  const classificationToUpdate = classificationsPayload.filter((task) => task._id)

  // Checks that all parents.value of req.body.tasks exist in current tasks
  // or in one to be created
  const parentDoesNotExist = classificationsPayload
    .filter((classif) => Array.isArray(classif.parents))
    .find((classif) =>
      (classif.parents || []).find((parentValue) => {
        const parentIsNotInCurrent = !currentClassifications.find((c) => c.value === parentValue)
        const parentIsNotInNew = !classificationsPayload.some((payload) => payload.value === parentValue)

        return parentIsNotInCurrent && parentIsNotInNew
      })
    )

  if (parentDoesNotExist) {
    throw generateError({
      code: 400,
      message: 'ERROR_PROJECT_UPDATE_WRONG_PARENT',
      infos: JSON.stringify(parentDoesNotExist),
    })
  }

  await update(classificationToUpdate)

  const project = await ProjectModel.findOne({ _id: projectId }).populate('tasks').select('+s3')

  const newClassifications = classificationsPayload.filter((task) => !task._id)

  // Create new tasks in series to avoid race condition between concurrent identical parent creation
  if (project) {
    await createTasksByProject(project, newClassifications)
  }

  return project
}

export default {
  browse,
  updateClassificationStats,
  createAndUpdate,
}
