import Joi from 'joi'

const baseFilter = Joi.object({
  operator: Joi.string().required(),
  field: Joi.string().required(),
  value: Joi.any().required(),
  threshold: Joi.number(),
  limit: Joi.number(),
  neg_values: Joi.array().items(Joi.string()),
})

const orFilter = Joi.object({
  or: Joi.array().items(baseFilter),
})

export const filterBodySchema = Joi.array().items(Joi.alternatives().try(baseFilter, orFilter))
