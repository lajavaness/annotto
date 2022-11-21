import { convertToModel } from '../predictions'

const classif = {
  Sentiment: {
    labels: [{ value: 'abc', proba: 0.9 }],
  },
  Autre: {
    labels: [{ value: 'cdf', proba: 0.1 }],
  },
}

const ner = {
  Sentiment: {
    entities: [{ value: 'abc', start: 0, end: 5 }],
  },
  Autre: {
    entities: [{ value: 'cdf', start: 6, end: 10 }],
  },
}

const zone = {
  Sentiment: {
    entities: [
      {
        value: 'abc',
        coords: [
          { x: 0.23, y: 0.434 },
          { x: 0.23, y: 0.23 },
          { x: 0.43, y: 0.12 },
        ],
      },
    ],
  },
  Autre: {
    entities: [
      {
        value: 'cdsf',
        coords: [
          { x: 0.23, y: 0.434 },
          { x: 0.23, y: 0.23 },
          { x: 0.43, y: 0.12 },
        ],
      },
    ],
  },
}

describe('utils - stream - prediction', () => {
  test('mapPredictionLine format classif and apply minimum threshold filter', () => {
    const res = convertToModel(classif, 0.2)
    expect(res.keys).toEqual([{ value: 'abc', proba: 0.9 }])
  })

  test('mapPredictionLine format ner', () => {
    const res = convertToModel(ner)
    expect(res.keys).toEqual([
      { value: 'abc', start: 0, end: 5 },
      { value: 'cdf', start: 6, end: 10 },
    ])
  })

  test('mapPredictionLine zone ', () => {
    const res = convertToModel(zone)
    expect(res.keys).toEqual([
      {
        value: 'abc',
        zone: [
          { x: 0.23, y: 0.434 },
          { x: 0.23, y: 0.23 },
          { x: 0.43, y: 0.12 },
        ],
      },
      {
        value: 'cdsf',
        zone: [
          { x: 0.23, y: 0.434 },
          { x: 0.23, y: 0.23 },
          { x: 0.43, y: 0.12 },
        ],
      },
    ])
  })
})
