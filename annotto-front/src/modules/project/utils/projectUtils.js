import { isEmpty } from 'lodash'
import { sortByCreatedAt } from 'shared/utils/dateUtils'
import moment from 'moment'

const getGroupByDate = (logs, granularity, isEnd) => {
  const group = []

  logs.forEach(({ createdAt }) => {
    const currentDate = isEnd
      ? moment(createdAt).clone().endOf(granularity)
      : moment(createdAt).clone().startOf(granularity)
    const alreadyExist = group.some((existingDate) => existingDate.isSame(currentDate))

    if (!alreadyExist) {
      group.push(currentDate)
    }
  })
  return group
}

const filterLogs = (logs, date, granularity) =>
  logs.filter(({ createdAt }) => moment(createdAt).clone().isSame(date, granularity))

export const sortLogsAndGroupByDate = (logs, now) => {
  if (isEmpty(logs) || !now) {
    return []
  }

  const sortedLogs = sortByCreatedAt(logs).filter(({ createdAt }) => !!createdAt)

  const today = moment(now)

  const groupedLogs = []

  const filteredLogsToGroupByDays = sortedLogs.filter(({ createdAt }) =>
    moment(createdAt).isAfter(today.clone().subtract(25, 'days'))
  )

  const days = getGroupByDate(filteredLogsToGroupByDays, 'day', true)

  days.forEach((day) => {
    groupedLogs.push({ label: day.toString(), values: filterLogs(filteredLogsToGroupByDays, day, 'days') })
  })

  const filteredLogsToGroupByMonths = sortedLogs.filter(({ createdAt }) => {
    return (
      // between the range of 25(a month) and 320 days(a year), months are displayed
      moment(createdAt).isBefore(today.clone().subtract(25, 'days')) &&
      moment(createdAt).isAfter(moment(today).clone().subtract(320, 'days'))
    )
  })

  const months = getGroupByDate(filteredLogsToGroupByMonths, 'month', false)

  months.forEach((month) => {
    groupedLogs.push({ label: month.toString(), values: filterLogs(filteredLogsToGroupByMonths, month, 'months') })
  })

  const thisYear = today.clone().startOf('year')

  // subtracting 320 days ago = 10 months ago, to represent a year ago from today's date
  const filteredLogsToGroupByYears = sortedLogs.filter(({ createdAt }) => {
    return !moment(createdAt).isSame(thisYear) && moment(createdAt).isBefore(today.clone().subtract(320, 'days'))
  })

  const years = getGroupByDate(filteredLogsToGroupByYears, 'years', false)

  years.forEach((year) => {
    groupedLogs.push({ label: year.toString(), values: filterLogs(filteredLogsToGroupByYears, year, 'years') })
  })

  return groupedLogs
}
