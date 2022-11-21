import express from 'express'
import mongoose from 'mongoose'
import { FilterPayload, User } from '../types'
import { generateError } from '../utils/error'
import { getSimilarityUuids } from '../utils/external'
import FilterModel from '../db/models/filters'
import { reduceBodyInFilterQuery } from '../core/filters'
import config from '../../config'

type FilterResponse = {
  _id: mongoose.Types.ObjectId
  user: User
  project: mongoose.Types.ObjectId | null
  payload: Record<string, unknown>
  criteria: {
    project?: mongoose.Types.ObjectId
    $or?: Record<string, unknown>[]
    $and?: Record<string, unknown>[]
  }
}

type DeleteResponse = {
  ok?: number
  n?: number
  deletedCount?: number
}

type FilterItemConfig = {
  operators: {
    name: string
    param: { value: string | number | boolean | { from: number | string; to: number | string } | string[] }
    optionalParam?: {
      limit?: string
      neg_values?: string[]
      threshold?: string
    }
  }[]
  fields: {
    [field: string]: {
      key?: string
      operators: string[]
    }
  }
}

/*
  Building criteria query from payload, and save it as string to avoid mongo restriction
  on saving query $keys in objects.
  Returns the filter, with the criteria query in JSON
*/
const create = async (
  req: express.Request<{}, {}, FilterPayload[]>,
  res: express.Response<FilterResponse>,
  next: express.NextFunction
) => {
  try {
    const previousFilter = await FilterModel.findOne({
      project: req._project._id,
      'user._id': req._user._id,
    })
    if (previousFilter) {
      throw generateError({
        code: 400,
        message: 'ERROR_FILTER_EXIST_FOR_PROJECT_AND_USER',
        infos: previousFilter,
      })
    }

    const criteria = await reduceBodyInFilterQuery(req._project, req.body, getSimilarityUuids)

    const filter = new FilterModel({
      user: req._user,
      project: req._project._id,
      payload: req.body,
      criteria: JSON.stringify(criteria),
    })
    await filter.save()

    res.status(200).json({
      ...filter.toObject(),
      criteria,
    })
  } catch (error) {
    next(error)
  }
}

const update = async (
  req: express.Request<{}, {}, FilterPayload | FilterPayload[]>,
  res: express.Response<FilterResponse>,
  next: express.NextFunction
) => {
  try {
    let criteria

    if (Array.isArray(req.body) && req.body.length) {
      criteria = await reduceBodyInFilterQuery(req._project, req.body, getSimilarityUuids)
    } else {
      criteria = {
        project: undefined,
      }
    }

    // always ensure that the project key is safe to avoid security issues
    criteria.project = req._project._id

    const filter = await FilterModel.findOneAndUpdate(
      {
        'user._id': req._user._id,
        project: req._project._id,
      },
      {
        payload: req.body,
        criteria: JSON.stringify(criteria),
      },
      { new: true }
    )

    if (!filter) {
      res.status(200).end()
      return
    }

    res.status(200).json({
      ...filter.toObject(),
      criteria,
    })
  } catch (error) {
    next(error)
  }
}

const getByProjectAndUser = async (
  req: express.Request,
  res: express.Response<FilterResponse>,
  next: express.NextFunction
) => {
  try {
    const filter = await FilterModel.findOne({
      'user._id': req._user._id,
      project: req._project._id,
    })

    if (!filter) {
      res.status(200).end()
      return
    }

    res.status(200).json({
      ...filter.toObject(),
      criteria: JSON.parse(filter.criteria),
    })
  } catch (error) {
    next(error)
  }
}

const deleteFilter = async (
  req: express.Request,
  res: express.Response<DeleteResponse>,
  next: express.NextFunction
) => {
  try {
    const query = await FilterModel.deleteOne({
      'user._id': req._user._id,
      project: req._project._id,
    })
    res.status(200).json(query)
  } catch (error) {
    next(error)
  }
}

/*
  Return filters operators for FORM creation
  removing fields.key ( mongo name fields ), useless to front
*/
const getOperators = async (req: express.Request, res: express.Response<FilterItemConfig>) => {
  const filterItemConfig: FilterItemConfig = { ...config.filter.items }
  filterItemConfig.fields = Object.fromEntries(
    Object.entries(filterItemConfig.fields).map(([key, value]) => {
      return [key, { operators: value.operators }]
    })
  )
  res.status(200).json(filterItemConfig)
}

export default {
  create,
  update,
  getByProjectAndUser,
  delete: deleteFilter,
  getOperators,
}
