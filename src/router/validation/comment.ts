import Joi from 'joi'
import { checkObjectId } from './utils'

export const createCommentSchema = Joi.object({
  comment: Joi.string().required(),
  item: Joi.string().custom(checkObjectId),
  project: Joi.string().custom(checkObjectId),
  batch: Joi.string().custom(checkObjectId),
})
