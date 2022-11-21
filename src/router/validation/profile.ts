import Joi from 'joi'

export const rolesSchema = Joi.object({ role: Joi.string().valid('user', 'dataScientist', 'admin') })
