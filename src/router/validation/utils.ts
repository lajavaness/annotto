import Joi from 'joi'
import mongoose from 'mongoose'

export const checkObjectId = (value: string, helpers: Joi.CustomHelpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid')
  }
  return value
}

export const checkAnnotationsLengthWithRelations = (value: {
  annotations?: unknown[]
  entitiesRelations?: unknown[]
}) => {
  if (value.annotations && !value.annotations.length && value.entitiesRelations && value.entitiesRelations.length) {
    throw new Error('RELATION_WITH_EMPTY_ANNOTATIONS')
  }
}
