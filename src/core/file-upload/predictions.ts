import { Zone, PredictionPayload } from '../../types'

/**
 * Convert predictions from front-end to back-end model.
 * @param {PredictionPayload} data .
 * @param {number} minimalValue Filter the predictions that will return with that threshold that compares with the proba.
 * Used only for predictions from a type Classification.
 * @returns {{}} .
 */
export const convertToModel = (data: PredictionPayload, minimalValue?: number) => {
  const ret = {
    raw: data,
    keys: <
      (
        | {
            value: string
            proba: number
          }
        | {
            value: string
            start: number
            end: number
          }
        | {
            value: string
            zone: Zone[]
          }
      )[]
    >[],
  }

  Object.values(data).forEach((category) => {
    if ('entities' in category && category.entities) {
      ret.keys.push(
        ...category.entities.map((obj) => {
          // replace 'coords' with 'zone' for front end payload for zone predictions
          if ('coords' in obj) {
            return {
              value: obj.value,
              zone: obj.coords || [],
            }
          }
          return obj
        })
      )
    }
    // filter tasks with minimum score
    if ('labels' in category && category.labels && Array.isArray(category.labels)) {
      ret.keys.push(...category.labels.filter((obj) => obj && obj.proba > (minimalValue || 0)))
    }
  })

  return ret
}
