import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { isEmpty, isNil, isNumber } from 'lodash'
import PropTypes from 'prop-types'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { WORD, nerMarkerTypes } from 'shared/enums/markerTypes'

import {
  doesOverlapWithCurrentAnnotations,
  isEntitiesRelationEquivalent,
  isNerAnnotationEquivalent,
  isZoneAnnotationEquivalent,
  sortAndFilterNerByStart,
} from 'shared/utils/annotationUtils'

import Loader from 'shared/components/loader/Loader'
import RelationPath from 'modules/project/components/common/RelationPath'

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
  const [currentAnnotationIndexHovered, setCurrentAnnotationIndexHovered] = useState(null)
  const [currentPredictionIndexHovered, setCurrentPredictionIndexHovered] = useState(null)
  const [sourceRelation, setSourceRelation] = useState(null)
  const [annotationsNodeProperties, setAnnotationsNodeProperties] = useState([])
  const [contentDimensions, setContentDimensions] = useState()
  const [rootDimensions, setRootDimensions] = useState()
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
      resolvedPredictions.findIndex((prediction) => isZoneAnnotationEquivalent(prediction, predictionToFind))

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

    // All predictions that overlap an annotation without being equal to it are ignored
    const updatedPredictions = showPredictions
      ? resolvedPredictions
          .filter(
            (prediction) =>
              !resolvedAnnotations.some((annotation) => isNerAnnotationEquivalent(prediction, annotation)) &&
              isEmpty(doesOverlapWithCurrentAnnotations(resolvedAnnotations, prediction.ner.start, prediction.ner.end))
          )
          .map((prediction) => ({ ...prediction, predictionIndex: resolvePredictionIndex(prediction) }))
      : []

    return sortAndFilterNerByStart([...updatedAnnotations, ...updatedPredictions])
  }, [showPredictions, resolvedAnnotations, resolvedPredictions])

  const resolvedMarksValue = (charIndex) =>
    resolvedAnnotationsAndPredictions.reduce(
      (result, { value: taskValue, ner: { start, end }, annotationIndex, predictionIndex }) =>
        start <= charIndex && charIndex < end
          ? {
              taskValue,
              annotationIndex,
              predictionIndex,
            }
          : result,
      null
    )

  const isHighlighted = (charIndex) =>
    !isEmpty(highlights) && highlights.some(({ start, end }) => start <= charIndex && charIndex < end)

  const resolvedContent = useMemo(() => {
    if (!isEmpty(highlights)) {
      const result = []
      let index = 0

      content.split('').forEach((char, charIndex) => {
        const lastCharIsHighlighted =
          !isEmpty(result) && isHighlighted(charIndex) && !result[result.length - 1].isHighlight
        const lastCharIsAnnotated =
          !isEmpty(result) && resolvedMarksValue(charIndex) && !result[result.length - 1].taskValue
        const nextCharIsHighlighted = isHighlighted(charIndex) && !isHighlighted(charIndex + 1)
        const nextCharIsAnnotated = resolvedMarksValue(charIndex) && !resolvedMarksValue(charIndex + 1)

        if (lastCharIsHighlighted || lastCharIsAnnotated) {
          index++
        }

        result[index] = {
          value: `${result[index]?.value ?? ''}${char}`,
          isHighlight: isHighlighted(charIndex),
          ...resolvedMarksValue(charIndex),
        }
        if (nextCharIsHighlighted || nextCharIsAnnotated) {
          index++
        }
      })

      return result
    }
    const result = [{ value: content }]
    let lastEnd = 0

    resolvedAnnotationsAndPredictions.forEach(
      ({ value: taskValue, ner: { start, end }, annotationIndex, predictionIndex }) => {
        const lastValue = result[result.length - 1].value
        const newStart = start - lastEnd
        const newEnd = end - lastEnd
        result[result.length - 1] = { value: lastValue.slice(0, newStart) }
        result.push({
          value: lastValue.slice(newStart, newEnd),
          taskValue,
          annotationIndex,
          predictionIndex,
        })
        result.push({ value: lastValue.slice(newEnd) })
        lastEnd = end
      }
    )

    return result
  }, [resolvedAnnotationsAndPredictions, highlights, content])

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

  const resolveTask = useCallback(
    (taskValue) => {
      const task = tasks.find(({ value }) => value === taskValue)

      if (task && !task.color) {
        task.color = theme.colors.defaultAnnotationColors[tasks.findIndex((t) => t.value === task.value)]
      }

      return task
    },
    [tasks]
  )

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

  const resolveAnnotationIndex = useCallback(
    (annotationToFind) =>
      resolvedAnnotations.findIndex((annotation) => isNerAnnotationEquivalent(annotation, annotationToFind)),
    [resolvedAnnotations]
  )

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

  const isLastMarkSelected = useCallback(
    (index, key, value) => resolvedContent[index + 1]?.[key] !== value,
    [resolvedContent]
  )

  const isFirstMarkSelected = useCallback(
    (index, key, value) => resolvedContent[index - 1]?.[key] !== value,
    [resolvedContent]
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
            resolveAnnotationIndex(er.src) >= 0 &&
            resolveAnnotationIndex(er.dest) >= 0
        )

        onEntitiesRelationChange(filteredEntitiesRelations)

        setCurrentRelationSelected(null)
      }
    },
    [entitiesRelations, onEntitiesRelationChange, resolvedEntitiesRelation, resolveAnnotationIndex]
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

  const resizeRootDimensions = (node) => {
    if (node) {
      const cs = getComputedStyle(node)

      const paddingX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)
      const paddingY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)

      const borderX = parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth)
      const borderY = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth)

      const width = node.offsetWidth - paddingX - borderX
      const height = node.offsetHeight - paddingY - borderY

      setRootDimensions({ width, height })
    }
  }

  const _onWindowResize = useCallback(() => {
    if (rootRef.current) {
      resizeRootDimensions(rootRef.current)
    }
  }, [])

  useEffect(() => {
    if (contentRef.current) {
      setContentDimensions(contentRef.current.getBoundingClientRect())
    }
  }, [rootDimensions])

  useEffect(() => {
    if (rootRef.current) {
      resizeRootDimensions(rootRef.current)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('resize', _onWindowResize)

    return () => window.removeEventListener('resize', _onWindowResize)
  }, [_onWindowResize])

  useEffect(() => {
    _onWindowResize()
  }, [resolvedContent, resolvedEntitiesRelation, _onWindowResize])

  useEffect(() => {
    if (!isEmpty(contentRef.current) && !isEmpty(resolvedAnnotations)) {
      const annotationsNode = resolvedContent.reduce(
        (result, { annotationIndex }, index) =>
          isNumber(annotationIndex) ? [...result, [...(contentRef.current?.childNodes || [])][index]] : result,
        []
      )

      const newAnnotationsNodeProperties = annotationsNode.map((node) => node.getBoundingClientRect())

      setAnnotationsNodeProperties(newAnnotationsNodeProperties)
    }
  }, [contentRef, resolvedContent, resolvedAnnotations, rootDimensions, contentDimensions])

  const _onMouseUp = useCallback(() => {
    const selection = window.getSelection()

    const contentChildren = [...contentRef.current.children]

    const resolveNode = (node) => (node.nodeName === 'MARK' ? node.parentNode : node)

    if (
      !selection.isCollapsed &&
      selectedSection &&
      contentChildren.includes(resolveNode(selection.focusNode.parentNode))
    ) {
      const range = selection.getRangeAt(0)

      const resolveIndex = (node) => contentChildren.indexOf(node)

      const resolveNbrOfCharBefore = (node) =>
        resolveIndex(node) > 0
          ? resolvedContent.slice(0, resolveIndex(node)).reduce((result, { value }) => result + value.length, 0)
          : 0

      const startChar = resolvedContent[resolveIndex(range.startContainer.parentNode)]?.value[range.startOffset]
      const endChar = resolvedContent[resolveIndex(range.endContainer.parentNode)]?.value[range.endOffset - 1]

      if (!(startChar === ' ' && endChar === ' ')) {
        let startIndex = startChar === ' ' ? range.startOffset + 1 : range.startOffset
        let endIndex = endChar === ' ' ? range.endOffset - 1 : range.endOffset

        if (!isEmpty(resolvedAnnotationsAndPredictions) || !isEmpty(highlights)) {
          const startParentNode = resolveNode(range.startContainer.parentNode)
          const endParentNode = resolveNode(range.endContainer.parentNode)

          startIndex += resolveNbrOfCharBefore(startParentNode)
          endIndex += resolveNbrOfCharBefore(endParentNode)
        }

        if (startIndex >= 0 && endIndex >= 0 && startIndex <= endIndex) {
          if (mode === WORD) {
            const resolvedWords = content.split(' ')
            const isFirstWord = startIndex <= resolvedWords[0].length
            const isLastWord = endIndex > content.length - resolvedWords[resolvedWords.length - 1].length

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

          const overlap = doesOverlapWithCurrentAnnotations(resolvedAnnotations, startIndex, endIndex)

          if (!isEmpty(overlap)) {
            const isInMiddle = (start, end) => endIndex <= end && startIndex >= start
            const findAnnotation = (start, end, index) => end >= index && index >= start && !isInMiddle(start, end)

            const start =
              overlap.find(({ ner }) => findAnnotation(ner.start, ner.end, startIndex))?.ner.start || startIndex
            const end = overlap.find(({ ner }) => findAnnotation(ner.start, ner.end, endIndex))?.ner.end || endIndex

            const currentSelected = { value: selectedSection.value, ner: { start, end } }

            const filteredAnnotations = annotations.filter((annotation) => !overlap.includes(annotation))
            if (!isEmpty(resolvedEntitiesRelation)) {
              const annotationsWithOverlap = annotations.filter((annotation) => overlap.includes(annotation))

              const entitiesRelationsIndexToRemove = annotationsWithOverlap
                .reduce((acc, annotation) => {
                  acc.push(
                    resolveEntitiesRelationsEquivalentToAnnotation(annotation).filter((index) => !acc.includes(index))
                  )
                  return acc
                }, [])
                .flat()

              removeEntitiesRelations(entitiesRelationsIndexToRemove)
            }

            onAnnotationChange([...filteredAnnotations, currentSelected])
          } else {
            const currentSelected = { value: selectedSection.value, ner: { start: startIndex, end: endIndex } }
            onAnnotationChange([...annotations, currentSelected])
          }
        }
      }
      selection.removeAllRanges()
    }
  }, [
    resolvedAnnotations,
    resolvedAnnotationsAndPredictions,
    selectedSection,
    contentRef,
    onAnnotationChange,
    annotations,
    highlights,
    content,
    resolvedContent,
    mode,
    removeEntitiesRelations,
    resolveEntitiesRelationsEquivalentToAnnotation,
    resolvedEntitiesRelation,
  ])

  const _onMouseClick = useCallback(
    (index) => () => {
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
      () =>
        isAnnotation ? setCurrentAnnotationIndexHovered(index) : setCurrentPredictionIndexHovered(index),
    []
  )

  const _onMouseLeave = useCallback(
    (isAnnotation = true) =>
      () =>
        isAnnotation ? setCurrentAnnotationIndexHovered(null) : setCurrentPredictionIndexHovered(null),
    []
  )

  const _onCloseClick = useCallback(
    (index) => () => {
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

  const resolveMargin = useCallback(
    (srcAnnotationIndex) => {
      if (!isEmpty(resolvedEntitiesRelation) && isNumber(srcAnnotationIndex) && !isEmpty(annotationsNodeProperties)) {
        const srcEntitiesRelationsIndex = resolvedEntitiesRelation.findIndex(({ src }) =>
          isNerAnnotationEquivalent(src, resolvedAnnotations[srcAnnotationIndex])
        )
        if (srcEntitiesRelationsIndex >= 0) {
          const destAnnotationIndex = resolveAnnotationIndex(resolvedEntitiesRelation[srcEntitiesRelationsIndex].dest)

          return annotationsNodeProperties[srcAnnotationIndex]?.y <= annotationsNodeProperties[destAnnotationIndex]?.y
            ? 'bottom'
            : 'top'
        }
      }

      return null
    },
    [resolvedEntitiesRelation, annotationsNodeProperties, resolvedAnnotations, resolveAnnotationIndex]
  )

  const renderedContent = useMemo(
    () =>
      !isEmpty(resolvedContent) &&
      resolvedContent.map(({ value, taskValue, annotationIndex, predictionIndex, isHighlight }, index) => {
        if (taskValue) {
          const task = resolveTask(taskValue)
          return (
            <Styled.MarkContainer
              key={`mark_${index}`}
              onMouseOver={_onMouseOver(
                isNumber(annotationIndex) ? annotationIndex : predictionIndex,
                isNumber(annotationIndex)
              )}
              onClick={_onMouseClick(annotationIndex)}
              onMouseLeave={_onMouseLeave(isNumber(annotationIndex))}
              backgroundColor={task.color}
              $isHovered={isAnnotationHovered(annotationIndex)}
              $isPrediction={!isNumber(annotationIndex) && isNumber(predictionIndex)}
              margin={resolveMargin(annotationIndex)}
              isSourceRelation={isNerAnnotationEquivalent(resolvedAnnotations[annotationIndex], sourceRelation)}
            >
              <Styled.Mark
                $isHighlight={isHighlight}
                $isFirstMarkSelected={isFirstMarkSelected(
                  index,
                  annotationIndex ? 'annotationIndex' : 'predictionIndex',
                  annotationIndex || predictionIndex
                )}
                $isHovered={isAnnotationHovered(annotationIndex)}
              >
                {value}
              </Styled.Mark>
              {isLastMarkSelected(
                index,
                annotationIndex ? 'annotationIndex' : 'predictionIndex',
                annotationIndex || predictionIndex
              ) && (
                <Styled.TaskLabel>
                  {task.label}
                  {isNumber(predictionIndex) && showPredictions && <Styled.PredictionIcon />}
                  {isAnnotationHovered(annotationIndex) && (
                    <Styled.ActionButton
                      onClick={_onCloseClick(annotationIndex)}
                      icon={<CloseOutlined />}
                      type="primary"
                      shape="circle"
                    />
                  )}
                  {!isNumber(annotationIndex) && isPredictionHovered(predictionIndex) && (
                    <Styled.ActionButton
                      onClick={_onValidateClick(predictionIndex)}
                      icon={<CheckOutlined />}
                      type="primary"
                      shape="circle"
                    />
                  )}
                </Styled.TaskLabel>
              )}
            </Styled.MarkContainer>
          )
        }
        return (
          <Styled.Span $isHighlight={isHighlight} key={index}>
            {value}
          </Styled.Span>
        )
      }),
    [
      resolvedContent,
      isPredictionHovered,
      isAnnotationHovered,
      isFirstMarkSelected,
      isLastMarkSelected,
      resolveMargin,
      resolveTask,
      showPredictions,
      _onMouseClick,
      _onMouseLeave,
      _onCloseClick,
      _onMouseOver,
      _onValidateClick,
      resolvedAnnotations,
      sourceRelation,
    ]
  )

  if (!isEmpty(entitiesRelationsGroup)) {
    return (
      <Styled.Root ref={rootRef} hasRelation={!isEmpty(entitiesRelations)}>
        {rootDimensions?.width && rootDimensions?.height ? (
          <Styled.Svg
            dimensions={contentDimensions?.width && contentDimensions?.height ? contentDimensions : rootDimensions}
            height={rootDimensions.height}
            width={rootDimensions.width}
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
          >
            <Styled.ForeignObjectContent
              width={rootDimensions.width}
              height={contentDimensions?.height ? contentDimensions.height : rootDimensions.height}
            >
              <Styled.Content ref={contentRef}>{renderedContent}</Styled.Content>
            </Styled.ForeignObjectContent>
            {!isEmpty(annotationsNodeProperties) &&
              resolvedEntitiesRelation.map((er, index) => (
                <RelationPath
                  key={`${er.value}_${index}`}
                  color={resolveEntitiesRelationGroup(er.value)?.color}
                  relationIndex={index}
                  value={er.value}
                  onDeleteClick={_onRelationDeleteClick(index)}
                  srcProperties={annotationsNodeProperties[resolveAnnotationIndex(er.src)]}
                  destProperties={annotationsNodeProperties[resolveAnnotationIndex(er.dest)]}
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
    <Styled.Root ref={rootRef} hasRelation={!isEmpty(entitiesRelations)}>
      {<Styled.Content ref={contentRef}>{renderedContent}</Styled.Content>}
    </Styled.Root>
  )
}

export default NerContainer

const TaskValue = PropTypes.string

const EntitiesRelationShape = PropTypes.shape({
  /** Defines the color of the entitiesRelation object.
   * It's used to define the background of the label relation.
   * Hexadecimal format.
   * If the color does not exist we use the default colors defined in the theme. */
  color: PropTypes.string,
  value: PropTypes.value,
})

const TaskShape = PropTypes.shape({
  /** A machine-readable key that identifies the label in the backend, and that
   * is unique among the siblings of the task (but that can be used.
   * for other child nodes of other tasks). */
  value: TaskValue.isRequired,
  /** The text displayed in the list for annotators to recognise. */
  label: PropTypes.string.isRequired,
  /** A keyboard shortcut that is bound when the list is displayed to toggle.
   * this annotation. */
  hotkey: PropTypes.hotkey,
  /** If a task is not top-level, it may contain shortcuts to the value.
   * of its parents to simplify algorithms. */
  parents: PropTypes.arrayOf(TaskValue),
})

const AnnotationShape = PropTypes.shape({
  /** A machine-readable key that identifies the label in the backend, and that
   * is unique among the siblings of the task (but that can be used.
   * for other child nodes of other tasks). */
  value: TaskValue.isRequired,
  /** Contains data used to display selections on words. */
  ner: PropTypes.shape({
    /** Number indicating the beginning of the word. */
    start: PropTypes.number.isRequired,
    /** Number indicating the end of the word. */
    end: PropTypes.number.isRequired,
  }),
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
      value: TaskValue.isRequired,
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
  showPredictions: PropTypes.bool,
  /** Defines The list of the predictions of the current item. This is used to display the predictions.
   * but also to find the annotations which are also predictions. */
  predictions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      ner: PropTypes.shape({
        start: PropTypes.number,
        end: PropTypes.number,
      }),
    })
  ),
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
