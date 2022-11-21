import express from 'express'
import { Schema } from 'joi'
import { logger } from '../utils/logger'

/**
 * Schema validation middleware used to validate express payload and query. This methods takes a schema and validate it and throw an error
 * in case of any error. Otherwise it continues with  the next middleware.
 * @param {object} params The schema to validate the query or body.
 * @param {Schema} [params.schemaQuery] .
 * @param {Schema} [params.schemaBody] .
 * @param {Schema} [params.schemaParams] .
 * @returns {(function(*=, *, *): (*))|*} .
 */
export const schemaValidationMiddleware =
  ({ schemaQuery, schemaBody, schemaParams }: { schemaQuery?: Schema; schemaBody?: Schema; schemaParams?: Schema }) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { error: errorQuery = undefined } = { ...schemaQuery?.validate(req.query) }
    const { error: errorBody = undefined } = { ...schemaBody?.validate(req.body) }
    const { error: errorParams = undefined } = { ...schemaParams?.validate(req.params) }
    if (errorQuery || errorBody || errorParams) {
      const error = errorQuery || errorBody || errorParams
      logger.error(error)
      return res.status(400).send({
        code: 400,
        message: 'ERROR_CLIENT_VALIDATION',
        infos: error && error.details,
      })
    }

    return next()
  }

export default { schemaValidationMiddleware }
