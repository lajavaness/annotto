import { groupTasksByCategories } from 'shared/utils/tasksUtils'

describe('tasksUtils', () => {
  describe('groupTasksByCategories', () => {
    const emptyArrayCases = [
      {
        title: 'returns an empty array if input is a number',
        input: 1,
      },
      { title: 'returns an empty array if input is null', input: null },
      {
        title: 'returns an empty array if input is undefined',
        input: undefined,
      },
      {
        title: 'returns an empty array if input is an empty object',
        input: {},
      },
      {
        title: 'returns an empty array if input is an empty array',
        input: [],
      },
      {
        title: 'returns an empty array if input is a string',
        input: 'foo',
      },
    ]

    emptyArrayCases.forEach(({ title, input }) => {
      it(title, () => {
        expect(groupTasksByCategories(input)).toEqual([])
      })
    })

    it('returns task grouped by categories', () => {
      const input = [
        { category: 'foo', foo: 'foo' },
        { category: 'foo', foo: 'bar' },
        { category: 'bar', foo: 'foo' },
        { category: 'bar', foo: 'bar' },
        { foo: 'zog' },
        { category: '', foo: 'yoo' },
      ]
      const expected = [
        {
          category: 'foo',
          children: [{ foo: 'foo' }, { foo: 'bar' }],
        },
        {
          category: 'bar',
          children: [{ foo: 'foo' }, { foo: 'bar' }],
        },
        {
          category: null,
          foo: 'zog',
          children: [],
        },
        {
          category: null,
          foo: 'yoo',
          children: [],
        },
      ]

      expect(groupTasksByCategories(input)).toEqual(expected)
    })
  })
})
