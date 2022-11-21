import mongoose from 'mongoose'
// eslint-disable-next-line import/no-cycle
import { Criteria, CriteriaDefaults, CriteriaPayload, Params, ParamsDefaults, ParamsPayload, QueryPayload } from '.'

const _sortObj = (
  args: string,
  sortObj: { [field: string]: string } = {},
  _fields: { [field: string]: { key: string } } = {}
) => {
  const order = args[0] === '-' ? 'desc' : 'asc'
  const column = args.replace(/^-/, '')
  if (!_fields[column]) return

  sortObj[_fields[column].key] = order
}

const _selectObj = (args: { [field: string]: boolean }, select: { [field: string]: boolean } = {}) =>
  Object.entries(args).forEach(([key, value]) => {
    select[key] = value
  })

/**
 * Builds params object to pass to db function to : order, limit, offset.
 * @param {*} args Values used to set query params.
 * @param {*} _defaults Defaults values to use.
 * @returns {*} Builded params object.
 */
export const setParams = (args: ParamsPayload, _defaults: ParamsDefaults) => {
  const params: Params = {
    select: {},
    sort: {},
  }

  if (typeof args.limit === 'number') {
    params.limit = Math.floor(args.limit)
  } else if (args.limit) {
    params.limit = parseInt(args.limit)
  } else if (typeof _defaults.limit === 'number') {
    params.limit = Math.floor(_defaults.limit)
  } else if (_defaults.limit) {
    params.limit = parseInt(_defaults.limit)
  }

  if (args.sort) {
    if (Array.isArray(args.sort)) {
      args.sort.forEach((s) => {
        _sortObj(s, params.sort, _defaults.fields)
      })
    } else {
      _sortObj(args.sort, params.sort, _defaults.fields)
    }
  }

  if (!Object.keys(params.sort).length) {
    // Default values
    _defaults.orderBy.forEach((s) => {
      _sortObj(s, params.sort, _defaults.fields)
    })
  }

  if (args.index && params.limit) {
    if (typeof args.index === 'number') {
      params.index = Math.floor(args.index)
    } else {
      params.index = parseInt(args.index)
    }
    params.skip = params.index * params.limit
  }

  if (_defaults.select) _selectObj(_defaults.select, params.select)

  return params
}

/**
 * Builds whereClause object to query in the db.
 * @param {*} args Values to be added in the criteria.
 * @param {*} _defaults Fields and prefix allowed to query in DB.
 * @returns {*} Builded whereClause object.
 */
export const setCriteria = (args: CriteriaPayload, _defaults: CriteriaDefaults) => {
  const criteria: Criteria = {}

  Object.entries(_defaults.fields).forEach(([k, value]: [string, { key: string; type?: string }]) => {
    if (args[k]) {
      if (Array.isArray(args[k])) criteria[value.key] = { $in: args[k] }
      else if (value.type === 'array') criteria[value.key] = { $in: [args[k]] }
      else if (value.type === 'text') {
        let text: string
        switch (typeof args[k]) {
          case 'string':
            text = <string>args[k]
            break
          case 'number':
            text = (<number>args[k]).toString()
            break
          case 'object':
            text = (<object>args[k]).toString()
            break
          default:
            text = ''
        }
        criteria[value.key] = new RegExp(text.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i')
      } else criteria[value.key] = args[k]
    }
  })
  return criteria
}

export const setQuery = <T>(query: T, params: QueryPayload): T => {
  if (!(query instanceof mongoose.Query)) return query

  if (params.sort) query.sort(params.sort)
  if (params.limit) query.limit(params.limit)
  if (params.skip) query.skip(params.skip)
  if (params.select) query.select(params.select)
  return query
}
