import express from 'express'
import CommentModel, { Comment } from '../db/models/comments'
import { saveComment } from '../core/comments'
import { paginate, getPaginationParams } from '../utils/paginate'
import type { Paginate, QueryPayload } from '../utils/paginate'
import * as mongooseUtils from '../utils/mongoose'

type CreatePayload = {
  comment: string
  item?: string
  batch?: string
}

const index = async (
  req: express.Request<{ projectId: string }, {}, {}, QueryPayload>,
  res: express.Response<Paginate<Comment>>,
  next: express.NextFunction
) => {
  try {
    const criteria = mongooseUtils.removeUndefinedFields({
      comment: mongooseUtils.eq(req.query.comment),
      item: mongooseUtils.eq(req.query.itemId),
      batch: mongooseUtils.eq(req.query.batchId),
      user: mongooseUtils.eq(req.query.userId),
      createdAt: mongooseUtils.eq(req.query.createdAt),
    })
    const params = getPaginationParams(<QueryPayload>req.query, { limit: 100, orderBy: ['-createdAt'] })

    const [total, data] = await Promise.all([
      CommentModel.countDocuments(criteria),
      CommentModel.find(criteria).sort(params.sort).limit(params.limit).skip(params.skip).select(params.select),
    ])

    res.status(200).json(paginate({ ...params, total }, data))
  } catch (error) {
    next(error)
  }
}

const create = async (
  req: express.Request<{ projectId: string }, {}, CreatePayload>,
  res: express.Response<Paginate<Comment>>,
  next: express.NextFunction
) => {
  try {
    const comment = new CommentModel({ ...req.body, project: req._project._id })
    await saveComment(comment, req._user)

    index(<express.Request<{ projectId: string }, {}, {}, QueryPayload>>req, res, next)
  } catch (error) {
    next(error)
  }
}

export default {
  index,
  create,
}
