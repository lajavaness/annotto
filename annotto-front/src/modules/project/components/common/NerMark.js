import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { isNumber } from 'lodash'
import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'

import * as Styled from 'modules/project/components/common/__styles__/NerContainer.styles'

const NerMark = (
  {
    task,
    annotationIndex,
    predictionIndex,
    isFirstMark,
    isLastMark,
    isSourceRelation,
    children,
    isHighlight,
    isPredictionHovered,
    isAnnotationHovered,
    showPredictions,
    onMouseClick,
    onMouseLeave,
    onCloseClick,
    onMouseOver,
    onValidateClick,
  },
  ref
) => {
  return (
    <Styled.MarkContainer
      data-testid={`__ner-mark__${annotationIndex}`}
      ref={ref}
      onMouseOver={onMouseOver}
      onClick={onMouseClick}
      onMouseLeave={onMouseLeave}
      backgroundColor={task.color}
      $isHovered={isAnnotationHovered(annotationIndex)}
      $isPrediction={!isNumber(annotationIndex) && isNumber(predictionIndex)}
      isSourceRelation={isSourceRelation}
    >
      <Styled.Mark
        $isHighlight={isHighlight}
        $isFirstMarkSelected={isFirstMark}
        $isHovered={isAnnotationHovered(annotationIndex)}
      >
        {children}
      </Styled.Mark>
      {isLastMark && (
        <Styled.TaskLabel>
          {task.label}
          {isNumber(predictionIndex) && showPredictions && <Styled.PredictionIcon />}
          {isAnnotationHovered(annotationIndex) && (
            <Styled.ActionButton onClick={onCloseClick} icon={<CloseOutlined />} type="primary" shape="circle" />
          )}
          {!isNumber(annotationIndex) && isPredictionHovered(predictionIndex) && (
            <Styled.ActionButton onClick={onValidateClick} icon={<CheckOutlined />} type="primary" shape="circle" />
          )}
        </Styled.TaskLabel>
      )}
    </Styled.MarkContainer>
  )
}

export default forwardRef(NerMark)

const TaskValue = PropTypes.string

export const TaskShape = PropTypes.shape({
  /** A machine-readable key that identifies the label in the backend, and that
   * is unique among the siblings of the task (but that can be used.
   * for other child nodes of other tasks). */
  value: TaskValue.isRequired,
  /** The text displayed in the list for annotators to recognise. */
  label: PropTypes.string.isRequired,
  /** A keyboard shortcut that is bound when the list is displayed to toggle.
   * this annotation. */
  hotkey: PropTypes.string,
  /** Defines the color of the task object.
   * It's used to define the background of the label relation.
   * Hexadecimal format.
   * If the color does not exist we use the default colors defined in the theme. */
  color: PropTypes.string,
  /** If a task is not top-level, it may contain shortcuts to the value.
   * of its parents to simplify algorithms. */
  parents: PropTypes.arrayOf(TaskValue),
})

export const CharAnnotationShape = {
  annotationIndex: PropTypes.number,
  predictionIndex: PropTypes.number,
  isFirstMark: PropTypes.bool.isRequired,
  isLastMark: PropTypes.bool.isRequired,
  isSourceRelation: PropTypes.bool.isRequired,
}

export const HandlerNerMarkShape = {
  onMouseClick: PropTypes.func.isRequired,
  onMouseLeave: PropTypes.func.isRequired,
  onCloseClick: PropTypes.func.isRequired,
  onMouseOver: PropTypes.func.isRequired,
  onValidateClick: PropTypes.func.isRequired,
}

NerMark.propTypes = {
  ...CharAnnotationShape,
  isHighlight: PropTypes.bool,
  task: TaskShape.isRequired,
  children: PropTypes.node,
  isPredictionHovered: PropTypes.func.isRequired,
  isAnnotationHovered: PropTypes.func.isRequired,
  showPredictions: PropTypes.bool.isRequired,
  ...HandlerNerMarkShape,
}

export const NerMarkPropTypes = NerMark.propTypes
