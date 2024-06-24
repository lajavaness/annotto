import { GlobalHotKeys } from 'react-hotkeys'
import { Button, Space, Typography } from 'antd'
import { isEmpty, isNil } from 'lodash'
import { useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'
import { useCallback, useEffect, useMemo } from 'react'

import { CHAR, FOUR_POINTS, POLYGON, TWO_POINTS, WORD, nerMarkerTypes, zoneMarkerTypes } from 'shared/enums/markerTypes'

import FourPointsIcon from 'modules/project/components/common/FourPointsIcon'
import Hotkey from 'shared/components/hotkey/Hotkey'
import PolygonIcon from 'modules/project/components/common/PolygonIcon'
import TwoPointsIcon from 'modules/project/components/common/TwoPointsIcon'

import theme from '__theme__'

import * as Styled from 'modules/project/components/common/__styles__/ZoneTools.styles'

const ZoneTools = ({
  isProjectTypeText,
  selectedMode,
  selectedSection,
  selectedRelation,
  tasks,
  entitiesRelationsGroup,
  onToolChange,
  onSelectionChange,
  onRelationChange,
  annotations,
}) => {
  const { t } = useTranslation('project')

  const resolvedEntitiesRelationsGroup = useMemo(
    () =>
      !isNil(entitiesRelationsGroup)
        ? entitiesRelationsGroup.reduce((result, { values }) => [...result, ...values], [])
        : [],
    [entitiesRelationsGroup]
  )

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ([27, 32].includes(event.keyCode)) {
        event.preventDefault()
        onSelectionChange()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const resolveContentMode = useCallback(
    (type) =>
      ({
        [TWO_POINTS]: { label: <TwoPointsIcon />, hotkey: '2' },
        [FOUR_POINTS]: { label: <FourPointsIcon />, hotkey: '4' },
        [POLYGON]: { label: <PolygonIcon />, hotkey: '+' },
        [WORD]: { label: t('project:annotation.labeling.word'), hotkey: '2' },
        [CHAR]: { label: t('project:annotation.labeling.char'), hotkey: '4' },
      }[type]),
    [t]
  )

  const _onSelectionChange = useCallback(
    (selectionValue, section) => (e) =>
      onSelectionChange && onSelectionChange(section.find(({ value }) => value === (e.target.value || selectionValue))),
    [onSelectionChange]
  )

  const _onRelationChange = useCallback(
    (selectionValue, section) => (e) =>
      onRelationChange && onRelationChange(section.find(({ value }) => value === (e.target.value || selectionValue))),
    [onRelationChange]
  )

  const _onToolChange = useCallback((value) => (e) => onToolChange(value || e.target.value), [onToolChange])

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
    (values, onChange) =>
      values.reduce((result, { value }) => {
        if (value) {
          result[value] = onChange(value, values)
          result[`__SHIFT__${value}`] = onChange(value, values)
        }

        return result
      }, {}),
    []
  )

  const resolveMode = useMemo(() => {
    const marker = (isProjectTypeText ? nerMarkerTypes : zoneMarkerTypes).map((type) => ({
      type,
      hotkey: resolveContentMode(type).hotkey,
      label: resolveContentMode(type).label,
    }))

    return (
      <>
        <Typography.Title level={5}>
          {t(`project:annotation.labeling.${isProjectTypeText ? 'mode' : 'tool'}`)}
        </Typography.Title>
        <Styled.RadioGroupMode value={selectedMode} onChange={_onToolChange()}>
          <GlobalHotKeys keyMap={resolveKeyMap(marker)} handlers={resolveHandlers(marker, _onToolChange)}>
            {marker.map(({ type, hotkey, label }, index) => (
              <Styled.RadioButtonMode key={index} value={type}>
                <span>{label}</span>
                <Hotkey isSelected={selectedMode === type} label={hotkey} />
              </Styled.RadioButtonMode>
            ))}
          </GlobalHotKeys>
        </Styled.RadioGroupMode>
      </>
    )
  }, [t, isProjectTypeText, _onToolChange, resolveHandlers, resolveKeyMap, resolveContentMode, selectedMode])

  const resolveSection = useCallback(
    (data, selected, onChange, title) => (
      <>
        <Styled.TitleContainer align="baseline">
          <Typography.Title level={5}>{title}</Typography.Title>
          <Button onClick={onChange(null, data)} value="small">
            <Space>
              {t(`project:annotation.labeling.resetSections`)}
              <Hotkey isSelected={!selected?.value} label={t(`project:annotation.labeling.escape`)} />
            </Space>
          </Button>
        </Styled.TitleContainer>
        <Styled.RadioGroupSection value={selected?.value} onChange={onChange(null, data)}>
          <GlobalHotKeys keyMap={resolveKeyMap(data)} handlers={resolveHandlers(data, onChange)}>
            {data
              .filter(
                ({ conditions }) =>
                  !conditions?.length ||
                  conditions?.every((condition) => annotations.some((annotation) => annotation.value === condition))
              )
              .map(({ value, label, hotkey, color, _id }, index) => (
                <Styled.RadioButtonSection key={index} value={value}>
                  <Styled.SectionsContainer>
                    <Styled.ColoredLeftSection
                      background={color || theme.colors.defaultAnnotationColors[index] || null}
                    />
                    {label}
                    {!isEmpty(hotkey) && <Hotkey isSelected={selected?._id === _id} label={hotkey} />}
                  </Styled.SectionsContainer>
                </Styled.RadioButtonSection>
              ))}
          </GlobalHotKeys>
        </Styled.RadioGroupSection>
      </>
    ),
    [resolveHandlers, resolveKeyMap, annotations]
  )
  return (
    <Styled.Root>
      {resolveMode}
      {resolveSection(tasks, selectedSection, _onSelectionChange, t('project:annotation.labeling.sections'))}
      {!isEmpty(resolvedEntitiesRelationsGroup) &&
        resolveSection(
          resolvedEntitiesRelationsGroup,
          selectedRelation,
          _onRelationChange,
          t('project:annotation.labeling.relations')
        )}
    </Styled.Root>
  )
}

export default ZoneTools

const EntitiesRelationShape = PropTypes.shape({
  /** A machine-readable key that identifies the entitiesRelation. */
  _id: PropTypes.string,
  /** Defines the value of the entitiesRelation object. */
  value: PropTypes.value,
  /** Defines the label of the entitiesRelation object. */
  label: PropTypes.string,
  /** A keyboard shortcut that is bound when the list is displayed to toggle.
   * this entitiesRelation. */
  hotkey: PropTypes.string,
  /** Defines the color of the entitiesRelation object. */
  color: PropTypes.string,
})

const TaskValue = PropTypes.string

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

ZoneTools.propTypes = {
  /** Defines if the project is of type text in order to manage the display of the Col containing the mode. */
  isProjectTypeText: PropTypes.bool,
  /** Defines the mode selected:
   * TWO_POINTS, FOUR_POINTS, POLYGON for project type image.
   * and WORD, CHAR for project type text. */
  selectedMode: PropTypes.string,
  /** Defines the current task selected, this allows to select the text.
   * with the right color and add the right label. */
  selectedSection: TaskShape,
  /** Defines the current relation selected, this allows you to select.
   * two annotations and create a link between them. */
  selectedRelation: EntitiesRelationShape,
  /** Defines the tasks to display. */
  tasks: PropTypes.arrayOf(TaskShape),
  annotations: PropTypes.arrayOf(
    PropTypes.shape({
      /** A machine-readable key that identifies the value in the backend, and that
       * is unique among the siblings of the task (but that can be used.
       * for other child nodes of other tasks). */
      value: TaskValue.isRequired,
    })
  ).isRequired,
  /** Defines the entitiesRelationsGroup to display. */
  entitiesRelationsGroup: PropTypes.arrayOf(
    PropTypes.shape({
      /** Defines the id of the entitiesRelationsGroup. */
      _id: PropTypes.string,
      /** Defines the name of the entitiesRelationsGroup. */
      name: PropTypes.string,
      /** Defines an array containing entitiesRelations. */
      values: PropTypes.arrayOf(EntitiesRelationShape),
    })
  ),
  /** Defines the handler called when the tool is changed. */
  onToolChange: PropTypes.func,
  /** Defines the handler called when the selection is changed. */
  onSelectionChange: PropTypes.func,
  /** Defines the handler called when the relation is changed. */
  onRelationChange: PropTypes.func,
}

ZoneTools.defaultProps = {
  selectedMode: null,
  selectedSection: null,
  selectedRelation: null,
  tasks: [],
  onToolChange: null,
  onSelectionChange: null,
  onRelationChange: null,
  annotations: [],
}
