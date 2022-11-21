import Joi from 'joi'

export const createBatchSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
})
