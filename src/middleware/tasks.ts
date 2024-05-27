import express from 'express'
import { Task } from '../db/models/tasks'
import { browse } from '../core/tasks'
import { paginate, getPaginationParams } from '../utils/paginate'
import type { Paginate, QueryPayload } from '../utils/paginate'
import * as mongooseUtils from '../utils/mongoose'

const index = async (
  req: express.Request<{ projectId: string }, {}, {}, QueryPayload>,
  res: express.Response<Paginate<Task>>,
  next: express.NextFunction
) => {
  try {
    const queryParams: QueryPayload = { ...req.query, ...req.params }
    const criteria = mongooseUtils.removeUndefinedFields({
      _id: mongooseUtils.eq(queryParams.classificationId),
      project: mongooseUtils.eq(queryParams.projectId),
    })
    const params = getPaginationParams(req.query, {
      orderBy: ['label'],
      limit: 100,
      select: {
        annotationCount: true,
        annotationPourcent: true,
        category: true,
        value: true,
        type: true,
        label: true,
        min: true,
        max: true,
      },
    })

    const data = await browse(criteria, params)

    res.status(200).json(paginate({ ...params, total: (req._project.tasks || []).length || 0 }, data))
  } catch (error) {
    next(error)
  }
}

export default {
  index,
}
