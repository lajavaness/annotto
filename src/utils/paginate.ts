import mongoose from 'mongoose'

export type PaginatePayload = {
  limit?: number
  index?: number
  total: number
}
export type CriteriaPayload = Record<string, unknown>

export type Paginate<T> = {
  count: number
  index: number
  limit: number
  pageCount: number
  total: number
  data: T[]
}

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

export type QueryPayload = Partial<Params>

const _getLimit = (argLimit?: number | string, defaultLimit?: number): number | undefined => {
  if (typeof argLimit === 'string') return parseInt(argLimit)
  if (typeof argLimit === 'number') return Math.floor(argLimit)
  if (typeof defaultLimit === 'number') return Math.floor(defaultLimit)
  return undefined
}

const _getIndex = (argIndex?: string, limit?: number): number | undefined => {
  if (typeof argIndex === 'string' && typeof limit === 'number') return parseInt(argIndex)
  return undefined
}

const _getSkip = (index?: number, limit?: number): number | undefined => {
  if (index && limit) {
    return index * limit
  }
  return undefined
}

const _sortField = (args: string) => {
  const order = args[0] === '-' ? 'desc' : 'asc'
  const column = args.replace(/^-/, '')

  return { [column]: order }
}

const _getSortObj = (argSort: string | string[] | undefined) => {
  if (Array.isArray(argSort)) {
    argSort.map(_sortField).reduce((prev, current) => {
      return { ...prev, ...current }
    }, {})
  }
  if (typeof argSort === 'string') {
    return _sortField(argSort)
  }
  return {}
}

export const setParams = (args: ParamsPayload, _defaults: ParamsDefaults) => {
  const params: Params = {
    select: { ...(_defaults.select || {}) },
    sort: _getSortObj(args.sort),
    limit: _getLimit(args.limit, _defaults.limit),
  }
  params.index = _getIndex(args.limit, _defaults.limit)
  params.skip = _getSkip(params.index, params.limit)
  return params
}

/**
 * Builds a standardized payload for paginated queries.
 * @param {*} params Params passed to the query or build from query context.
 * @param {*} data List of data fetched from DB.
 * @returns {*} Standardized payload for paginated queries.
 */
export const paginate = <T>(params: PaginatePayload, data: T[]): Paginate<T> => {
  const { limit = 0, total, index = 0 } = params

  return {
    count: data.length,
    index,
    limit,
    pageCount: limit > 0 ? Math.floor(total / limit) + (total % limit === 0 ? 0 : 1) : 1,
    total,
    data,
  }
}

export const setQuery = <T>(query: T, params: QueryPayload): T => {
  if (!(query instanceof mongoose.Query)) return query

  if (params.sort) query.sort(params.sort)
  if (params.limit) query.limit(params.limit)
  if (params.skip) query.skip(params.skip)
  if (params.select) query.select(params.select)
  return query
}

export default {
  setParams,
  paginate,
  setQuery,
}
