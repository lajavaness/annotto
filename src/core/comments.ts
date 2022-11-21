import mongoose from 'mongoose'
import { User } from '../types'
import CommentModel, { CommentDocument } from '../db/models/comments'
import ItemModel from '../db/models/items'
import LogModel from '../db/models/logs'
import ProjectModel from '../db/models/projects'
import { logComment } from './logs'

type AnnotationCommentsPayload = {
  item: {
    _id: mongoose.Types.ObjectId
  }
  comments?: {
    _id?: mongoose.Types.ObjectId
    comment: string
    user?: User
    updatedAt: Date
    createdAt: Date
  }[]
}

const bulkInsertCommentLogs = (annotations: AnnotationCommentsPayload[], projectId: mongoose.Types.ObjectId) => {
  const query = annotations.flatMap((a) =>
    a.comments
      ? a.comments.map((c) => ({
          type: 'comment-add',
          comment: c._id,
          commentMessage: c.comment,
          user: {
            email: c.user?.email,
            firstName: c.user?.firstName,
            lastName: c.user?.lastName,
          },
          item: a.item._id,
          project: projectId,
          createdAt: new Date(c.createdAt),
        }))
      : []
  )
  return LogModel.insertMany(query, { ordered: false })
}

export const bulkInsertComments = async (
  annotations: AnnotationCommentsPayload[],
  projectId: mongoose.Types.ObjectId
) => {
  const query = annotations.flatMap((a) =>
    a.comments
      ? a.comments.map((c) => {
          c._id = new mongoose.Types.ObjectId()
          return {
            _id: c._id,
            comment: c.comment,
            user: {
              email: c.user?.email,
              firstName: c.user?.firstName,
              lastName: c.user?.lastName,
            },
            item: a.item._id,
            project: projectId,
            updatedAt: c.updatedAt ? new Date(c.updatedAt) : undefined,
            createdAt: new Date(c.createdAt),
          }
        })
      : []
  )
  await CommentModel.insertMany(query, { ordered: false })
  return bulkInsertCommentLogs(annotations, projectId)
}

export const saveComment = async (comment: CommentDocument, user: User) => {
  await comment.save(<mongoose.SaveOptions>user)
  if (comment.item) {
    await ItemModel.findOneAndUpdate({ _id: comment.item }, { $inc: { commentCount: 1 } })
  }
  if (comment.project) {
    await ProjectModel.findOneAndUpdate({ _id: comment.project }, { $inc: { commentCount: 1 } })
  }
  await logComment(comment)
  return comment
}

export default {
  bulkInsertComments,
  saveComment,
}
