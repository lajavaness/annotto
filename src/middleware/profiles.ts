import express from 'express'
import { generateError } from '../utils/error'
import ProfileModel, { Profile } from '../db/models/profiles'
import { paginate, getPaginationParams } from '../utils/paginate'
import type { Paginate, QueryPayload } from '../utils/paginate'
import * as mongooseUtils from '../utils/mongoose'

type UpdatePayload = { role: 'admin' | 'user' | 'dataScientist' }

const index = async (
  req: express.Request<QueryPayload, {}, {}, QueryPayload>,
  res: express.Response<Paginate<Profile>>,
  next: express.NextFunction
) => {
  try {
    const queryParams = {
      ...req.query,
      ...req.params,
    }
    const criteria = mongooseUtils.removeUndefinedFields({
      role: mongooseUtils.eq(queryParams.role),
      createdAt: mongooseUtils.eq(queryParams.createdAt),
    })
    const params = getPaginationParams(req.query, {
      orderBy: ['-createdAt'],
      limit: 100,
    })

    const [total, data] = await Promise.all([
      ProfileModel.countDocuments(criteria),
      ProfileModel.find(criteria).sort(params.sort).limit(params.limit).skip(params.skip).select(params.select),
    ])

    res.status(200).json(paginate({ ...params, total }, data))
  } catch (error) {
    next(error)
  }
}

const update = async (
  req: express.Request<{ profileId: string }, {}, UpdatePayload>,
  res: express.Response<Profile>,
  next: express.NextFunction
) => {
  try {
    if (!req.params.profileId) {
      throw generateError({
        code: 400,
        message: 'ERROR_PROFILE_QUERY_ID',
      })
    }

    const profile = await ProfileModel.findOne({ _id: req.params.profileId })

    if (!profile) {
      throw generateError({
        code: 400,
        message: 'ERROR_PROFILE_NOT_FOUND',
      })
    }
    if (req._user.profile && profile._id.equals(req._user.profile._id)) {
      throw generateError({
        code: 400,
        message: 'ERROR_PROFILE_CANNOT_UPDATE_OWN_PROFILE',
      })
    }

    if (req.query.role === 'user' || req.query.role === 'admin' || req.query.role === 'dataScientist') {
      profile.role = req.query.role
    }
    await profile.save()

    res.status(200).json(profile)
  } catch (error) {
    next(error)
  }

  res.status(200).end()
}

export default {
  index,
  update,
}
