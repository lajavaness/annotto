import mongoose from 'mongoose'

export type CriteriaPayload = Record<string, unknown>

export type ParamsPayload = {
  limit?: string
  sort?: string | string[]
  index?: string
  [field: string]: number | number[] | string | string[] | undefined
}

export type ParamsDefaults = {
  limit?: number
  orderBy: string[]
  select?: {
    [field: string]: boolean
  }
}

export type Params = {
  select?: {
    [field: string]: boolean
  }
  sort: {
    [field: string]: string
  }
  index?: number
  skip?: number
  limit?: number
}

const _getLimit = (argLimit?: number | string, defaultLimit?: number): number | undefined => {
  if (typeof argLimit === 'string') return parseInt(argLimit)
  if (typeof argLimit === 'number') return Math.floor(argLimit)
  if (typeof defaultLimit === 'number') return Math.floor(defaultLimit)
  return undefined
}

const _getIndex = (argIndex?: string | number): number | undefined => {
  if (typeof argIndex === 'string') return parseInt(argIndex)
  if (typeof argIndex === 'number') return Math.floor(argIndex)
  return undefined
}

const _getSkip = (index?: number, limit?: number): number | undefined => {
  if (typeof index !== 'undefined' && typeof limit !== 'undefined') {
    return index * limit
  }
  return undefined
}

const _sortField = (args: string) => {
  const order = args[0] === '-' ? 'desc' : 'asc'
  const column = args.replace(/^-/, '')

  return { [column]: order }
}

const _getSortObj = (argSort: string | string[] | undefined, _defaultsOrderBy: string[]) => {
  if (Array.isArray(argSort)) {
    argSort.map(_sortField).reduce((prev, current) => {
      return { ...prev, ...current }
    }, {})
  }
  if (typeof argSort === 'string') {
    return _sortField(argSort)
  }
  return _defaultsOrderBy.map(_sortField).reduce((prev, current) => {
    return {
      ...prev,
      ...current,
    }
  }, {})
}

/**
 * Build Params from args values and defaults.
 * @param {ParamsPayload} args Values to used to build Params.
 * @param {ParamsDefaults} _defaults Default value to apply if not provided in args.
 * @returns {Params} Params to use in applyParamsToQuery.
 */
export const setParams = (args: ParamsPayload, _defaults: ParamsDefaults): Params => {
  const params: Params = {
    select: { ...(_defaults.select || {}) },
    sort: _getSortObj(args.sort, _defaults.orderBy),
    limit: _getLimit(args.limit, _defaults.limit),
    index: _getIndex(args.index),
  }
  params.skip = _getSkip(params.index, params.limit)
  return params
}

/**
 * Apply params to query.
 * @param {mongoose.Query} query Mongoose query.
 * @param {Params} params Sort, limit, skip, and fields to select to apply to query.
 * @returns {mongoose.Query} Query to enable chain call.
 */
export const applyParamsToQuery = <T>(query: T, params: Params): T => {
  if (!(query instanceof mongoose.Query)) return query

  if (params.sort) query.sort(params.sort)
  if (params.limit) query.limit(params.limit)
  if (params.skip) query.skip(params.skip)
  if (params.select) query.select(params.select)
  return query
}

export const stringToRegExpOrUndefined = (str?: string): RegExp | undefined => {
  if (typeof str === 'undefined') return undefined
  return new RegExp(str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i')
}

export const singleValueOrArrayToMongooseSelector = (
  str?: string | string[]
): undefined | string | { $in: string[] } => {
  if (typeof str === 'undefined') return undefined
  if (typeof str === 'string') return str
  return { $in: str }
}

export const valueToMongooseArraySelector = (val?: string | string[]): { $in: string[] } | undefined => {
  if (typeof val === 'undefined') return undefined
  if (typeof val === 'string') return { $in: [val] }
  return {
    $in: val,
  }
}

export const cleanRecord = (obj: Record<string, unknown>): Record<string, unknown> => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value
    }
    return acc
  }, {} as Record<string, unknown>)
}

export default {
  setParams,
  applyParamsToQuery,
}
