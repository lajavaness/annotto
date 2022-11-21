import Joi from 'joi'

export const createClientSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
  isActive: Joi.boolean(),
})

export const updateClientSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string(),
  isActive: Joi.boolean(),
})
