export type MongooseFilter =
  | {
      $in?: string[]
    }
  | string
  | boolean
  | RegExp

export const eq = (str?: string | string[]): undefined | string | MongooseFilter => {
  if (typeof str === 'undefined') return undefined
  if (Array.isArray(str)) {
    return {
      $in: str,
    }
  }
  return str
}

export const regExp = (str?: string | string[]): undefined | string | MongooseFilter => {
  if (typeof str === 'undefined') return undefined
  if (Array.isArray(str)) {
    return {
      $in: str,
    }
  }
  if (typeof str === 'string') return new RegExp(str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i')
  return str
}

export const bool = (str?: string | string[]): undefined | boolean => {
  if (str === 'true' || str === 'True') return true
  if (str === 'false' || str === 'False') return false
  return undefined
}

export const removeUndefinedFields = (obj: Record<string, unknown>): Record<string, unknown> => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value
    }
    return acc
  }, <Record<string, unknown>>{})
}

export default {
  eq,
  regExp,
  bool,
  removeUndefinedFields,
}
