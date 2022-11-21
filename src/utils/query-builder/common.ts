// eslint-disable-next-line import/no-cycle
import { Paginate, PaginatePayload } from '.'

const toInt = (nb?: number | string) => {
  switch (typeof nb) {
    case 'number':
      return Math.floor(nb)
    case 'string':
      return parseInt(nb) || 0
    default:
      return 0
  }
}

/**
 * Builds a standardized payload for paginated queries.
 * @param {*} params Params passed to the query or build from query context.
 * @param {*} data List of data fetched from DB.
 * @returns {*} Standardized payload for paginated queries.
 */
export const paginate = <T>(params: PaginatePayload, data: T[]): Paginate<T> => {
  const [limit, total, index] = ['limit', 'total', 'index'].map((k) => toInt(params[k as keyof PaginatePayload]))

  return {
    count: data.length,
    index,
    limit,
    pageCount: limit > 0 ? Math.floor(total / limit) + (total % limit === 0 ? 0 : 1) : 1,
    total,
    data,
  }
}
