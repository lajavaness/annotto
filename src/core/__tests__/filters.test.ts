import { reduceBodyInFilterQuery } from '../filters'
import { Project } from '../../db/models/projects'
import mongoSetupTeardown from './mongoSetupTeardown'

mongoSetupTeardown()

describe('reduceBodyInFilterQuery', () => {
  test('build basic filter query, pushing all conditions to $and', async () => {
    const getSimilarityUuidsMock = jest.fn()
    const project = <Project>(<unknown>{
      _id: '123',
    })

    const req = [
      { operator: 'equal', field: 'annotated', value: true },
      { operator: 'textContains', field: 'body', value: 'Hello' },
    ]

    const query = await reduceBodyInFilterQuery(project, req, getSimilarityUuidsMock)

    const output = {
      project: project._id,
      $and: [
        {
          [req[0].field]: req[0].value,
        },
        {
          [req[1].field]: { $regex: req[1].value },
        },
      ],
    }

    expect(query).toEqual(output)
  })
  test('build filter query, pushing all conditions to $and', async () => {
    const mockUuids = [666]
    const getSimilarityUuidsMock = jest.fn(() => {
      return Promise.resolve(mockUuids)
    })
    const project = <Project>(<unknown>{
      _id: '123',
      similarityEndpoint: 'http://www.foo.bar',
    })
    const compositeUuids = mockUuids.map((uuid) => `${project._id}_${uuid}`)

    const req = [
      { operator: 'equal', field: 'annotated', value: true },
      { operator: 'range', field: 'annotatedAt', value: { from: '2019-09-31T00:00:00', to: '2021-09-31T00:00:00' } },
      { operator: 'containsAny', field: 'annotatedBy', value: ['admin@test.com'] },
      { operator: 'containsAll', field: 'annotatedBy', value: ['admin@test.com'] },

      { operator: 'containsAny', field: 'annotationValues', value: ['RA', 'RB'] },
      { operator: 'containsAll', field: 'annotationValues', value: ['RC', 'RD'] },
      { operator: 'size', field: 'annotationValues', value: 4 },

      { operator: 'containsAny', field: 'tags', value: ['confus'] },
      { operator: 'containsAll', field: 'tags', value: ['confus'] },
      { operator: 'size', field: 'tags', value: 4 },

      { operator: 'containsAny', field: 'predictionValues', value: ['RA'] },
      { operator: 'containsAll', field: 'predictionValues', value: ['RA'] },
      { operator: 'size', field: 'predictionValues', value: 4 },

      { operator: 'greaterThanAny', field: 'predictionScores', value: ['RA', 'RB'], threshold: 0.9 },
      { operator: 'greaterThanAll', field: 'predictionScores', value: ['RA', 'RB'], threshold: 0.9 },

      { operator: 'similarTo', field: 'uuid', value: 'Hello world', limit: 20, neg_values: ['goodbye'] },

      { operator: 'wrongPredictions', field: 'predictionScores', value: ['RA', 'RB'], threshold: 0.5 },
    ]

    const query = await reduceBodyInFilterQuery(project, req, getSimilarityUuidsMock)

    const wrongPredictionQuery = {
      $and: [
        {
          'annotationValues.0': {
            $exists: true,
          },
        },
        {
          $or: [
            {
              $and: [
                {
                  'predictions.predictions.RA': {
                    $gt: 0.5,
                  },
                },
                {
                  annotatedValue: {
                    $nin: ['RA'],
                  },
                },
              ],
            },
            {
              $and: [
                {
                  'predictions.predictions.RB': {
                    $gt: 0.5,
                  },
                },
                {
                  annotatedValue: {
                    $nin: ['RB'],
                  },
                },
              ],
            },
          ],
        },
      ],
    }
    const output = {
      project: project._id,
      $and: [
        {
          [req[0].field]: req[0].value,
        },
        {
          [req[1].field]: {
            $gt: (<{ from: string; to: string }>req[1].value).from,
            $lt: (<{ from: string; to: string }>req[1].value).to,
          },
        },
        {
          [req[2].field]: { $in: req[2].value },
        },
        {
          [req[3].field]: { $all: req[3].value },
        },
        {
          [req[4].field]: { $in: req[4].value },
        },
        {
          [req[5].field]: { $all: req[5].value },
        },
        {
          [req[6].field]: { $size: req[6].value },
        },
        {
          [req[7].field]: { $in: req[7].value },
        },
        {
          [req[8].field]: { $all: req[8].value },
        },
        {
          [req[9].field]: { $size: req[9].value },
        },
        {
          'predictions.keys': { $in: req[10].value },
        },
        {
          'predictions.keys': { $all: req[11].value },
        },
        {
          'predictions.keys': { $size: req[12].value },
        },
        {
          $or: [
            { 'predictions.predictions.RA': { $gt: req[13].threshold } },
            { 'predictions.predictions.RB': { $gt: req[13].threshold } },
          ],
        },
        {
          $and: [
            { 'predictions.predictions.RA': { $gt: req[14].threshold } },
            { 'predictions.predictions.RB': { $gt: req[14].threshold } },
          ],
        },
        { compositeUuid: { $in: compositeUuids } },
        wrongPredictionQuery,
      ],
    }

    expect(query).toEqual(output)
  })
  test('build query with OR condition', async () => {
    const getSimilarityUuidsMock = jest.fn()
    const project = <Project>(<unknown>{
      _id: '123',
    })

    const req = [
      {
        operator: 'equal',
        field: 'annotated',
        value: true,
      },
      {
        operator: 'containsAny',
        field: 'annotatedBy',
        value: ['FOO@lajavaness.com'],
      },
      {
        or: [
          {
            operator: 'containsAny',
            field: 'annotatedBy',
            value: ['BAR@lajavaness.com'],
          },
          {
            operator: 'containsAny',
            field: 'annotatedBy',
            value: ['BAZ@lajavaness.com'],
          },
          {
            operator: 'containsAny',
            field: 'annotatedBy',
            value: ['BERZ@lajavaness.com'],
          },
        ],
      },
    ]

    const output = {
      project: '123',
      $or: [
        {
          $and: [
            {
              annotated: true,
            },
            {
              annotatedBy: {
                $in: ['FOO@lajavaness.com'],
              },
            },
          ],
        },
        {
          $or: [
            {
              annotatedBy: {
                $in: ['BAR@lajavaness.com'],
              },
            },
            {
              annotatedBy: {
                $in: ['BAZ@lajavaness.com'],
              },
            },
            {
              annotatedBy: {
                $in: ['BERZ@lajavaness.com'],
              },
            },
          ],
        },
      ],
    }

    const query = await reduceBodyInFilterQuery(project, req, getSimilarityUuidsMock)
    expect(query).toEqual(output)
  })
})
