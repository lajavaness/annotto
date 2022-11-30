import { Checkbox, Typography } from 'antd'
import { GlobalHotKeys } from 'react-hotkeys'
import { isEmpty, map } from 'lodash'
import PropTypes from 'prop-types'
import React, { useCallback, useMemo } from 'react'

import Hotkey from 'shared/components/hotkey/Hotkey'
import TagsOutlinedIcon from 'modules/project/components/common/TagsOutlinedIcon'

import theme from '__theme__'

import { findDependantTasks } from 'modules/project/utils/labelListUtils'

import { mapTasksToLabelingService } from 'modules/configurationProject/services/configurationProjectServices'

import * as Styled from './__styles__/CheckLabelList.styles'

const CheckLabelList = ({ tasks, annotations, onChange, showPredictions, predictions }) => {
  const _onLabelChange = useCallback(
    (value) => () => {
      if (annotations?.some((annotation) => annotation.value === value)) {
        const allDependentTasks = findDependantTasks(value, tasks)
        const newAnnotations = annotations.filter(
          (annotation) => ![...allDependentTasks, value].includes(annotation.value)
        )
        onChange(newAnnotations)
      } else {
        onChange([...annotations, { value }])
      }
    },
    [onChange, annotations, tasks]
  )

  const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ+0123456789'
  const resolveKeyMap = useCallback(
    (values) =>
      values.reduce((result, { value, hotkey }) => {
        if (value && hotkey) {
          result[value] = hotkey
        }

        // NOTE: react-hotkeys doesn't handle caps lock properly, so we only bind
        // the shift modifier for capital letters at the moment.
        if (UPPER.includes(hotkey)) {
          result[`__SHIFT__${value}`] = `Shift+${hotkey.toLowerCase()}`
        }

        return result
      }, {}),
    []
  )

  const resolveHandlers = useCallback(
    (values) =>
      values.reduce((result, { value }) => {
        if (value) {
          result[value] = _onLabelChange(value)
          result[`__SHIFT__${value}`] = _onLabelChange(value)
        }

        return result
      }, {}),
    [_onLabelChange]
  )

  const annotationValues = useMemo(() => annotations.map(({ value }) => value), [annotations])
  const tasksPerLabel = useMemo(
    () =>
      mapTasksToLabelingService(tasks).filter(
        (task) => !task.conditions.some((condition) => !annotationValues.includes(condition))
      ),
    [tasks, annotationValues]
  )

  return (
    <Styled.Root>
      {tasksPerLabel.map((task) => (
        <GlobalHotKeys
          keyMap={resolveKeyMap(task.values)}
          handlers={resolveHandlers(task.values)}
          allowChanges
          key={`${task.name}${task.conditions.toString()}`}
        >
          <Typography.Title level={5}>{task.name}</Typography.Title>
          <Styled.CheckboxGroup data-testid="__check-label-list__" value={annotationValues}>
            <Styled.ItemRow $hasBelowSevenChildren={task.values.length < 8}>
              {map(task.values, ({ value, label, hotkey, color }, i) => (
                <Styled.ItemCol key={`${value}_${i}`}>
                  <Styled.Label data-testid="__checkbox__" onClick={_onLabelChange(value)}>
                    <Styled.ColoredLeftSection backgroundColor={color} />
                    <Styled.CheckboxLabel>
                      <Checkbox value={value} />
                      <Styled.LabelText ellipsis={{ tooltip: true }}>{label}</Styled.LabelText>
                    </Styled.CheckboxLabel>
                    <Styled.IconHotkey>
                      {!isEmpty(predictions) && showPredictions && predictions.some((e) => e.value === value) && (
                        <TagsOutlinedIcon twoToneColor={theme.colors.predictionIconPrimary} />
                      )}
                      {!isEmpty(hotkey) && <Hotkey isSelected={annotationValues.includes(value)} label={hotkey} />}
                    </Styled.IconHotkey>
                  </Styled.Label>
                </Styled.ItemCol>
              ))}
            </Styled.ItemRow>
          </Styled.CheckboxGroup>
        </GlobalHotKeys>
      ))}
    </Styled.Root>
  )
}

export default CheckLabelList

const TaskValue = PropTypes.string

const TaskSection = PropTypes.shape({
  /** Defines the label of the section. */
  name: PropTypes.string,
  /** Defines the values to display in the section. */
  // FIXME rename values to labels / classes
  values: PropTypes.arrayOf(
    PropTypes.shape({
      /** A machine-readable key that identifies the value in the backend, and that
       * is unique among the siblings of the task (but that can be used.
       * for other child nodes of other tasks). */
      value: TaskValue.isRequired,
      /** The text displayed in the list for annotators to recognise. */
      label: PropTypes.string.isRequired,
      /** A keyboard shortcut that is bound when the list is displayed to toggle.
       * this annotation. */
      hotkey: PropTypes.hotkey,
      /** The element's background color.  */
      color: PropTypes.color,
      /** The potential additional tasks that become available to the annotator.
       * once this task has been annotated. */
      children: PropTypes.object, // TODO should be a TaskSection too. FIXME rename to childSection
      /** If a task is not top-level, it may contain shortcuts to the IDs.
       * of its parents to simplify algorithms. */
      parents: PropTypes.arrayOf(TaskValue),
    })
  ),
})

CheckLabelList.propTypes = {
  /** The hierarchy of labels that will be displayed in this list. Each section.
   * contains a title and multiple labels, which can themselves have children. */
  tasks: PropTypes.arrayOf(TaskSection),
  /** The list of label IDs that are currently annotated. Callees must manage this.
   * list in their state. */
  annotations: PropTypes.arrayOf(
    PropTypes.shape({
      /** A machine-readable key that identifies the value in the backend, and that
       * is unique among the siblings of the task (but that can be used.
       * for other child nodes of other tasks). */
      value: TaskValue.isRequired,
    })
  ).isRequired,
  /** Define if predictions should appear on labels. */
  showPredictions: PropTypes.bool,
  /** Defines the values of predictions. */
  predictions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
    })
  ),
  /** A callback that will be called whenever a label is annotated or unannotated.
   * Contains the updated list of annotated ids as the first parameter. */
  onChange: PropTypes.func,
}

CheckLabelList.defaultProps = {
  tasks: [],
  annotations: [],
  onChange: null,
  showPredictions: true,
  predictions: [],
}
