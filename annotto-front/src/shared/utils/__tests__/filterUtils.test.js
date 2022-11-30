import moment from 'moment'

import { mapFilterFormToFilterJson, mapFilterJsonToFilterForm } from 'shared/utils/filterUtils'

import { ALL } from 'shared/enums/valueTypes'

describe('filterUtils', () => {
  describe('mapFilterFormToFilterJson', () => {
    it('Returns null if input is null', () => {
      const input = null
      expect(mapFilterFormToFilterJson(input)).toBeNull()
    })

    it('Returns undefined if input is undefined', () => {
      const input = undefined
      expect(mapFilterFormToFilterJson(input)).toBeUndefined()
    })

    it('Returns input if input is empty object', () => {
      const input = {}
      const output = {}
      expect(mapFilterFormToFilterJson(input)).toEqual(output)
    })

    it('Returns input if input is empty string', () => {
      const input = ''
      const output = ''
      expect(mapFilterFormToFilterJson(input)).toEqual(output)
    })

    it('Returns mapped data', () => {
      const input = {
        annotated: true,
        annotatedAt: [moment('2019-09-30T22:00:00.000Z'), moment('2021-09-30T22:00:00.000Z')],
        annotatedBy: ['admin@lajavaness.com'],
        tags: ['confus'],
        similarTo: 'Bonjour',
        filters: [
          { operator: 'containsAny', field: 'annotatedBy', value: ['admin@lajavaness.com'] },
          { operator: 'containsAny', field: 'annotationValues', value: ['RA', 'RB'] },
          { operator: 'containsAll', field: 'annotationValues', value: ['RC', 'RD'] },
          { operator: 'size', field: 'annotationValues', value: 4 },
          { operator: 'containsAny', field: 'tags', value: ['confus'] },
          { operator: 'size', field: 'tags', value: 4 },
          { operator: 'containsAny', field: 'predictionValues', value: ['RA'] },
          { operator: 'containsAll', field: 'predictionValues', value: ['RA'] },
          { operator: 'size', field: 'predictionValues', value: 4 },
          { operator: 'greaterThanAny', field: 'predictionScores', value: ['RA', 'RB'], threshold: 0.9 },
          { operator: 'greaterThanAll', field: 'predictionScores', value: ['RA', 'RB'], threshold: 0.9 },
        ],
      }

      const output = [
        { operator: 'equal', field: 'annotated', value: true },
        {
          operator: 'range',
          field: 'annotatedAt',
          value: [moment('2019-09-30T22:00:00.000Z'), moment('2021-09-30T22:00:00.000Z')],
        },
        { operator: 'containsAll', field: 'annotatedBy', value: ['admin@lajavaness.com'] },
        { operator: 'containsAll', field: 'tags', value: ['confus'] },
        { operator: 'similarTo', field: 'uuid', value: 'Bonjour' },
        { operator: 'containsAny', field: 'annotatedBy', value: ['admin@lajavaness.com'] },
        { operator: 'containsAny', field: 'annotationValues', value: ['RA', 'RB'] },
        { operator: 'containsAll', field: 'annotationValues', value: ['RC', 'RD'] },
        { operator: 'size', field: 'annotationValues', value: 4 },
        { operator: 'containsAny', field: 'tags', value: ['confus'] },
        { operator: 'size', field: 'tags', value: 4 },
        { operator: 'containsAny', field: 'predictionValues', value: ['RA'] },
        { operator: 'containsAll', field: 'predictionValues', value: ['RA'] },
        { operator: 'size', field: 'predictionValues', value: 4 },
        { operator: 'greaterThanAny', field: 'predictionScores', value: ['RA', 'RB'], threshold: 0.9 },
        { operator: 'greaterThanAll', field: 'predictionScores', value: ['RA', 'RB'], threshold: 0.9 },
      ]

      expect(mapFilterFormToFilterJson(input)).toEqual(output)
    })
  })

  describe('mapFilterJsonToFilterForm', () => {
    it('Returns null if input is null', () => {
      const input = null
      expect(mapFilterJsonToFilterForm(input)).toBeNull()
    })

    it('Returns undefined if input is undefined', () => {
      const input = undefined
      expect(mapFilterJsonToFilterForm(input)).toBeUndefined()
    })

    it('Returns input if input is empty object', () => {
      const input = {}
      const output = {}
      expect(mapFilterJsonToFilterForm(input)).toEqual(output)
    })

    it('Returns input if input is empty string', () => {
      const input = ''
      const output = ''
      expect(mapFilterJsonToFilterForm(input)).toEqual(output)
    })

    it('Returns mapped data with annotated property', () => {
      const input = [
        { operator: 'equal', field: 'annotated', value: true },
        {
          operator: 'range',
          field: 'annotatedAt',
          value: ['2019-09-30T22:00:00.000Z', '2021-09-30T22:00:00.000Z'],
        },
        { operator: 'containsAll', field: 'annotatedBy', value: ['admin@lajavaness.com'] },
        { operator: 'containsAll', field: 'tags', value: ['confus'] },
        { operator: 'similarTo', field: 'uuid', value: 'Bonjour' },
        { operator: 'containsAny', field: 'annotatedBy', value: ['admin@lajavaness.com'] },
        { operator: 'containsAny', field: 'annotationValues', value: ['RA', 'RB'] },
        { operator: 'containsAll', field: 'annotationValues', value: ['RC', 'RD'] },
        { operator: 'size', field: 'annotationValues', value: 4 },
        { operator: 'containsAny', field: 'tags', value: ['confus'] },
        { operator: 'size', field: 'tags', value: 4 },
        { operator: 'containsAny', field: 'predictionValues', value: ['RA'] },
        { operator: 'containsAll', field: 'predictionValues', value: ['RA'] },
        { operator: 'size', field: 'predictionValues', value: 4 },
        { operator: 'greaterThanAny', field: 'predictionScores', value: ['RA', 'RB'], threshold: 0.9 },
        { operator: 'greaterThanAll', field: 'predictionScores', value: ['RA', 'RB'], threshold: 0.9 },
      ]

      const output = {
        annotated: true,
        annotatedAt: [moment('2019-09-30T22:00:00.000Z'), moment('2021-09-30T22:00:00.000Z')],
        annotatedBy: ['admin@lajavaness.com'],
        tags: ['confus'],
        similarTo: 'Bonjour',
        filters: [
          { operator: 'containsAny', field: 'annotatedBy', value: ['admin@lajavaness.com'] },
          { operator: 'containsAny', field: 'annotationValues', value: ['RA', 'RB'] },
          { operator: 'containsAll', field: 'annotationValues', value: ['RC', 'RD'] },
          { operator: 'size', field: 'annotationValues', value: 4 },
          { operator: 'containsAny', field: 'tags', value: ['confus'] },
          { operator: 'size', field: 'tags', value: 4 },
          { operator: 'containsAny', field: 'predictionValues', value: ['RA'] },
          { operator: 'containsAll', field: 'predictionValues', value: ['RA'] },
          { operator: 'size', field: 'predictionValues', value: 4 },
          { operator: 'greaterThanAny', field: 'predictionScores', value: ['RA', 'RB'], threshold: 0.9 },
          { operator: 'greaterThanAll', field: 'predictionScores', value: ['RA', 'RB'], threshold: 0.9 },
        ],
      }

      expect(mapFilterJsonToFilterForm(input)).toEqual(output)
    })

    it('Returns mapped data without annotated property', () => {
      const input = [
        {
          operator: 'range',
          field: 'annotatedAt',
          value: ['2019-09-30T22:00:00.000Z', '2021-09-30T22:00:00.000Z'],
        },
        { operator: 'containsAll', field: 'annotatedBy', value: ['admin@lajavaness.com'] },
        { operator: 'containsAll', field: 'tags', value: ['confus'] },
        { operator: 'similarTo', field: 'uuid', value: 'Bonjour' },
        { operator: 'containsAny', field: 'annotatedBy', value: ['admin@lajavaness.com'] },
        { operator: 'containsAny', field: 'annotationValues', value: ['RA', 'RB'] },
        { operator: 'containsAll', field: 'annotationValues', value: ['RC', 'RD'] },
        { operator: 'size', field: 'annotationValues', value: 4 },
        { operator: 'containsAny', field: 'tags', value: ['confus'] },
        { operator: 'size', field: 'tags', value: 4 },
        { operator: 'containsAny', field: 'predictionValues', value: ['RA'] },
        { operator: 'containsAll', field: 'predictionValues', value: ['RA'] },
        { operator: 'size', field: 'predictionValues', value: 4 },
        { operator: 'greaterThanAny', field: 'predictionScores', value: ['RA', 'RB'], threshold: 0.9 },
        { operator: 'greaterThanAll', field: 'predictionScores', value: ['RA', 'RB'], threshold: 0.9 },
      ]

      const output = {
        annotated: ALL,
        annotatedAt: [moment('2019-09-30T22:00:00.000Z'), moment('2021-09-30T22:00:00.000Z')],
        annotatedBy: ['admin@lajavaness.com'],
        tags: ['confus'],
        similarTo: 'Bonjour',
        filters: [
          { operator: 'containsAny', field: 'annotatedBy', value: ['admin@lajavaness.com'] },
          { operator: 'containsAny', field: 'annotationValues', value: ['RA', 'RB'] },
          { operator: 'containsAll', field: 'annotationValues', value: ['RC', 'RD'] },
          { operator: 'size', field: 'annotationValues', value: 4 },
          { operator: 'containsAny', field: 'tags', value: ['confus'] },
          { operator: 'size', field: 'tags', value: 4 },
          { operator: 'containsAny', field: 'predictionValues', value: ['RA'] },
          { operator: 'containsAll', field: 'predictionValues', value: ['RA'] },
          { operator: 'size', field: 'predictionValues', value: 4 },
          { operator: 'greaterThanAny', field: 'predictionScores', value: ['RA', 'RB'], threshold: 0.9 },
          { operator: 'greaterThanAll', field: 'predictionScores', value: ['RA', 'RB'], threshold: 0.9 },
        ],
      }

      expect(mapFilterJsonToFilterForm(input)).toEqual(output)
    })
  })
})
