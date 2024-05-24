import express from 'express'
import _ from 'lodash'
import { generateError } from '../utils/error'
import ClientModel, { Client, ClientDocument } from '../db/models/clients'
import {
  applyParamsToQuery,
  setParams,
  singleValueOrArrayToMongooseSelector,
  stringToRegExpOrUndefined,
} from '../utils/query'
import type { ParamsPayload } from '../utils/query'
import { Paginate, paginate } from '../utils/paginate'
import { booleanStringToBooleanOrUndefined } from '../utils/lfn'

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
  req: express.Request<{}, {}, {}, ParamsPayload>,
  res: express.Response<Paginate<Client>>,
  next: express.NextFunction
) => {
  try {
    const criteria: Record<string, unknown> = {
      _id: singleValueOrArrayToMongooseSelector(<string | string[] | undefined>req.query.clientId),
      name: singleValueOrArrayToMongooseSelector(<string | string[] | undefined>req.query.name),
      isActive: booleanStringToBooleanOrUndefined(<string | undefined>req.query.isActive),
      description: stringToRegExpOrUndefined(<string | undefined>req.query.description),
    }
    const params = setParams(req.query, { limit: 100, orderBy: ['name'] })

    const [total, data] = await Promise.all([
      ClientModel.countDocuments(criteria),
      applyParamsToQuery(ClientModel.find(criteria), params).lean(),
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
