import express from 'express'
import queryBuilder, { Paginate, ParamsPayload } from '../utils/query-builder'
import CommentModel, { Comment } from '../db/models/comments'
import { saveComment } from '../core/comments'
import config from '../../config'

type CreatePayload = {
  comment: string
  item?: string
  batch?: string
}

const { paginate, setCriteria, setParams, setQuery } = queryBuilder('mongo')

const index = async (
  req: express.Request<{ projectId: string }, {}, {}, ParamsPayload>,
  res: express.Response<Paginate<Comment>>,
  next: express.NextFunction
) => {
  try {
    const criteria = setCriteria({ ...req.params }, config.search.comment)
    const params = setParams(req.query, config.search.comment)

    const [total, data] = await Promise.all([
      CommentModel.countDocuments(criteria),
      setQuery(CommentModel.find(criteria), params),
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

    index(<express.Request<{ projectId: string }>>req, res, next)
  } catch (error) {
    next(error)
  }
}

export default {
  index,
  create,
}
