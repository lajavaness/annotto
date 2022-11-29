import { isArray, isEmpty, isEqual, isNumber, isObject, isString } from 'lodash'

export const sortAndFilterNerByStart = (input) => {
  if (!isArray(input) || isEmpty(input)) return input
  return input.filter(({ ner }) => !!ner).sort(({ ner: { start: a } }, { ner: { start: b } }) => a - b)
}

export const isAnnotationNer = (annotation) =>
  isObject(annotation) && isNumber(annotation?.ner?.start) && isNumber(annotation?.ner?.end)

export const doesOverlapWithCurrentAnnotations = (annotations, start, end) => {
  if (isArray(annotations) && !isEmpty(annotations) && isNumber(start) && isNumber(end)) {
    return annotations
      .filter((a) => isAnnotationNer(a))
      .filter(
        ({ ner }) =>
          (start >= ner.start && start <= ner.end) ||
          (end >= ner.start && end <= ner.end) ||
          (ner.start >= start && ner.end <= end) ||
          (ner.start <= start && ner.end >= end) ||
          ner.start === end ||
          ner.end === start
      )
  }

  return []
}

export const _equivalenceWrapper = (isEquivalent) => {
  return (input, other) => {
    if (isObject(input) && isObject(other)) {
      return isEquivalent(input, other)
    }
    return false
  }
}

export const _isNerAnnotationEquivalent = (input, other) => {
  if (
    isNumber(input?.ner?.start) &&
    isNumber(input?.ner?.end) &&
    isNumber(other?.ner?.start) &&
    isNumber(other?.ner?.end)
  ) {
    return input.ner.start === other.ner.start && input.ner.end === other.ner.end
  }
  return false
}

export const _isTextAnnotationEquivalent = (input, other) => {
  if (isString(input?.text) && isString(other?.text)) {
    return input.text === other.text
  }
  return false
}

export const _isClassificationAnnotationEquivalent = (input, other) => isEqual(input, other)

export const _isZoneEquivalent = (input, other) => {
  if (
    isArray(input?.zone) &&
    isArray(other?.zone) &&
    input.zone.length === other.zone.length &&
    input.zone.every(({ x, y }) => isNumber(x) && isNumber(y)) &&
    other.zone.every(({ x, y }) => isNumber(x) && isNumber(y))
  ) {
    return input.zone.every(({ x, y }, index) => other.zone[index].x === x && other.zone[index].y === y)
  }

  return false
}

export const isNerAnnotationEquivalent = _equivalenceWrapper((input, other) => _isNerAnnotationEquivalent(input, other))

export const isClassificationAnnotationEquivalent = _equivalenceWrapper((input, other) =>
  _isClassificationAnnotationEquivalent(input, other)
)

export const isZoneAnnotationEquivalent = _equivalenceWrapper((input, other) => _isZoneEquivalent(input, other))

export const isPredictionEquivalentToAnnotation = _equivalenceWrapper(
  (input, other) =>
    _isNerAnnotationEquivalent(input, other) ||
    _isClassificationAnnotationEquivalent(input, other) ||
    _isTextAnnotationEquivalent(input, other) ||
    _isZoneEquivalent(input, other)
)

export const _isEntitiesRelationEquivalent = (input, other) => {
  if (
    isNerAnnotationEquivalent(input?.src, other?.src) &&
    isNerAnnotationEquivalent(input?.dest, other?.dest) &&
    input.value
  ) {
    return input.value === other.value
  }
  return false
}

export const isEntitiesRelationEquivalent = _equivalenceWrapper((input, other) =>
  _isEntitiesRelationEquivalent(input, other)
)
