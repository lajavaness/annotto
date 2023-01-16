import { createReadStream, ReadStream } from 'fs'
import Joi from 'joi'
import { generateError } from '../../utils/error'
import { FileError, generateFileError } from './error'
import itemSchemas from '../../router/validation/item'

const jsonLinesErrors = async <T>(file: { path: string }, promise: Promise<T>) => {
  try {
    // await instead of return is important to catch errors in this function
    const result = await promise
    return result
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Could not parse row')) {
      throw generateError(
        {
          code: 400,
          message: 'ERROR_PROJECT_VALIDATION',
          infos: `Invalid JSON (${file.path}:${error instanceof FileError ? error.lineNumber : 'Invalid FileError'})`,
        },
        error
      )
    }
    throw generateError(
      {
        code: 400,
        message: 'ERROR_PROJECT_VALIDATION',
        infos: `Invalid format (${file.path}:${error instanceof FileError ? error.lineNumber : 'Invalid FileError'})`,
      },
      error instanceof Error ? error : undefined
    )
  }
}

export const importJsonLines = async <T extends Record<string, unknown>, U>({
  file,
  handler,
  ...options
}: T & {
  file: { path: string }
  handler: (arg: Omit<T, 'file' | 'handler'> & { stream: ReadStream }) => Promise<U>
}) => {
  const stream = createReadStream(file.path)
  return jsonLinesErrors(file, handler({ ...options, stream }))
}

export const validateItem = <T>(item: T, projectType: string, lineNumber: number) => {
  let validation: Joi.ValidationResult

  switch (projectType) {
    case 'text': {
      validation = itemSchemas.jsonlinesItemTextSchema.validate(item)
      break
    }
    case 'image': {
      validation = itemSchemas.jsonlinesItemImageSchema.validate(item)
      break
    }
    case 'video': {
      validation = itemSchemas.jsonlinesItemVideoSchema.validate(item)
      break
    }
    case 'audio': {
      validation = itemSchemas.jsonlinesItemAudioSchema.validate(item)
      break
    }
    case 'html': {
      validation = itemSchemas.jsonlinesItemHtmlSchema.validate(item)
      break
    }
    default: {
      throw generateFileError({
        message: `Invalid project type`,
        lineNumber,
      })
    }
  }

  if (validation && validation.error) {
    throw generateFileError({
      message: validation.error.details[0].message,
      lineNumber,
    })
  }
}

export const validateAnnotation = <T>(annotation: T, lineNumber: number) => {
  const validation = itemSchemas.jsonlinesAnnotationImportSchema.validate(annotation)

  if (validation && validation.error) {
    throw generateFileError({
      message: validation.error.details[0].message,
      lineNumber,
    })
  }
}

export const validatePrediction = async <T, U>(prediction: T, tasks: U[], lineNumber: number) => {
  try {
    await itemSchemas.jsonlinesPredictionsSchema.validateAsync(prediction, { context: { tasks } })
  } catch (error) {
    throw generateFileError({
      message: error instanceof Error ? error.message : 'Invalid Error',
      lineNumber,
    })
  }
}
