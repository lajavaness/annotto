import { isArray, isEmpty, isEqualWith, isNil } from 'lodash'
import { isNerAnnotationEquivalent } from 'shared/utils/annotationUtils'

export const sortAndFilterNerByStart = (input) => {
  if (!isArray(input) || isEmpty(input)) return input
  return input.filter(({ ner }) => !!ner).sort(({ ner: { start: a } }, { ner: { start: b } }) => a - b)
}

const isHighlighted = (charIndex, highlights) =>
  !isEmpty(highlights) && highlights.some(({ start, end }) => start <= charIndex && charIndex < end)

export const getCharAnnotations = (charIndex, annotations) => {
  if (isEmpty(annotations) || isNil(charIndex)) {
    return []
  }

  return annotations.reduce(
    (result, { value: taskValue, ner: { start, end }, annotationIndex, predictionIndex }) =>
      start <= charIndex && charIndex < end
        ? [
            ...result,
            {
              taskValue,
              annotationIndex,
              predictionIndex,
              isFirstMark: start === charIndex,
              isLastMark: end - 1 === charIndex,
              start,
              end,
            },
          ]
        : result,
    []
  )
}

export const splitContentToAnnotationMarks = (string, annotations, highlights) => {
  if (isEmpty(string)) {
    return []
  }

  return string.split('').reduce((result, char, i) => {
    const charAnnotations = getCharAnnotations(i, annotations)
    const charHighlight = isHighlighted(i, highlights)
    if (
      isEmpty(result) ||
      !isEqualWith(charAnnotations, result.at(-1).charAnnotations, (a, b, key) =>
        key === 'isFirstMark' || key === 'isLastMark' ? true : undefined
      ) ||
      charHighlight !== result.at(-1).isHighlight
    ) {
      result.push({
        value: char,
        charAnnotations,
        isHighlight: charHighlight,
      })
    } else {
      const lastItem = result.at(-1)
      lastItem.value += char
      lastItem.isHighlight = lastItem.isHighlight || charHighlight
      lastItem.charAnnotations = lastItem.charAnnotations.map((ca) => ({
        ...ca,
        isLastMark: charAnnotations.find(({ taskValue }) => taskValue === ca.taskValue)?.isLastMark ?? ca.isLastMark,
      }))
    }
    return result
  }, [])
}

export const doesAnnotationNerAlreadyExist = (annotations, annotationToCheck) =>
  annotations.some((annotation) => isNerAnnotationEquivalent(annotation, annotationToCheck))

export const getTextNodes = (node) => {
  let textNodes = []
  if (node.nodeType === Node.TEXT_NODE && node.parentNode.tagName !== 'SUP') {
    textNodes.push(node)
  } else {
    Array.from(node.childNodes).forEach((child) => {
      textNodes = [...textNodes, ...getTextNodes(child)]
    })
  }
  return textNodes
}

export const getAnnotationMarkNode = (annotationIndex, nodes) => {
  if (!isNil(annotationIndex) && !isEmpty(nodes)) {
    return nodes.filter((node) => node?.annotationIndex === annotationIndex).at(-1)?.node || null
  }

  return null
}

export const getAnnotationIndex = (annotationToFind, annotations) => {
  if (!isNil(annotationToFind) && !isEmpty(annotations)) {
    return annotations.findIndex((annotation) => isNerAnnotationEquivalent(annotation, annotationToFind))
  }
  return -1
}
