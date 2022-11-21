import express from 'express'
import queryBuilder, { CriteriaPayload, Paginate } from '../utils/query-builder'
import { Task } from '../db/models/tasks'
import { browse } from '../core/tasks'
import config from '../../config'

const { paginate, setCriteria, setParams } = queryBuilder('mongo')

const index = async (
  req: express.Request<{ projectId: string }, {}, {}, CriteriaPayload>,
  res: express.Response<Paginate<Task>>,
  next: express.NextFunction
) => {
  try {
    const criteria = setCriteria({ ...req.query, ...req.params }, config.search.tasks)
    const params = setParams(req.query, config.search.tasks)

    const data = await browse(criteria, params)

    res.status(200).json(paginate({ ...params, total: (req._project.tasks || []).length || 0 }, data))
  } catch (error) {
    next(error)
  }
}

export default {
  index,
}
