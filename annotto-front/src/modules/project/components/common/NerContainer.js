import { isEmpty, isNil, isNumber } from 'lodash'
import PropTypes from 'prop-types'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { WORD, nerMarkerTypes } from 'shared/enums/markerTypes'

import { isEntitiesRelationEquivalent, isNerAnnotationEquivalent } from 'shared/utils/annotationUtils'

import {
  splitContentToAnnotationMarks,
  doesAnnotationNerAlreadyExist,
  getAnnotationIndex,
  getAnnotationMarkNode,
  getTextNodes,
  sortAndFilterNerByStart,
} from 'modules/project/services/nerAnnotationServices'

import useNerDimensions from 'modules/project/hooks/useNerDimensions'

import Loader from 'shared/components/loader/Loader'
import RelationPath from 'modules/project/components/common/RelationPath'
import { NerMarkPropTypes, TaskShape } from 'modules/project/components/common/NerMark'
import NerMarks, { AnnotationShape } from 'modules/project/components/common/NerMarks'

import theme from '__theme__'

import * as Styled from 'modules/project/components/common/__styles__/NerContainer.styles'

const NerContainer = ({
  content,
  highlights,
  annotations,
  entitiesRelations,
  mode,
  tasks,
  selectedSection,
  selectedRelation,
  showPredictions,
  predictions,
  onAnnotationChange,
  onEntitiesRelationChange,
  entitiesRelationsGroup,
}) => {
  const contentRef = useRef(null)
  const rootRef = useRef(null)
  const marksRef = useRef([])

  const [currentAnnotationIndexHovered, setCurrentAnnotationIndexHovered] = useState(null)
  const [currentPredictionIndexHovered, setCurrentPredictionIndexHovered] = useState(null)
  const [sourceRelation, setSourceRelation] = useState(null)
  const [currentRelationSelected, setCurrentRelationSelected] = useState(null)

  const resolvedAnnotations = useMemo(
    () => (!isEmpty(annotations) ? sortAndFilterNerByStart(annotations) : []),
    [annotations]
  )

  const resolvedPredictions = useMemo(
    () => (!isEmpty(predictions) ? sortAndFilterNerByStart(predictions) : []),
    [predictions]
  )

  const resolvedAnnotationsAndPredictions = useMemo(() => {
    const resolvePredictionIndex = (predictionToFind) =>
      resolvedPredictions.findIndex((prediction) => isNerAnnotationEquivalent(prediction, predictionToFind))

    const updatedAnnotations = resolvedAnnotations.map((annotation, annotationIndex) => {
      const predictionIndex = resolvedPredictions.findIndex((prediction) =>
        isNerAnnotationEquivalent(prediction, annotation)
      )
      return {
        ...annotation,
        annotationIndex,
        predictionIndex: predictionIndex >= 0 ? predictionIndex : null,
      }
    })

    const updatedPredictions = showPredictions
      ? resolvedPredictions
          .filter((prediction) => !doesAnnotationNerAlreadyExist(resolvedAnnotations, prediction))
          .map((prediction) => ({ ...prediction, predictionIndex: resolvePredictionIndex(prediction) }))
      : []

    return sortAndFilterNerByStart([...updatedAnnotations, ...updatedPredictions])
  }, [showPredictions, resolvedAnnotations, resolvedPredictions])

  const annotationMarks = useMemo(
    () => splitContentToAnnotationMarks(content, resolvedAnnotationsAndPredictions, highlights, entitiesRelations),
    [content, resolvedAnnotationsAndPredictions, entitiesRelations, highlights]
  )

  const resolvedEntitiesRelationsGroup = useMemo(
    () => (!isNil(entitiesRelationsGroup) ? entitiesRelationsGroup.map(({ values }) => values).flat() : []),
    [entitiesRelationsGroup]
  )

  const resolvedEntitiesRelation = useMemo(() => {
    if (currentRelationSelected) {
      const filteredEntitiesRelations = entitiesRelations.filter(
        (er) => !isEntitiesRelationEquivalent(er, currentRelationSelected)
      )

      return [...filteredEntitiesRelations, currentRelationSelected]
    }

    return entitiesRelations
  }, [entitiesRelations, currentRelationSelected])

  const [rootDimensions, contentDimensions] = useNerDimensions(rootRef, contentRef, [
    annotationMarks,
    resolvedEntitiesRelation,
  ])

  const resolveEntitiesRelationGroup = (entitiesRelationValue) => {
    const entitiesRelationIndex = resolvedEntitiesRelationsGroup.findIndex(
      ({ value }) => value === entitiesRelationValue
    )

    if (entitiesRelationIndex >= 0) {
      const entitiesRelation = { ...resolvedEntitiesRelationsGroup[entitiesRelationIndex] }
      if (!entitiesRelation.color) {
        entitiesRelation.color = theme.colors.defaultAnnotationColors[entitiesRelationIndex]
      }

      return entitiesRelation
    }

    return null
  }

  const isAnnotationHovered = useCallback(
    (index) =>
      isNumber(currentAnnotationIndexHovered) &&
      isNerAnnotationEquivalent(resolvedAnnotations[index], resolvedAnnotations[currentAnnotationIndexHovered]),
    [currentAnnotationIndexHovered, resolvedAnnotations]
  )

  const isPredictionHovered = useCallback(
    (index) =>
      isNumber(currentPredictionIndexHovered) &&
      isNerAnnotationEquivalent(resolvedPredictions[index], resolvedPredictions[currentPredictionIndexHovered]),
    [currentPredictionIndexHovered, resolvedPredictions]
  )

  const removeEntitiesRelations = useCallback(
    (indexList) => {
      if (!isEmpty(entitiesRelations) && !!onEntitiesRelationChange) {
        const filteredEntitiesRelations = entitiesRelations.filter(
          (er) =>
            !indexList.some(
              (index) =>
                resolvedEntitiesRelation[index] && isEntitiesRelationEquivalent(er, resolvedEntitiesRelation[index])
            ) &&
            getAnnotationIndex(er.src, resolvedAnnotations) >= 0 &&
            getAnnotationIndex(er.dest, resolvedAnnotations) >= 0
        )

        onEntitiesRelationChange(filteredEntitiesRelations)

        setCurrentRelationSelected(null)
      }
    },
    [entitiesRelations, onEntitiesRelationChange, resolvedEntitiesRelation, resolvedAnnotations]
  )

  const resolveEntitiesRelationsEquivalentToAnnotation = useCallback(
    (annotation) => {
      if (!isEmpty(resolvedEntitiesRelation) && annotation) {
        return resolvedEntitiesRelation.reduce(
          (result, { src, dest }, indexToRemove) =>
            isNerAnnotationEquivalent(src, annotation) || isNerAnnotationEquivalent(dest, annotation)
              ? [...result, indexToRemove]
              : result,
          []
        )
      }
      return []
    },
    [resolvedEntitiesRelation]
  )

  const _onMouseUp = () => {
    const selection = window.getSelection()
    if (!selection.isCollapsed) {
      const textNodes = getTextNodes(contentRef.current)

      const range = selection.getRangeAt(0)

      let { startOffset, endOffset } = range
      const { startContainer, endContainer } = range

      let startChar = startContainer.textContent[startOffset]
      let endChar = endContainer.textContent[endOffset - 1]

      while (startChar === ' ') {
        startOffset++
        startChar = startContainer.textContent[startOffset]
      }

      while (endChar === ' ') {
        endOffset--
        endChar = endContainer.textContent[endOffset - 1]
      }

      const getPrevTotalChars = (node) =>
        textNodes.indexOf(node) > 0
          ? textNodes.slice(0, textNodes.indexOf(node)).reduce((result, nodeText) => result + nodeText.length, 0)
          : 0

      let startIndex = getPrevTotalChars(startContainer) + startOffset
      let endIndex = getPrevTotalChars(endContainer) + endOffset

      if (mode === WORD) {
        const words = content.split(' ')
        const isFirstWord = startIndex <= words[0].length
        const isLastWord = endIndex > content.length - words.at(-1).length

        startIndex = !isFirstWord
          ? content
              .slice(0, startIndex)
              .split('')
              .reduce((result, char, index) => (char === ' ' ? index : result), 0) + 1
          : 0

        endIndex = !isLastWord
          ? content
              .slice(endIndex)
              .split('')
              .findIndex((el) => el === ' ') + endIndex
          : content.length
      }

      selection.removeAllRanges()

      const currentSelected = { value: selectedSection.value, ner: { start: startIndex, end: endIndex } }

      if (!doesAnnotationNerAlreadyExist(annotations, currentSelected)) {
        onAnnotationChange([...annotations, currentSelected])
      }
    }
  }

  const _onMouseClick = useCallback(
    (index) => (e) => {
      e.stopPropagation()
      if (isNumber(index) && onEntitiesRelationChange && selectedRelation) {
        if (!sourceRelation) {
          setSourceRelation(resolvedAnnotations[index])
          return
        }

        if (!isNerAnnotationEquivalent(sourceRelation, resolvedAnnotations[index])) {
          const entitiesRelation = {
            src: sourceRelation,
            dest: resolvedAnnotations[index],
            value: selectedRelation.value,
          }

          if (!entitiesRelations.some((er) => isEntitiesRelationEquivalent(er, entitiesRelation))) {
            onEntitiesRelationChange([...resolvedEntitiesRelation, entitiesRelation])
          }
        }

        setSourceRelation(null)
      }
    },
    [
      resolvedEntitiesRelation,
      onEntitiesRelationChange,
      entitiesRelations,
      selectedRelation,
      resolvedAnnotations,
      sourceRelation,
    ]
  )

  useEffect(() => {
    window.addEventListener('mouseup', _onMouseUp, false)

    return () => window.removeEventListener('mouseup', _onMouseUp)
  }, [_onMouseUp])

  const _onMouseOver = useCallback(
    (index, isAnnotation = true) =>
      (e) => {
        e.stopPropagation()
        return isAnnotation ? setCurrentAnnotationIndexHovered(index) : setCurrentPredictionIndexHovered(index)
      },
    []
  )

  const _onMouseLeave = useCallback(
    (isAnnotation = true) =>
      () =>
        isAnnotation ? setCurrentAnnotationIndexHovered(null) : setCurrentPredictionIndexHovered(null),
    []
  )

  const _onCloseClick = useCallback(
    (index) => (e) => {
      e.stopPropagation()
      if (!!resolvedAnnotations[index] && !isEmpty(annotations) && !!onAnnotationChange) {
        const filteredAnnotations = annotations.filter(
          (annotation) =>
            !isNerAnnotationEquivalent(annotation, resolvedAnnotations[index]) &&
            annotation.value !== tasks.find((task) => task.conditions.includes(resolvedAnnotations[index].value))?.value
        )

        if (!isEmpty(resolvedEntitiesRelation)) {
          const entitiesRelationsIndexToRemove = resolveEntitiesRelationsEquivalentToAnnotation(
            resolvedAnnotations[index]
          )
          removeEntitiesRelations(entitiesRelationsIndexToRemove)
        }

        setCurrentAnnotationIndexHovered(null)
        onAnnotationChange(filteredAnnotations)
      }
    },
    [
      annotations,
      tasks,
      onAnnotationChange,
      resolvedAnnotations,
      resolvedEntitiesRelation,
      removeEntitiesRelations,
      resolveEntitiesRelationsEquivalentToAnnotation,
    ]
  )

  useEffect(() => {
    marksRef.current = annotationMarks.map((_, index) => marksRef.current[index] ?? null)
  }, [annotationMarks, resolvedAnnotations])

  useEffect(() => {
    const containNodes = marksRef?.current?.every((mark) => !!mark)
    if (marksRef?.current && containNodes) {
      marksRef.current.forEach(({ node, annotationIndex }) => {
        const srcRelation =
          (!isNil(annotationIndex) &&
            resolvedEntitiesRelation.find(({ src }) =>
              isNerAnnotationEquivalent(src, resolvedAnnotations[annotationIndex])
            )) ||
          null

        if (srcRelation) {
          const destAnnotationIndex = getAnnotationIndex(srcRelation.dest, resolvedAnnotations)
          const destAnnotationNode = getAnnotationMarkNode(destAnnotationIndex, marksRef.current)
          const margin =
            node.getBoundingClientRect().y <= destAnnotationNode?.getBoundingClientRect()?.y ? 'Bottom' : 'Top'

          node.style[`margin${margin}`] = '50px'
        } else {
          node.style.marginBottom = null
          node.style.marginTop = null
        }
      })
    }
  }, [resolvedEntitiesRelation, resolvedAnnotations, rootDimensions])

  const setMarksRef = (index, annotationIndex) => (node) => {
    if (!isNil(index)) {
      marksRef.current[index] = !isNil(annotationIndex) ? { node, annotationIndex } : { node }
    }
  }

  const _onValidateClick = useCallback(
    (index) => () => {
      if (!!resolvedPredictions[index] && !!onAnnotationChange) {
        setCurrentPredictionIndexHovered(null)
        onAnnotationChange([...annotations, resolvedPredictions[index]])
      }
    },
    [annotations, onAnnotationChange, resolvedPredictions]
  )

  const _onRelationDeleteClick = useCallback(
    (index) => () => removeEntitiesRelations([index]),
    [removeEntitiesRelations]
  )

  const _onRelationClick = (relation) => () => setCurrentRelationSelected(relation)

  const getNodeProperties = (annotation) => {
    const annotationIndex = getAnnotationIndex(annotation, resolvedAnnotations)
    const node = getAnnotationMarkNode(annotationIndex, marksRef?.current)
    return node?.getBoundingClientRect() || null
  }

  if (!isEmpty(entitiesRelationsGroup)) {
    return (
      <Styled.Root ref={rootRef} hasRelation={!isEmpty(entitiesRelations)} data-testid={'__ner-item__'}>
        {rootDimensions?.width && rootDimensions?.height ? (
          <Styled.Svg
            dimensions={rootDimensions}
            height={rootDimensions.height}
            width={rootDimensions.width}
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
          >
            <Styled.ForeignObjectContent width={rootDimensions.width} height={rootDimensions.height}>
              <Styled.Content ref={contentRef}>
                <NerMarks
                  ref={setMarksRef}
                  isAnnotationHovered={isAnnotationHovered}
                  isPredictionHovered={isPredictionHovered}
                  annotationMarks={annotationMarks}
                  tasks={tasks}
                  sourceRelation={sourceRelation}
                  showPredictions={showPredictions}
                  onMouseClick={_onMouseClick}
                  onMouseLeave={_onMouseLeave}
                  onCloseClick={_onCloseClick}
                  onMouseOver={_onMouseOver}
                  onValidateClick={_onValidateClick}
                />
              </Styled.Content>
            </Styled.ForeignObjectContent>
            {!isEmpty(resolvedEntitiesRelation) &&
              resolvedEntitiesRelation.map((er, index) => (
                <RelationPath
                  key={`${er.value}_${index}`}
                  color={resolveEntitiesRelationGroup(er.value)?.color}
                  relationIndex={index}
                  value={er.value}
                  onDeleteClick={_onRelationDeleteClick(index)}
                  srcProperties={getNodeProperties(er.src)}
                  destProperties={getNodeProperties(er.dest)}
                  parentContainerProperties={contentDimensions}
                  onClick={_onRelationClick(er)}
                  isSelected={isEntitiesRelationEquivalent(er, currentRelationSelected)}
                />
              ))}
          </Styled.Svg>
        ) : (
          <Loader />
        )}
      </Styled.Root>
    )
  }
  return (
    <Styled.Root ref={rootRef} hasRelation={!isEmpty(entitiesRelations)} data-testid={'__ner-item__'}>
      {
        <Styled.Content ref={contentRef}>
          <NerMarks
            ref={setMarksRef}
            isAnnotationHovered={isAnnotationHovered}
            isPredictionHovered={isPredictionHovered}
            annotationMarks={annotationMarks}
            tasks={tasks}
            sourceRelation={sourceRelation}
            showPredictions={showPredictions}
            onMouseClick={_onMouseClick}
            onMouseLeave={_onMouseLeave}
            onCloseClick={_onCloseClick}
            onMouseOver={_onMouseOver}
            onValidateClick={_onValidateClick}
          />
        </Styled.Content>
      }
    </Styled.Root>
  )
}

export default NerContainer

const EntitiesRelationShape = PropTypes.shape({
  /** Defines the color of the entitiesRelation object.
   * It's used to define the background of the label relation.
   * Hexadecimal format.
   * If the color does not exist we use the default colors defined in the theme. */
  color: PropTypes.string,
  value: PropTypes.string,
})

NerContainer.propTypes = {
  /** The content of the item, each word will be decomposed to create a span per word.  */
  content: PropTypes.string,
  /** Defines the highlighted characters of the item. */
  highlights: PropTypes.arrayOf(
    PropTypes.shape({
      /** Defines the character where the highlight begins. */
      start: PropTypes.number,
      /** Defines the character where the highlight ends. */
      end: PropTypes.number,
      /** Defines the text of the highlight. */
      text: PropTypes.string,
      /** Defines the score of the highlight. The value is between 0 and 1. */
      score: PropTypes.number,
    })
  ),
  /** The list of the annotation that are currently selected. Callees must manage this.
   * list in their state. */
  annotations: PropTypes.arrayOf(AnnotationShape),
  /** The list of the entitiesRelations that are currently selected. Callees must manage this.
   * list in their state. */
  entitiesRelations: PropTypes.arrayOf(
    PropTypes.shape({
      /** A machine-readable key that identifies the label of the entitiesRelations
       * in the backend, and that is unique among the siblings of the.
       * entitiesRelations (but that can be used for other child nodes of other entitiesRelations). */
      value: PropTypes.string.isRequired,
      /* Defines the source of the entitiesRelations, this is the annotation
       * from which the link should start. */
      src: AnnotationShape,
      /* Defines the destination of the entitiesRelations, this is the annotation
       * from which the link should end. */
      dest: AnnotationShape,
    })
  ),
  /** Defines the mode of annotation, if the annotation is with 2,4 or multiple points. */
  mode: PropTypes.oneOf(nerMarkerTypes),
  /** The same list of labels as those available in the ZoneTools component.
   * Used here to retrieve the colours of annotations. */
  tasks: PropTypes.arrayOf(TaskShape),
  /** The list of relations applicable to two annotation labels, as provided to ZoneTools.
   * Also used to retrieve the colours to apply when drawing a relation. */
  entitiesRelationsGroup: PropTypes.arrayOf(
    PropTypes.shape({
      values: PropTypes.arrayOf(EntitiesRelationShape),
    })
  ),
  /** Defines the current task selected, this allows to select the text.
   * with the right color and add the right label. */
  selectedSection: TaskShape,
  /** Defines the current relation selected, this allows you to select.
   * two annotations and create a link between them. */
  selectedRelation: EntitiesRelationShape,
  /** Defines if predictions should appear. */
  showPredictions: NerMarkPropTypes.showPredictions,
  /** Defines The list of the predictions of the current item. This is used to display the predictions.
   * but also to find the annotations which are also predictions. */
  predictions: PropTypes.arrayOf(AnnotationShape),
  /** A callback that will be called whenever words is selected, unselected.
   * or if delete button on selected word is clicked. */
  onAnnotationChange: PropTypes.func,
  /** A callback that will be called whenever two annotations are clicked to create a relation. */
  onEntitiesRelationChange: PropTypes.func,
}

NerContainer.defaultProps = {
  content: null,
  annotations: [],
  highlights: [],
  tasks: [],
  entitiesRelationsGroup: [],
  entitiesRelations: [],
  selectedSection: null,
  selectedRelation: null,
  onAnnotationChange: null,
  onEntitiesRelationChange: null,
  mode: WORD,
  showPredictions: true,
  predictions: [],
}
