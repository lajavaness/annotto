import { isEmpty, isNumber } from 'lodash'
import { forwardRef, useCallback } from 'react'
import PropTypes from 'prop-types'

import { isNerAnnotationEquivalent } from 'shared/utils/annotationUtils'

import NerMark, {
  CharAnnotationShape,
  HandlerNerMarkShape,
  NerMarkPropTypes,
  TaskShape,
} from 'modules/project/components/common/NerMark'

import theme from '__theme__'

import * as Styled from 'modules/project/components/common/__styles__/NerContainer.styles'

const NerMarks = (
  {
    annotationMarks,
    tasks,
    isPredictionHovered,
    isAnnotationHovered,
    sourceRelation,
    showPredictions,
    onMouseClick,
    onMouseLeave,
    onCloseClick,
    onMouseOver,
    onValidateClick,
  },
  setRef
) => {
  const getTask = useCallback(
    (taskValue) => {
      const task = tasks.find(({ value }) => value === taskValue)

      if (task && !task.color) {
        task.color = theme.colors.defaultAnnotationColors[tasks.findIndex((t) => t.value === task.value)]
      }

      return task
    },
    [tasks]
  )

  return (
    !isEmpty(annotationMarks) &&
    annotationMarks.map(({ value, isHighlight, charAnnotations }, index) => {
      if (!isEmpty(charAnnotations)) {
        return charAnnotations.reduce((result, charAnnotation, markIndex) => {
          const { annotationIndex, predictionIndex, taskValue, start, end } = charAnnotation
          const task = getTask(taskValue)

          const isSourceRelation = isNerAnnotationEquivalent(sourceRelation, {
            value: taskValue,
            ner: { start, end },
          })

          return (
            <NerMark
              ref={setRef(index - markIndex, annotationIndex)}
              key={`mark_${index}_${markIndex}`}
              task={task}
              {...charAnnotation}
              isHighlight={isHighlight}
              isPredictionHovered={isPredictionHovered}
              isAnnotationHovered={isAnnotationHovered}
              isSourceRelation={isSourceRelation}
              showPredictions={showPredictions}
              onMouseClick={onMouseClick(annotationIndex)}
              onMouseLeave={onMouseLeave(isNumber(annotationIndex))}
              onCloseClick={onCloseClick(annotationIndex)}
              onMouseOver={onMouseOver(
                isNumber(annotationIndex) ? annotationIndex : predictionIndex,
                isNumber(annotationIndex)
              )}
              onValidateClick={onValidateClick(predictionIndex)}
            >
              {markIndex === 0 ? value : result}
            </NerMark>
          )
        }, null)
      }
      return (
        <Styled.Span ref={setRef(index)} $isHighlight={isHighlight} key={index}>
          {value}
        </Styled.Span>
      )
    })
  )
}

export default forwardRef(NerMarks)

export const AnnotationShape = PropTypes.shape({
  /** A machine-readable key that identifies the label in the backend, and that
   * is unique among the siblings of the task (but that can be used.
   * for other child nodes of other tasks). */
  value: PropTypes.string.isRequired,
  /** Contains data used to display selections on words. */
  ner: PropTypes.shape({
    /** Number indicating the beginning of the word. */
    start: PropTypes.number.isRequired,
    /** Number indicating the end of the word. */
    end: PropTypes.number.isRequired,
  }),
})

NerMarks.propTypes = {
  annotationMarks: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      isHighlight: NerMarkPropTypes.isHighlight,
      charAnnotations: PropTypes.arrayOf(
        PropTypes.shape({ ...CharAnnotationShape, start: PropTypes.number, end: PropTypes.number })
      ),
    })
  ),
  sourceRelation: AnnotationShape,
  annotations: PropTypes.arrayOf(AnnotationShape),
  tasks: PropTypes.arrayOf(TaskShape),
  isPredictionHovered: NerMarkPropTypes.isPredictionHovered,
  isAnnotationHovered: NerMarkPropTypes.isAnnotationHovered,
  showPrediction: NerMarkPropTypes.showPredictions,
  ...HandlerNerMarkShape,
}

NerMarks.defaultProps = {}
