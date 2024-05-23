import express from 'express'
import _ from 'lodash'
import { generateError } from '../utils/error'
import ClientModel, { Client, ClientDocument } from '../db/models/clients'
import type { CriteriaPayload } from '../utils/query-builder'
import type { ParamsPayload } from '../utils/paginate'
import { setParams, paginate, setQuery, Paginate } from '../utils/paginate'

type CreatePayload = {
  name: string
  description?: string
  isActive?: boolean
}

type UpdatePayload = {
  name?: string
  description?: string
  isActive?: boolean
}

const findClient = async <T extends boolean>(clientId: string, lean?: T) => {
  const q = ClientModel.findById(clientId)
  const client = await (lean ? q.lean() : q)

  if (!client) {
    throw generateError({
      code: 404,
      message: 'ERROR_CLIENT_NOT_FOUND',
    })
  }
  return <T extends true ? Client : ClientDocument>client
}

const index = async (
  req: express.Request<{}, {}, {}, CriteriaPayload>,
  res: express.Response<Paginate<Client>>,
  next: express.NextFunction
) => {
  try {
    const criteria: Record<string, unknown> = {
      _id: Array.isArray(req.query.clientId) ? { $in: req.query.clientId } : req.query.clientId,
      name: Array.isArray(req.query.name) ? { $in: req.query.name } : req.query.name,
      isActive: Array.isArray(req.query.isActive) ? { $in: req.query.isActive } : req.query.name,
      /* eslint-disable no-nested-ternary */
      description: Array.isArray(req.query.description)
        ? { $in: req.query.description }
        : typeof req.query.description === 'string'
        ? new RegExp(req.query.description.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i')
        : undefined,
    }
    const params = setParams(<ParamsPayload>req.query, { limit: 100, orderBy: ['name'] })

    const [total, data] = await Promise.all([
      ClientModel.countDocuments(criteria),
      setQuery(ClientModel.find(criteria), params).lean(),
    ])

    res.status(200).json(paginate({ ...params, total }, data))
  } catch (error) {
    next(error)
  }
}

const getById = async (
  req: express.Request<{ clientId: string }>,
  res: express.Response<Client>,
  next: express.NextFunction
) => {
  try {
    const { clientId } = req.params
    const client = await findClient(clientId, true)

    res.status(200).json(client)
  } catch (error) {
    next(error)
  }
}

const create = async (
  req: express.Request<{}, {}, CreatePayload>,
  res: express.Response<Client>,
  next: express.NextFunction
) => {
  try {
    const client = new ClientModel(req.body)
    await client.save()
    res.status(201).json(client)
  } catch (error) {
    next(error)
  }
}

const update = async (
  req: express.Request<{ clientId: string }, {}, UpdatePayload>,
  res: express.Response<Client>,
  next: express.NextFunction
) => {
  try {
    const { clientId } = req.params
    const client = await findClient(clientId, false)

    const updated: ClientDocument = _.extend(client, req.body)
    await updated.save()

    res.status(200).json(updated)
  } catch (error) {
    next(error)
  }
}

const destroy = async (
  req: express.Request<{ clientId: string }>,
  res: express.Response<void>,
  next: express.NextFunction
) => {
  try {
    const { clientId } = req.params

    const destroyed = await ClientModel.findByIdAndDelete(clientId)

    if (!destroyed) {
      throw generateError({
        code: 404,
        message: 'ERROR_CLIENT_NOT_FOUND',
      })
    }

    res.status(200).end()
  } catch (error) {
    next(error)
  }
}

export default {
  index,
  getById,
  create,
  update,
  destroy,
}
