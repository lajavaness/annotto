import { find, findIndex, isEmpty, isNil } from 'lodash'
import moment from 'moment'

import { ALL } from 'shared/enums/valueTypes'
import { RANGE, SIMILAR_TO, CONTAINS_ALL, EQUAL } from 'shared/enums/operatorTypes'
import { ANNOTATED, ANNOTATE_AT, ANNOTATE_BY, TAGS, UUID } from 'shared/enums/fieldTypes'

export const mapFilterFormToFilterJson = (input) => {
  if (isEmpty(input)) {
    return input
  }

  let filters = []

  if (!isNil(input?.annotated) && input?.annotated !== ALL) {
    filters.push({ field: ANNOTATED, operator: EQUAL, value: input.annotated })
  }

  if (!isEmpty(input?.[ANNOTATE_AT])) {
    filters.push({ field: ANNOTATE_AT, operator: RANGE, value: input[ANNOTATE_AT] })
  }

  if (!isEmpty(input?.[ANNOTATE_BY])) {
    filters.push({ field: ANNOTATE_BY, operator: CONTAINS_ALL, value: input[ANNOTATE_BY] })
  }

  if (!isEmpty(input?.[TAGS])) {
    filters.push({ field: TAGS, operator: CONTAINS_ALL, value: input[TAGS] })
  }

  if (!isEmpty(input?.[SIMILAR_TO])) {
    filters.push({ field: UUID, operator: SIMILAR_TO, value: input[SIMILAR_TO] })
  }

  if (!isEmpty(input?.filters)) {
    filters = filters.concat(input.filters)
  }

  return filters
}

export const mapFilterJsonToFilterForm = (input) => {
  if (isEmpty(input)) {
    return input
  }

  const filters = [...input]
  let annotated
  let annotatedAt
  let annotatedBy
  let tags
  let similarTo

  if (find(input, ['field', ANNOTATED])) {
    annotated = find(input, ['field', ANNOTATED])?.value
    filters.splice(findIndex(filters, ['field', ANNOTATED]), 1)
  } else {
    annotated = ALL
  }

  if (find(input, ['field', ANNOTATE_AT])) {
    annotatedAt = [
      moment(find(input, ['field', ANNOTATE_AT]).value[0]),
      moment(find(input, ['field', ANNOTATE_AT]).value[1]),
    ]
    filters.splice(findIndex(filters, ['field', ANNOTATE_AT]), 1)
  }

  if (find(input, { field: ANNOTATE_BY, operator: CONTAINS_ALL })) {
    annotatedBy = find(input, { field: ANNOTATE_BY, operator: CONTAINS_ALL }).value
    filters.splice(findIndex(filters, { field: ANNOTATE_BY, operator: CONTAINS_ALL }), 1)
  }

  if (find(input, { field: TAGS, operator: CONTAINS_ALL })) {
    tags = find(input, { field: TAGS, operator: CONTAINS_ALL }).value
    filters.splice(findIndex(filters, { field: TAGS, operator: CONTAINS_ALL }), 1)
  }

  if (find(input, ['field', UUID])) {
    similarTo = find(input, ['field', UUID])?.value
    filters.splice(findIndex(filters, ['field', UUID]), 1)
  }

  return { annotated, annotatedAt, annotatedBy, tags, similarTo, filters }
}
