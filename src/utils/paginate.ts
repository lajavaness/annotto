export type PaginatePayload = {
  limit?: number
  index?: number
  total: number
}
export type Paginate<T> = {
  count: number
  index: number
  limit: number
  pageCount: number
  total: number
  data: T[]
}

export type QueryPayload = {
  limit?: string
  sort?: string | string[]
  index?: string
  [field: string]: string | string[] | undefined
}

export type PaginationParamsDefaults = {
  limit: number
  orderBy: string[]
  select?: {
    [field: string]: boolean
  }
}

export type PaginationParams = {
  select: {
    [field: string]: boolean
  }
  sort: {
    [field: string]: string
  }
  index: number
  skip: number
  limit: number
}

const _getLimit = (argLimit?: number | string, defaultLimit?: number): number => {
  if (typeof argLimit === 'string') return parseInt(argLimit)
  if (typeof argLimit === 'number') return Math.floor(argLimit)
  if (typeof defaultLimit === 'number') return Math.floor(defaultLimit)
  return 0
}

const _getIndex = (argIndex?: string | number): number => {
  if (typeof argIndex === 'string') return parseInt(argIndex)
  if (typeof argIndex === 'number') return Math.floor(argIndex)
  return 0
}

const _sortField = (args: string) => {
  const order = args[0] === '-' ? 'desc' : 'asc'
  const column = args.replace(/^-/, '')

  return { [column]: order }
}

const _getSortObj = (argSort: string | string[] | undefined, _defaultsOrderBy: string[]): Record<string, string> => {
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
 * @param {QueryPayload} args Values from express.req.query to used to build pagination params.
 * @param {PaginationParamsDefaults} _defaults Default value to apply if not provided in args.
 * @returns {PaginationParams} Params to use in ORM query.
 */
export const getPaginationParams = (args: QueryPayload, _defaults: PaginationParamsDefaults): PaginationParams => {
  const params: PaginationParams = {
    select: { ...(_defaults.select || {}) },
    sort: _getSortObj(args.sort, _defaults.orderBy),
    limit: _getLimit(args.limit, _defaults.limit),
    index: _getIndex(args.index) || 0,
    skip: 0,
  }
  params.skip = params.index * params.limit
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

export default {
  paginate,
  getPaginationParams,
}
