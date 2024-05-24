import express from 'express'
import mongoose from 'mongoose'
import AnnotationModel from '../db/models/annotations'
import LogModel, { Log } from '../db/models/logs'
import TaskModel from '../db/models/tasks'
import type { Paginate } from '../utils/paginate'
import { paginate } from '../utils/paginate'
import type { ParamsPayload } from '../utils/query'
import { setParams, cleanRecord } from '../utils/query'
import { mongooseEq, mongooseRegexp } from '../utils/mongoose'

const index = async (
  req: express.Request<{ projectId: string }, {}, {}, ParamsPayload>,
  res: express.Response<Paginate<Log>>,
  next: express.NextFunction
) => {
  try {
    const queryParams: ParamsPayload = {
      ...req.query,
      ...req.params,
    }
    const criteria = cleanRecord({
      comment: mongooseEq(queryParams.comment),
      commentType: mongooseEq(queryParams.commentType),
      projectType: mongooseEq(queryParams.projectType),
      missionType: mongooseEq(queryParams.missionType),
      createdAt: mongooseEq(queryParams.createdAt),
      item: mongooseEq(queryParams.itemId),
      project: mongooseEq(queryParams.projectId),
      batch: mongooseEq(queryParams.batchId),
      user: mongooseEq(queryParams.userId),
      type: mongooseRegexp(queryParams.type),
    })
    const params = setParams(<ParamsPayload>req.query, {
      orderBy: ['-createdAt'],
      limit: 100,
    })

    Object.keys(criteria)
      .filter((key) => typeof criteria[key] === 'string' && mongoose.Types.ObjectId.isValid(<string>criteria[key]))
      .forEach((key) => {
        criteria[key] = new mongoose.Types.ObjectId(<string>criteria[key])
      })

    const limits = []

    if (params.skip) {
      limits.push({ $skip: params.skip })
    }

    if (params.limit) {
      limits.push({ $limit: params.limit })
    }

    // sort should be after skip and limit to avoid sorting the whole collection
    if (params.sort) {
      const sort: { [field: string]: 1 | -1 } = {}
      Object.keys(params.sort).forEach((key) => {
        if (params.sort[key] === 'desc') sort[key] = -1
        else if (params.sort[key] === 'asc') sort[key] = 1
      })

      limits.push({ $sort: sort })
    }

    const pipeline = [
      {
        $match: criteria,
      },
      ...limits,
      {
        $lookup: {
          from: AnnotationModel.collection.collectionName,
          localField: 'annotations',
          foreignField: '_id',
          as: 'annotations',
        },
      },
      {
        $project: {
          _id: 0,
          relations: 1,
          tags: 1,
          type: 1,
          item: 1,
          'user.firstName': 1,
          'user.lastName': 1,
          commentMessage: 1,
          createdAt: 1,
          'annotations._id': 1,
          'annotations.task': 1,
        },
      },
    ]

    const [total, tasks, logs] = await Promise.all([
      LogModel.countDocuments(criteria),
      TaskModel.find({ project: req.params.projectId }).select('type label'),
      LogModel.aggregate<Log>(pipeline),
    ])

    logs.forEach((log) => {
      log.annotations.forEach((annotation) => {
        annotation.task = tasks.find((c) => c._id.equals(annotation.task))
      })
    })

    res.status(200).json(paginate({ ...params, total }, logs))
  } catch (error) {
    next(error)
  }
}

export default {
  index,
}
