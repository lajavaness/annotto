import express from 'express'
import { logger } from './logger'

export class AnnottoError extends Error {
  code = 500

  infos: unknown
}

export const generateError = (
  errorObj: { message: string; code?: number; infos?: unknown; stack?: string },
  nestedError?: Error
) => {
  const err = new AnnottoError()
  err.message = errorObj.message
  err.code = errorObj.code || 500
  err.infos = errorObj.infos || ''
  err.stack += `${errorObj.stack ? errorObj.stack : ''}${nestedError ? `\nCaused by: ${nestedError.stack}` : ''}`

  return err
}

export const errorHandlerMiddleware = (
  err: AnnottoError,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const message = err.message || 'ERROR_HANDLING_REQUEST'
  const { infos } = err

  let { code } = err
  if (code < 200 || code > 500) code = 500

  logger.error(err)

  res.status(code).json({ code, message, infos })
  next()
}
