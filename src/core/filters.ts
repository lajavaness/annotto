import { escapeRegExp } from 'lodash'
import mongoose from 'mongoose'
import { FilterPayload } from '../types'
import { IGetSimilarityUuids } from '../utils/external'
import { logger } from '../utils/logger'
import { Project } from '../db/models/projects'
import config from '../../config'

type GreaterThanAnyQueryParams = { $or: { [field: string]: { $gt: number } }[] }
type GreaterThanAllQueryParams = { $and: { [field: string]: { $gt: number } }[] }
type WrongPredictionsQueryParams = {
  $and: [
    {
      'annotationValues.0': { $exists: true }
    },
    { $or: { $and: ({ [field: string]: { $gt: number } } | { annotatedValue: { $nin: string[] } })[] }[] }
  ]
}

/*
  Builds query from req.body : for each object, gets field matching alias field from config
  and adds query object matching operator to global query.
*/
const reduceConditionsToAndQuery = async (
  project: Project,
  conditions: FilterPayload[],
  getSimilarityUuids: IGetSimilarityUuids
) => {
  const { fields } = config.filter.items
  const queryParams: Record<string, unknown>[] = []

  for (const condition of conditions) {
    if (!condition.field || !(condition.field in fields) || !fields[<keyof typeof fields>condition.field]) return null

    const field = fields[<keyof typeof fields>condition.field].key

    switch (condition.operator) {
      case 'similarTo': {
        if (!project.similarityEndpoint) return null

        const uuids = await getSimilarityUuids(
          project.similarityEndpoint,
          condition.value ? condition.value.toString() : '',
          condition.neg_values ? condition.neg_values : [],
          condition.limit
        )
        const compositeUuids = uuids.map((uuid: string | number) => `${project._id}_${uuid}`)
        queryParams.push({ [field]: { $in: compositeUuids } })
        break
      }
      case 'equal':
        queryParams.push({ [field]: condition.value })
        break
      case 'size':
        queryParams.push({ [field]: { $size: condition.value } })
        break
      case 'textContains':
        queryParams.push({ [field]: { $regex: escapeRegExp(condition.value ? condition.value.toString() : '') } })
        break
      case 'containsAny':
        queryParams.push({ [field]: { $in: condition.value } })
        break
      case 'containsAll':
        queryParams.push({ [field]: { $all: condition.value } })
        break
      case 'range':
        if (typeof condition.value !== 'object' || !('from' in condition.value) || !('to' in condition.value)) break

        queryParams.push({ [field]: { $gt: condition.value.from, $lt: condition.value.to } })
        break
      // has any prediction.X > threshold
      case 'greaterThanAny': {
        if (!Array.isArray(condition.value)) break

        const filterQuery: GreaterThanAnyQueryParams = condition.value.reduce(
          (tmpQuery: GreaterThanAnyQueryParams, value: string) => {
            tmpQuery.$or.push({
              [`${field}.${value}`]: { $gt: condition.threshold || 0.5 },
            })
            return tmpQuery
          },
          { $or: [] }
        )

        queryParams.push(filterQuery)
        break
      }
      // has all prediction.X > threshold
      case 'greaterThanAll': {
        if (!Array.isArray(condition.value)) break

        const filterQuery: GreaterThanAllQueryParams = condition.value.reduce(
          (tmpQuery: GreaterThanAllQueryParams, value: string) => {
            tmpQuery.$and.push({
              [`${field}.${value}`]: { $gt: condition.threshold || 0.5 },
            })
            return tmpQuery
          },
          { $and: [] }
        )

        queryParams.push(filterQuery)
        break
      }
      // has any prediction.X > treshold that's not in non empty annotationValues
      case 'wrongPredictions': {
        if (!Array.isArray(condition.value)) break

        const filterQuery: WrongPredictionsQueryParams = condition.value.reduce(
          (tmpQuery: WrongPredictionsQueryParams, value: string) => {
            tmpQuery.$and[1].$or.push({
              $and: [
                { [`${field}.${value}`]: { $gt: condition.threshold || 0.5 } },
                { annotatedValue: { $nin: [value] } },
              ],
            })
            return tmpQuery
          },
          {
            $and: [{ 'annotationValues.0': { $exists: true } }, { $or: [] }],
          }
        )

        queryParams.push(filterQuery)
        break
      }
      default: {
        logger.info('unknown operator', condition.operator)
      }
    }
  }

  return queryParams
}

/**
 * Builds Mongo Query from conditions, minimum query created : { project: project._id }
 * See unit tests for input/output examples.
 * @param {*} project The project.
 * @param {*} body The body.
 * @param {Function} getSimilarityUuids The similarity uuid function.
 * @returns {Promise.<{project: any, $or: Array, $and: Array}>} The generated mongo query.
 */
export const reduceBodyInFilterQuery = async (
  project: Project,
  body: FilterPayload[],
  getSimilarityUuids: IGetSimilarityUuids
) => {
  const mongoQuery: {
    project: mongoose.Types.ObjectId
    $or?: Record<string, unknown>[]
    $and?: Record<string, unknown>[]
  } = {
    project: project._id,
  }

  // Filter And conditions
  const andConditions = body.filter((condition) => !condition.or)

  // Filter Or conditions and merge eventual multiple Or arrays
  const orConditions = body
    .filter((condition) => condition.or)
    .reduce((aggregate, condition) => {
      aggregate.push(...(condition.or || []))

      return aggregate
    }, <FilterPayload[]>[])

  if (orConditions.length) {
    const or = []
    if (andConditions.length) {
      const parsedAndConditions = await reduceConditionsToAndQuery(project, andConditions, getSimilarityUuids)
      if (parsedAndConditions && parsedAndConditions.length) {
        or.push({ $and: parsedAndConditions })
      }
    }

    const parsedOrConditions = await reduceConditionsToAndQuery(project, orConditions, getSimilarityUuids)
    if (parsedOrConditions && parsedOrConditions.length) {
      or.push({ $or: parsedOrConditions })
    }
    if (or.length) {
      mongoQuery.$or = or
    }
  } else {
    const and = await reduceConditionsToAndQuery(project, andConditions, getSimilarityUuids)
    if (and && and.length) {
      mongoQuery.$and = and
    }
  }

  return mongoQuery
}

export default {
  reduceBodyInFilterQuery,
}
