import * as mongoBuilder from '../mongo'

const { setParams, setCriteria } = mongoBuilder

const _defaults = {
  orderBy: ['text'],
  fields: {
    number: { key: 'table.num_col', type: 'number' },
    text: { key: 'table.text_col', type: 'text' },
    array: { key: 'table.array_col', type: 'array' },
  },
  limit: 10,
}

describe('setParams', () => {
  test('setParams - default', () => {
    const p = setParams({}, _defaults)

    expect(p.sort).toEqual({ 'table.text_col': 'asc' })
  })
  test('setParams - sort', () => {
    const args = {
      sort: '-text',
    }
    const p = setParams(args, _defaults)

    expect(p.sort).toEqual({ 'table.text_col': 'desc' })
  })
  test('setParams - limit', () => {
    const args = {
      limit: 100,
    }
    const p = setParams(args, _defaults)
    expect(p.limit).toEqual(args.limit)
  })
  test('setParams - unlimited string', () => {
    const args = {
      limit: '0',
    }
    const p = setParams(args, _defaults)
    expect(p.skip).toBeUndefined()
    expect(p.index).toBeUndefined()
    expect(p.limit).toBe(0)
  })
  test('setParams - unlimited number', () => {
    const args = {
      limit: 0,
    }
    const p = setParams(args, _defaults)
    expect(p.skip).toBeUndefined()
    expect(p.index).toBeUndefined()
    expect(p.limit).toBe(0)
  })
  test('setParams - default limit', () => {
    const args = {}

    const p = setParams(args, _defaults)
    expect(p.limit).toBe(_defaults.limit)
  })

  test('setParams - index', () => {
    const args = {
      index: 2,
      limit: '10',
    }
    const p = setParams(args, _defaults)
    expect(p.index).toEqual(args.index)
    expect(p.skip).toEqual(args.index * parseInt(args.limit))
  })
  test('setParams - not in defaults', () => {
    const args = {
      sort: '-other',
    }
    const p = setParams(args, _defaults)

    expect(p.sort).toEqual({ 'table.text_col': 'asc' })
  })

  test('setParams - empty select', () => {
    const args = {}
    const p = setParams(args, _defaults)
    expect(p.select).toMatchObject({})
  })
  test('setParams - select', () => {
    const args = {}
    const defaults = { ..._defaults, select: { guidelines: false } }
    const expected = {
      guidelines: false,
    }
    const p = setParams(args, defaults)
    expect(p.select).toMatchObject(expected)
  })
})

describe('setCriteria', () => {
  test('setCriteria - default', () => {
    const c = setCriteria({}, _defaults)

    expect(Object.keys(c)).toHaveLength(0)
  })
  test('setCriteria - text', () => {
    const args = {
      text: 'toBeLike',
    }
    const c = setCriteria(args, _defaults)

    expect(c['table.text_col']).toEqual(new RegExp(args.text, 'i'))
  })
  test('setCriteria - number', () => {
    const args = {
      number: 50,
    }
    const c = setCriteria(args, _defaults)

    expect(c['table.num_col']).toBe(args.number)
  })
  test('setCriteria - array in text', () => {
    const args = {
      text: ['a', 'b', 'c'],
    }
    const c = setCriteria(args, _defaults)

    expect(c['table.text_col']).toEqual({ $in: args.text })
  })
  test('setCriteria - array in number', () => {
    const args = {
      number: [50, 30, 10],
    }
    const c = setCriteria(args, _defaults)

    expect(c['table.num_col']).toEqual({ $in: args.number })
  })
  test('setCriteria - array', () => {
    const args = {
      array: [50, 30, 10],
    }
    const c = setCriteria(args, _defaults)

    expect(c['table.array_col']).toEqual({ $in: args.array })
  })
  test('setCriteria - not in defaults', () => {
    const args = {
      other: 50,
      value: 'v',
    }
    const c = setCriteria(args, _defaults)

    expect(Object.keys(c)).toHaveLength(0)
  })
})
