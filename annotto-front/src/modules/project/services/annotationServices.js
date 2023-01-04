import { isArray, isBoolean, isEmpty, isNull, isNumber, pickBy } from 'lodash'

import { ANNOTATION_ITEMS_SIZE } from 'shared/enums/paginationTypes'
import { DONE, NER, TEXT, ZONE, VIDEO } from 'shared/enums/annotationTypes'
import { IMAGE as PROJECT_IMAGE, TEXT as PROJECT_TEXT, VIDEO as PROJECT_VIDEO } from 'shared/enums/projectTypes'

export const mapAnnotationItemsPredictionsKeyResponseService = (input) => {
  if (isEmpty(input)) {
    return input
  }
  let ner = null

  if (isNumber(input?.ner?.start) && isNumber(input?.ner?.end)) {
    ner = input.ner
  } else if (isNumber(input?.start) && isNumber(input?.end)) {
    ner = { start: input.start, end: input.end }
  }

  return pickBy(
    {
      value: input?.value,
      ner,
      zone: input?.zone,
      text: input?.text,
    },
    (value) => !isEmpty(value)
  )
}

export const mapAnnotationItemResponseService = (input) => {
  if (isEmpty(input)) return input
  return pickBy(
    {
      _id: input?._id || null,
      type: input?.type || null,
      status: input?.status || null,
      annotated: input?.annotated || null,
      annotatedBy: input?.annotatedBy || null,
      annotationValues: input?.annotationValues || null,
      annotations: input?.annotations || null,
      highlights: input?.highlights || null,
      tags: input?.tags || null,
      annotatedAt: input?.annotatedAt || null,
      velocity: input?.velocity || null,
      annotationTimes: input?.annotationTimes || null,
      lastAnnotator: input?.lastAnnotator || null,
      commentCount: input?.commentCount || null,
      logCount: input?.logCount || null,
      entitiesRelations: input?.entitiesRelations || null,
      sourceHighlights: input?.sourceHighlights || null,
      raw: input?.raw || null,
      project: input?.project || null,
      uuid: input?.uuid || null,
      compositeUuid: input?.compositeUuid || null,
      data: input?.data || null,
      body: input?.body || null,
      updatedAt: input?.updatedAt || null,
      createdAt: input?.createdAt || null,
      logs: input?.logs || null,
      predictions: !isEmpty(input?.predictions)
        ? {
            raw: input.predictions?.raw || null,
            keys: !isEmpty(input.predictions?.keys)
              ? input.predictions?.keys.map((keys) => mapAnnotationItemsPredictionsKeyResponseService(keys))
              : null,
          }
        : null,
      seenAt: input?.seenAt || null,
    },
    (value) => isNumber(value) || !isNull(value) || isBoolean(value)
  )
}

export const filterAndMergeAnnotationItemsService = (items, newItems) => {
  if (isEmpty(items)) {
    return newItems
  }

  const filteredNewItems = newItems.filter(({ _id }) => items.some((item) => item._id !== _id))

  return [...items, ...filteredNewItems]
}

export const filterAndAddAnnotationsToItemService = (annotations, item) => {
  if (isEmpty(annotations) || isEmpty(item)) return item

  const filteredAnnotation = annotations.filter(({ status }) => status === DONE)

  if (isEmpty(filteredAnnotation)) return { ...item, annotations: filteredAnnotation }

  const newAnnotations = filteredAnnotation.map(({ value, ner, zone, text }) =>
    pickBy(
      {
        value,
        ner,
        zone,
        text,
      },
      (pickValue) => isNumber(pickValue) || !isEmpty(pickValue)
    )
  )

  return { ...item, annotations: newAnnotations }
}

export const addLogsToItemService = (logs, item) => {
  if (isEmpty(logs) || isEmpty(item)) return item

  return { ...item, logs }
}

export const updateItemsService = (items, itemToUpdate) => {
  if (!isArray(items) || isEmpty(itemToUpdate)) return items

  const mappedItemToUpdate = mapAnnotationItemResponseService(itemToUpdate)

  if (!items.some(({ _id }) => _id === mappedItemToUpdate._id)) {
    return [...items, mappedItemToUpdate]
  }

  return isEmpty(items)
    ? [mappedItemToUpdate]
    : items.map((item) => (item._id === mappedItemToUpdate._id ? mappedItemToUpdate : item))
}

export const filterAndAddItemService = (items, item) => {
  if (isEmpty(items) || isEmpty(item)) {
    return items
  }

  const slicedItems = items.slice(-ANNOTATION_ITEMS_SIZE + 1)
  return [...slicedItems.filter(({ _id }) => _id !== item._id), item]
}

export const mapAnnotationRequestService = (input) => {
  if (isEmpty(input)) return input

  return pickBy(
    {
      value: input.value || null,
      ner: input.ner || null,
      zone: !isEmpty(input.zone) ? input.zone.map(({ x, y }) => ({ x, y })) : null,
      text: input.text || null,
    },
    (value) => isNumber(value) || !isNull(value) || isBoolean(value)
  )
}

export const mapAnnotationsRequestService = (input) => {
  if (isEmpty(input)) {
    return input
  }

  return input.map((annotation) => mapAnnotationRequestService(annotation))
}

export const isNerAnnotationItem = (tasks) => !!tasks?.some((task) => task.type === NER)

export const findAnnotationItemType = (projectType, tasks) => {
  switch (projectType) {
    case PROJECT_TEXT: {
      if (isNerAnnotationItem(tasks)) {
        return NER
      }
      return TEXT
    }

    case PROJECT_IMAGE: {
      return ZONE
    }

    case PROJECT_VIDEO: {
      return VIDEO
    }
    default:
      throw new Error('No annotation type found')
  }
}
