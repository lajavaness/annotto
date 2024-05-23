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
}
