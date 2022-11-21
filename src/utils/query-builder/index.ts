// eslint-disable-next-line import/no-cycle
import * as common from './common'
// eslint-disable-next-line import/no-cycle
import * as mongo from './mongo'

export type PaginatePayload = {
  limit?: number | string
  index?: number | string
  total: number | string
}

export type Paginate<T> = {
  count: number
  index: number
  limit: number
  pageCount: number
  total: number
  data: T[]
}

export type ParamsPayload = {
  limit?: number | string
  sort?: string | string[]
  index?: number | string
}

export type ParamsDefaults = {
  limit?: number | string
  fields: {
    [field: string]: { key: string }
  }
  orderBy: string[]
  select?: {
    [field: string]: boolean
  }
}

export type Params = {
  select: {
    [field: string]: boolean
  }
  sort: {
    [field: string]: string
  }
  index?: number
  skip?: number
  limit?: number
}

export type CriteriaPayload = Record<string, unknown>

export type CriteriaDefaults = {
  fields: {
    [field: string]: { key: string }
  }
}

export type Criteria = Record<string, unknown>

export type QueryPayload = Partial<Params>

export interface IQueryBuilder {
  paginate: <T>(params: PaginatePayload, data: T[]) => Paginate<T>
  setParams: (args: ParamsPayload, _defaults: ParamsDefaults) => Params
  setCriteria: (args: CriteriaPayload, _defaults: CriteriaDefaults) => Criteria
  setQuery: <T>(query: T, params: QueryPayload) => T
}

export default (odm: string): IQueryBuilder => {
  if (odm === 'mongo') {
    return {
      ...common,
      ...mongo,
    }
  }

  throw new Error(`Error query builder : Invalid odm ${odm}`)
}
