import express from 'express'
import { Task } from '../db/models/tasks'
import { browse } from '../core/tasks'
import { paginate } from '../utils/paginate'
import type { Paginate } from '../utils/paginate'
import { setParams } from '../utils/query'
import type { ParamsPayload } from '../utils/query'

const index = async (
  req: express.Request<{ projectId: string }, {}, {}, ParamsPayload>,
  res: express.Response<Paginate<Task>>,
  next: express.NextFunction
) => {
  try {
    const queryParams: { projectId: string } & ParamsPayload = { ...req.query, ...req.params }
    const criteria: Record<string, unknown> = {
      _id: Array.isArray(queryParams.classificationId)
        ? { $in: queryParams.classificationId }
        : queryParams.classificationId,
      project: Array.isArray(queryParams.projectId) ? { $in: queryParams.projectId } : queryParams.projectId,
    }
    const params = setParams(<ParamsPayload>req.query, {
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
