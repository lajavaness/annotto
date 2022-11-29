import { ENTITIES_RELATIONS_GROUP } from 'shared/enums/taskTypes'
import { cloneDeep, isEmpty, isEqual, isNumber, isString, merge, pickBy, uniq } from 'lodash'
import format from 'dayjs'

export const mapEntitiesRelationsGroupResponseService = (input) => {
  if (isEmpty(input)) return input

  return input.map(({ _id, name, max, min, values }) => ({
    _id,
    name,
    max,
    min,
    type: ENTITIES_RELATIONS_GROUP,
    values: !isEmpty(values)
      ? values.map(({ label, value, color, hotkey, description }) => ({
          label,
          value,
          type: ENTITIES_RELATIONS_GROUP,
          color,
          hotkey,
          description,
        }))
      : [],
  }))
}

export const mapTasksToLabelingService = (input) => {
  if (isEmpty(input)) return input

  return input.reduce(
    (tasks, { category, conditions = [], type, min, max, value, label, color, hotkey, description, _id }) => {
      let task =
        tasks.find(
          ({ name, conditions: taskConditions }) => name === category && isEqual(taskConditions, conditions)
        ) || {}
      const values = task?.values || []

      task = pickBy(
        {
          name: category,
          conditions: conditions || [],
          type,
          max,
          min,
          values: [
            ...values,
            pickBy(
              {
                value,
                label,
                color,
                hotkey,
                description,
                _id,
              },
              (pickValue) => !isEmpty(pickValue)
            ),
          ],
        },
        (pickValue) => !!pickValue
      )

      const taskIndex = tasks.findIndex(
        ({ name, conditions: taskCondition }) => name === task.name && isEqual(taskCondition, conditions)
      )
      if (taskIndex >= 0) {
        tasks[taskIndex] = task
      } else {
        tasks.push(task)
      }
      return tasks
    },
    []
  )
}

export const mapConfigProjectResponseService = (data) => {
  if (isEmpty(data)) return data

  const {
    client,
    type,
    name,
    deadline,
    description,
    defaultTags,
    admins,
    dataScientists,
    users,
    guidelines,
    api,
    s3,
    tasks,
    labeling,
    file,
    entitiesRelationsGroup,
  } = data

  const newEntitiesRelationsGroup = mapEntitiesRelationsGroupResponseService(entitiesRelationsGroup) || []

  const labelingFromTasks = mapTasksToLabelingService(tasks) || []

  return pickBy(
    {
      name,
      client: client?.name || client,
      type,
      deadline: deadline && format(deadline),
      description,
      defaultTags,
      admins: uniq(admins),
      dataScientists: uniq(dataScientists),
      users: uniq(users),
      api,
      s3,
      file,
      guidelines,
      labeling: labeling || [...labelingFromTasks, ...newEntitiesRelationsGroup],
    },
    (value) => isString(value) || !isEmpty(value)
  )
}

export const mergeConfigService = (newConfig, oldConfig) => {
  if (isEmpty(oldConfig) || isEmpty(newConfig)) return newConfig || null

  return merge(cloneDeep(oldConfig), cloneDeep(newConfig))
}

export const mapLabelingToTasksService = (input) => {
  if (isEmpty(input)) return input
  return input.reduce((result, { values, name, type, conditions, min, max }) => {
    if (!isEmpty(values)) {
      values.forEach((categoryLabel) => {
        result.push(
          pickBy(
            {
              ...categoryLabel,
              category: name,
              type,
              conditions,
              min,
              max,
            },
            (value) => !isEmpty(value) || !isNumber(value)
          )
        )
      })
    }
    return result
  }, [])
}

export const mapEntitiesRelationsGroupPutRequestService = (input) => {
  if (isEmpty(input)) return input
  return input.map(({ _id, name, max, min, values }) => ({
    name,
    max,
    min,
    _id,
    values: !isEmpty(values)
      ? values.map(({ label, value, color, hotkey, description }) => ({ label, value, color, hotkey, description }))
      : [],
  }))
}

export const mapConfigProjectPostRequestService = (data) => {
  if (isEmpty(data)) return data
  const {
    name,
    client,
    type: projectType,
    deadline,
    description,
    defaultTags,
    admins,
    dataScientists,
    users,
    item,
    prediction,
    api,
    guidelines,
    s3,
    labeling,
  } = data

  return {
    ...pickBy(
      {
        name,
        client,
        type: projectType,
        deadline,
        description,
        defaultTags,
        admins,
        dataScientists,
        users,
        item,
        prediction,
        api,
        guidelines,
        s3,
        tasks: mapLabelingToTasksService(labeling?.filter(({ type }) => type !== ENTITIES_RELATIONS_GROUP)) || {},
        entitiesRelationsGroup: !isEmpty(labeling)
          ? mapEntitiesRelationsGroupPutRequestService(
              labeling?.filter(({ type }) => type === ENTITIES_RELATIONS_GROUP)
            )
          : {},
      },
      (value) => isString(value) || !isEmpty(value)
    ),
  }
}
