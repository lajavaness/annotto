import express from 'express'
import CommentModel, { Comment } from '../db/models/comments'
import { saveComment } from '../core/comments'
import { paginate } from '../utils/paginate'
import type { Paginate } from '../utils/paginate'
import { applyParamsToQuery, setParams } from '../utils/query'
import type { ParamsPayload } from '../utils/query'

type CreatePayload = {
  comment: string
  item?: string
  batch?: string
}

const index = async (
  req: express.Request<{ projectId: string }, {}, {}, ParamsPayload>,
  res: express.Response<Paginate<Comment>>,
  next: express.NextFunction
) => {
  try {
    const criteria: Record<string, unknown> = {
      comment: Array.isArray(req.query.comment) ? { $in: req.query.comment } : req.query.comment,
      item: Array.isArray(req.query.itemId) ? { $in: req.query.item } : req.query.item,
      batch: Array.isArray(req.query.batchId) ? { $in: req.query.itemId } : req.query.itemId,
      user: Array.isArray(req.query.userId) ? { $in: req.query.userId } : { $in: req.query.userId },
      createdAt: Array.isArray(req.query.createdAt) ? { $in: req.query.createdAt } : { $in: req.query.createdAt },
    }
    const params = setParams(<ParamsPayload>req.query, { limit: 100, orderBy: ['-createdAt'] })

    const [total, data] = await Promise.all([
      CommentModel.countDocuments(criteria),
      applyParamsToQuery(CommentModel.find(criteria), params),
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

    index(<express.Request<{ projectId: string }, {}, {}, ParamsPayload>>req, res, next)
  } catch (error) {
    next(error)
  }
}

export default {
  index,
  create,
}
