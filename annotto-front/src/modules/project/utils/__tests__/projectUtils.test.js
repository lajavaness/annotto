import moment from 'moment'

import { sortLogsAndGroupByDate } from 'modules/project/utils/projectUtils'

describe('projectUtils', () => {
  const logs = [
    {
      type: 'project-add',
      user: 'Edouard P.',
      createdAt: '2021-06-07T08:24:59.436Z',
    },
    {
      type: 'project-add',
      user: 'Edouard P.',
      createdAt: '2021-06-08T08:24:59.436Z',
    },
    {
      value: ['Name', 'Skill'],
      item: '607403dbee0ba9001c5de205',
      type: 'annotation-add',
      user: 'Simon D.',
      createdAt: '2021-06-03T12:13:49.344Z',
    },
    {
      type: 'project-add',
      user: 'Edouard P.',
      createdAt: '2021-06-04T08:24:59.436Z',
    },
    {
      value: ['Name', 'Skill'],
      item: '607403dbee0ba9001c5de205',
      type: 'annotation-add',
      user: 'Simon D.',
      createdAt: '2021-06-02T12:13:49.344Z',
    },
    {
      value: ['Name'],
      item: '607403dbee0ba9001c5de204',
      type: 'annotation-add',
      user: 'Simon D.',
      createdAt: '2021-05-31T12:55:27.927Z',
    },
    {
      value: ['Name'],
      item: '607403dbee0ba9001c5de204',
      type: 'annotation-add',
      user: 'Simon D.',
      createdAt: '2021-05-01T12:55:27.927Z',
    },
    {
      value: ['Formation', 'Tag 1', 'Formation', 'Formation'],
      item: '607403dbee0ba9001c5de206',
      type: 'annotation-add',
      user: 'Simon D.',
      createdAt: '2021-04-15T12:56:31.635Z',
    },
    {
      value: ['belongs_to', 'is_unit', 'belongs_to'],
      item: '607403dbee0ba9001c5de206',
      type: 'relation-add',
      user: 'Simon D.',
      createdAt: '2021-04-16T12:56:31.665Z',
    },
    {
      value: ['Name', 'Experience'],
      item: '607403dbee0ba9001c5de206',
      type: 'annotation-add',
      user: 'Simon D.',
      createdAt: '2021-03-15T12:57:49.543Z',
    },
    {
      value: ['Name', 'Experience'],
      item: '607403dbee0ba9001c5de206',
      type: 'annotation-add',
      user: 'Simon D.',
      createdAt: '2021-02-15T12:57:49.543Z',
    },
    {
      value: ['Name', 'Experience'],
      item: '607403dbee0ba9001c5de206',
      type: 'annotation-add',
      user: 'Simon D.',
      createdAt: '2021-01-15T12:57:49.543Z',
    },
    {
      value: ['Name', 'Experience'],
      item: '607403dbee0ba9001c5de206',
      type: 'annotation-add',
      user: 'Simon D.',
      createdAt: '2020-12-15T12:57:49.543Z',
    },
    {
      value: ['Name', 'Experience'],
      item: '607403dbee0ba9001c5de206',
      type: 'annotation-add',
      user: 'Simon D.',
      createdAt: '2020-11-15T12:57:49.543Z',
    },
    {
      value: ['Name', 'Experience'],
      item: '607403dbee0ba9001c5de206',
      type: 'annotation-add',
      user: 'Simon D.',
      createdAt: '2020-10-03T12:57:49.543Z',
    },
    {
      value: ['Name', 'Experience'],
      item: '607403dbee0ba9001c5de206',
      type: 'annotation-add',
      user: 'Simon D.',
      createdAt: '2020-06-06T12:57:49.543Z',
    },
    {
      value: ['Name', 'Experience'],
      item: '607403dbee0ba9001c5de206',
      type: 'annotation-add',
      user: 'Simon D.',
      createdAt: '2019-06-06T12:57:49.543Z',
    },
    {
      value: ['Name', 'Experience'],
      item: '607403dbee0ba9001c5de206',
      type: 'annotation-add',
      user: 'Simon D.',
      createdAt: '2018-05-26T12:57:49.543Z',
    },
    {
      value: ['Name', 'Experience'],
      item: '607403dbee0ba9001c5de206',
      type: 'annotation-add',
      user: 'Simon D.',
      createdAt: '2017-07-26T12:57:49.543Z',
    },
    {
      value: ['Name', 'Experience'],
      item: '607403dbee0ba9001c5de206',
      type: 'annotation-add',
      user: 'Simon D.',
      createdAt: '2016-05-26T12:57:49.543Z',
    },
    {
      value: ['Name', 'Experience'],
      item: '607403dbee0ba9001c5de206',
      type: 'annotation-add',
      user: 'Simon D.',
      createdAt: '2015-10-26T12:57:49.543Z',
    },
  ]

  const now = moment('2021-06-08T08:23:59.436Z')

  describe('sortLogsByDate', () => {
    const todayLogs = [{ label: now.clone().endOf('day').toString(), values: [logs[1]] }]

    const yesterdayLogs = [{ label: moment(logs[0].createdAt).clone().endOf('day').toString(), values: [logs[0]] }]

    const daysLogs = [
      { label: moment(logs[0].createdAt).clone().endOf('day').toString(), values: [logs[0]] },
      { label: moment(logs[3].createdAt).clone().endOf('day').toString(), values: [logs[3]] },
      { label: moment(logs[2].createdAt).clone().endOf('day').toString(), values: [logs[2]] },
      { label: moment(logs[4].createdAt).clone().endOf('day').toString(), values: [logs[4]] },
    ]

    const monthsLogs = [
      { label: moment(logs[8].createdAt).clone().startOf('month').toString(), values: [logs[8], logs[7]] },
    ]

    const yearsLogs = [
      { label: moment(logs[15].createdAt).clone().startOf('years').toString(), values: [logs[15]] },
      { label: moment(logs[16].createdAt).clone().startOf('years').toString(), values: [logs[16]] },
    ]

    const completeLogs = [
      { label: now.clone().endOf('day').toString(), values: [logs[1]] },
      { label: moment(logs[0].createdAt).clone().endOf('day').toString(), values: [logs[0]] },
      { label: moment(logs[3].createdAt).clone().endOf('day').toString(), values: [logs[3]] },
      { label: moment(logs[2].createdAt).clone().endOf('day').toString(), values: [logs[2]] },
      { label: moment(logs[4].createdAt).clone().endOf('day').toString(), values: [logs[4]] },
      { label: moment(logs[5].createdAt).clone().endOf('day').toString(), values: [logs[5]] },
      { label: moment(logs[6].createdAt).clone().startOf('month').toString(), values: [logs[6]] },
      { label: moment(logs[8].createdAt).clone().startOf('month').toString(), values: [logs[8], logs[7]] },
      { label: moment(logs[9].createdAt).clone().startOf('month').toString(), values: [logs[9]] },
      { label: moment(logs[10].createdAt).clone().startOf('month').toString(), values: [logs[10]] },
      { label: moment(logs[11].createdAt).clone().startOf('month').toString(), values: [logs[11]] },
      { label: moment(logs[12].createdAt).clone().startOf('month').toString(), values: [logs[12]] },
      { label: moment(logs[13].createdAt).clone().startOf('month').toString(), values: [logs[13]] },
      { label: moment(logs[14].createdAt).clone().startOf('month').toString(), values: [logs[14]] },
      { label: moment(logs[15].createdAt).clone().startOf('years').toString(), values: [logs[15]] },
      { label: moment(logs[16].createdAt).clone().startOf('years').toString(), values: [logs[16]] },
      { label: moment(logs[17].createdAt).clone().startOf('years').toString(), values: [logs[17]] },
      { label: moment(logs[18].createdAt).clone().startOf('years').toString(), values: [logs[18]] },
      { label: moment(logs[19].createdAt).clone().startOf('years').toString(), values: [logs[19]] },
      { label: moment(logs[20].createdAt).clone().startOf('years').toString(), values: [logs[20]] },
    ]

    const logCases = [
      {
        title: 'Returns empty array if logs are empty',
        input: [],
        expected: [],
      },
      {
        title: 'Returns empty array if logs are nulls',
        input: null,
        expected: [],
      },
      {
        title: "Returns array of today's logs",
        input: [logs[1]],
        expected: todayLogs,
      },
      {
        title: "Returns array of yesterday's logs",
        input: [logs[0]],
        expected: yesterdayLogs,
      },
      {
        title: "Returns array of days' logs",
        input: [logs[0], logs[2], logs[3], logs[4]],
        expected: daysLogs,
      },
      {
        title: 'Returns array of logs for months',
        input: [logs[7], logs[8]],
        expected: monthsLogs,
      },
      {
        title: 'Returns array of logs for years',
        input: [logs[15], logs[16]],
        expected: yearsLogs,
      },
      {
        title: 'Returns array of all previous logs sorted in descending order',
        input: [logs[1], logs[0], logs[2], logs[3], logs[4], logs[7], logs[8], logs[15], logs[16]],
        expected: [...todayLogs, ...daysLogs, ...monthsLogs, ...yearsLogs],
      },
      {
        title: 'Returns array of all logs sorted in descending order',
        input: logs,
        expected: [...completeLogs],
      },
    ]

    logCases.forEach(({ title, input, expected }) => {
      it(title, () => {
        expect(sortLogsAndGroupByDate(input, now)).toEqual(expected)
      })
    })

    it('Returns empty array if there is no provided date from logs', () => {
      const input = [logs[1]]
      const output = []
      expect(sortLogsAndGroupByDate(input, null)).toEqual(output)
    })

    it('Returns empty array if there is no valid input', () => {
      const input = [{ foo: 'foo' }]
      const output = []
      expect(sortLogsAndGroupByDate(input, now)).toEqual(output)
    })

    it('Returns empty array if both date and logs are null', () => {
      const input = null
      const output = []
      expect(sortLogsAndGroupByDate(input, null)).toEqual(output)
    })
  })
})
