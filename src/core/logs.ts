import mongoose from 'mongoose'
import { isEqual } from 'lodash'
import { InternalEntity, InternalRelation, User } from '../types'
import { Annotation } from '../db/models/annotations'
import { Comment } from '../db/models/comments'
import ItemModel, { Item } from '../db/models/items'
import LogModel, { LogDocument } from '../db/models/logs'
import { Project, EntitiesRelation } from '../db/models/projects'

type IdOrObjectWithId = mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId }

type LogRelation = {
  src: InternalEntity
  dest: InternalEntity
  entitiesRelation: EntitiesRelation
}

const toId = (item: IdOrObjectWithId) => {
  if (typeof item === 'object' && '_id' in item) {
    return item._id
  }
  return item
}

/**
 * Don't update __v when saving logs.
 * @param {*} item The item.
 * @param {*} logCount The logCount.
 */
const updateLogCount = async (item?: IdOrObjectWithId, logCount?: number) => {
  if (!item) return
  const _id = toId(item)
  await ItemModel.collection.updateOne({ _id }, { $inc: { logCount } })
}

const splitLogCountPerItem = <T extends { item: mongoose.Types.ObjectId }>(logs: T[]) => {
  const perItem: { [id: string]: number } = {}
  for (const log of logs) {
    const id = toId(log.item).toString()
    if (!perItem[id]) {
      perItem[id] = 0
    }
    perItem[id]++
  }
  return Object.entries(perItem)
}

export const saveLogs = <T extends { item: mongoose.Types.ObjectId }>(logs: T[]) =>
  Promise.all([
    LogModel.insertMany(logs, { ordered: false }),
    ...splitLogCountPerItem(logs).map(([id, logCount]) => updateLogCount(new mongoose.Types.ObjectId(id), logCount)),
  ])

const saveLog = async (log: LogDocument) => {
  await log.save()
  await updateLogCount(log.item, 1)
  return log
}

export const logNewAnnotations = (
  annotations: Annotation[],
  item: mongoose.Types.ObjectId,
  user: User,
  project: Project
) =>
  new LogModel({
    type: 'annotation-add',
    project,
    user,
    item,
    annotations,
  })

export const logRemoveAnnotations = (
  annotations: Annotation[],
  item: mongoose.Types.ObjectId,
  user: User,
  project: Project
) =>
  new LogModel({
    type: 'annotation-remove',
    project,
    user,
    item,
    annotations,
  })

export const logComment = (comment: Comment) => {
  const log = {
    type: 'comment-add',
    user: comment.user,
    comment: comment._id,
    commentMessage: comment.comment,
    project: comment.project,
    item: comment.item,
    commentType: 'Create',
  }
  const nLog = new LogModel(log)
  return saveLog(nLog)
}

const diffFields = (prev: string[] = [], current: string[] = []) => {
  const diff = {
    added: current.filter((elem) => !prev.includes(elem)),
    deleted: prev.filter((elem) => !current.includes(elem)),
  }
  return diff
}

export const genLogTagsPayloads = (item: Item) => {
  const prev = item._original

  const tags = prev && Array.isArray(prev.tags) ? prev.tags : []
  const diff = diffFields(tags, item.tags || [])
  const logs = []

  if (diff.added.length) {
    logs.push({
      type: 'tags-add',
      item: item._id,
      project: item.project,
      user: item._user,
      tags: diff.added,
    })
  }

  if (diff.deleted.length) {
    logs.push({
      type: 'tags-remove',
      item: item._id,
      project: item.project,
      user: item._user,
      tags: diff.deleted,
    })
  }

  return logs
}

export const logTags = async (item: Item) => {
  return LogModel.insertMany(genLogTagsPayloads(item), { ordered: false })
}

/**
 * Compare item current entitiesRelations with payload to log added and removed relations.
 * When a diff is found, looks for relation object in project to create a log with the relation label
 * for UI to display.
 * @param {*} item The item.
 * @param {*} payloads The payloads.
 * @param {*} project The project.
 * @param {*} params The params.
 * @param {Project} params.project .
 * @param {User} params._user .
 */
export const logRelations = async (
  item: Item,
  payloads: InternalRelation[],
  project: Project,
  params: { project: Project; _user: User }
) => {
  const removedRelations = item.entitiesRelations.reduce((relations, currentRelation) => {
    const isStillPresent = payloads.find((payload) => isEqual(payload, currentRelation))

    if (!isStillPresent) {
      project.entitiesRelationsGroup.forEach((group) => {
        const entitiesRelation = group.values.find((relationObj) => relationObj.value === currentRelation.value)

        if (entitiesRelation) {
          relations.push({
            src: currentRelation.src,
            dest: currentRelation.dest,
            entitiesRelation,
          })
        }
      })
    }
    return relations
  }, <LogRelation[]>[])

  const addedRelations = payloads.reduce((relations, payload) => {
    const isPresent = item.entitiesRelations.find((currentRelation) => isEqual(currentRelation, payload))

    if (!isPresent) {
      project.entitiesRelationsGroup.forEach((group) => {
        const entitiesRelation = group.values.find((relationObj) => relationObj.value === payload.value)

        if (entitiesRelation) {
          relations.push({
            src: payload.src,
            dest: payload.dest,
            entitiesRelation,
          })
        }
      })
    }
    return relations
  }, <LogRelation[]>[])

  if (removedRelations.length) {
    const log = new LogModel({
      type: 'relation-remove',
      project: params.project,
      user: params._user,
      item,
      relations: removedRelations,
    })

    await saveLog(log)
  }
  if (addedRelations.length) {
    const log = new LogModel({
      type: 'relation-add',
      project: params.project,
      user: params._user,
      item,
      relations: addedRelations,
    })

    await saveLog(log)
  }
}

export const logProject = async (project: Project) => {
  if (project._wasNew) {
    const log = {
      type: 'project-add',
      user: project._user,
      project: project._id,
    }

    const nLog = new LogModel(log)

    return saveLog(nLog)
  }
  return null
}

export default {
  logNewAnnotations,
  logRemoveAnnotations,
  logComment,
  logTags,
  logRelations,
  logProject,
  genLogTagsPayloads,
  saveLogs,
}
