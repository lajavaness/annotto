import { sortByCreatedAt } from 'shared/utils/dateUtils'

describe('dateUtils', () => {
  describe('sortByCreatedAt', () => {
    const foo = [
      {
        name: 'foo',
        createdAt: '2021-06-05T08:24:59.436Z',
      },
      {
        name: 'bar',
        createdAt: '2021-06-07T08:24:59.436Z',
      },
      {
        name: 'baz',
        createdAt: '2021-06-08T08:24:59.436Z',
      },
    ]

    const fooCases = [
      {
        title: 'Returns an object if input is null',
        input: null,
        expected: {},
      },
      {
        title: 'Returns an object if input is empty string',
        input: '',
        expected: {},
      },
      {
        title: 'Returns an object if input is undefined',
        input: undefined,
        expected: {},
      },
      {
        title: 'Returns an object if input is empty array',
        input: [],
        expected: {},
      },
      {
        title: 'Returns an object if input is empty object',
        input: {},
        expected: {},
      },
      {
        title: 'Returns array of sorted date by most recent',
        input: foo,
        expected: [foo[2], foo[1], foo[0]],
      },
    ]

    fooCases.forEach(({ title, input, expected }) => {
      it(title, () => {
        expect(sortByCreatedAt(input)).toEqual(expected)
      })
    })
  })
})
