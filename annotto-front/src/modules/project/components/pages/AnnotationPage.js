/* eslint-disable react/prop-types */
import { Button, message, Modal } from 'antd'
import { CaretLeftOutlined, CaretRightOutlined } from '@ant-design/icons'
import { GlobalHotKeys } from 'react-hotkeys'
import { isArray, isEmpty, isNumber } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import ActionBar from 'modules/project/components/common/ActionBar'
import CheckLabelList from 'modules/project/components/common/CheckLabelList'
import Col from 'shared/components/grid/Col'
import HeaderItemContainer from 'modules/project/components/common/HeaderItemContainer'
import JSONPreview from 'modules/project/components/common/JSONPreview'
import Loader from 'shared/components/loader/Loader'
import LogsContainer from 'modules/project/components/common/LogsContainer'
import Page from 'shared/components/page/Page'
import Row from 'shared/components/grid/Row'
import TextAnnotationsContainer from 'modules/project/components/common/TextAnnotationsContainer'
import WarningMessage from 'shared/components/warning/WarningMessage'
import ZoneTools from 'modules/project/components/common/ZoneTools'
import AnnotationItemWrapper from 'modules/project/components/common/AnnotationItemWrapper'

import { CLASSIFICATIONS, NER, TEXT as ANNOTATION_TEXT, ZONE } from 'shared/enums/annotationTypes'
import { IMAGE, TEXT } from 'shared/enums/projectTypes'
import { ITEM, PREDICTIONS, RAW } from 'shared/enums/itemTypes'
import { TASKS } from 'shared/enums/projectStatsTypes'
import { TWO_POINTS, WORD } from 'shared/enums/markerTypes'

import {
  selectAnnotationItems,
  selectCurrentItem,
  selectCurrentItemAnnotations,
  selectCurrentItemEntitiesRelations,
  selectCurrentItemId,
  selectCurrentItemLogs,
  selectCurrentItemPredictions,
  selectIsAnnotationPosted,
  selectIsReady,
} from 'modules/project/selectors/annotationSelectors'
import { selectIsHighlightAllowed } from 'modules/root/selectors/rootSelectors'
import {
  selectProjectEntitiesRelationsGroup,
  selectProjectFilter,
  selectProjectHighlights,
  selectProjectId,
  selectProjectItemsTags,
  selectProjectPrefillPredictions,
  selectProjectShowPredictions,
  selectProjectTasks,
  selectProjectType,
} from 'modules/project/selectors/projectSelectors'

import {
  mountAnnotationPage,
  navigateToNextItem,
  navigateToPrevItem,
  putItemTags,
  saveAnnotationsItem,
} from 'modules/project/actions/annotationActions'
import { openFilterModal, openGuideModal, putProject } from 'modules/project/actions/projectActions'

import {
  doesOverlapWithCurrentAnnotations,
  isAnnotationNer,
  isPredictionEquivalentToAnnotation,
} from 'shared/utils/annotationUtils'

import SettingsDrawer from 'modules/project/components/common/SettingsDrawer'

import * as Styled from 'modules/project/components/pages/__styles__/AnnotationPage.styles'

const NEXT_KEY = 'ArrowRight'
const PREV_KEY = 'ArrowLeft'
const SAVE_AND_NEXT_KEY = 'Enter'

const keyMap = {
  NEXT: NEXT_KEY,
  PREV: PREV_KEY,
  SAVE_AND_NEXT: SAVE_AND_NEXT_KEY,
}

const AnnotationPage = ({ setHeaderActions }) => {
  const [annotations, setAnnotations] = useState([])
  const [entitiesRelations, setEntitiesRelations] = useState([])
  const [isToolOpen, setIsToolOpen] = useState(false)
  const [arePredictionsReady, setArePredictionsReady] = useState(false)
  const [areAnnotationsReady, setAreAnnotationsReady] = useState(false)
  const [selectedMode, setSelectedMode] = useState()
  const [selectedSection, setSelectedSection] = useState()
  const [selectedRelation, setSelectedRelation] = useState()
  const [selectedDisplay, setSelectedDisplay] = useState(ITEM)

  const isReady = useSelector(selectIsReady)
  const isAnnotationPosted = useSelector(selectIsAnnotationPosted)
  const currentItem = useSelector(selectCurrentItem)
  const currentItemId = useSelector(selectCurrentItemId)
  const currentItemAnnotations = useSelector(selectCurrentItemAnnotations)
  const currentItemEntitiesRelations = useSelector(selectCurrentItemEntitiesRelations)
  const currentItemLogs = useSelector(selectCurrentItemLogs)
  const currentItemPredictions = useSelector(selectCurrentItemPredictions)
  const items = useSelector(selectAnnotationItems)
  const projectId = useSelector(selectProjectId)
  const projectType = useSelector(selectProjectType)
  const projectShowPrediction = useSelector(selectProjectShowPredictions)
  const projectPrefillPredictions = useSelector(selectProjectPrefillPredictions)
  const projectHighlights = useSelector(selectProjectHighlights)
  const projectTasks = useSelector(selectProjectTasks)
  const projectEntitiesRelationsGroup = useSelector(selectProjectEntitiesRelationsGroup)
  const availableTags = useSelector(selectProjectItemsTags)
  const filter = useSelector(selectProjectFilter)
  const isHighlightAllowed = useSelector(selectIsHighlightAllowed)

  const dispatch = useDispatch()

  const { t } = useTranslation('project')

  useEffect(() => {
    if (!isReady) {
      dispatch(mountAnnotationPage())
    }
  }, [isReady, dispatch])

  useEffect(() => {
    if (isReady) {
      setAnnotations(currentItemAnnotations === null ? [] : currentItemAnnotations)
      setEntitiesRelations(currentItemEntitiesRelations === null ? [] : currentItemEntitiesRelations)
      setAreAnnotationsReady(true)
      setArePredictionsReady(false)
    }
  }, [isReady, currentItemId, currentItemAnnotations, currentItemEntitiesRelations])

  useEffect(() => {
    setArePredictionsReady(false)
  }, [projectPrefillPredictions, projectShowPrediction])

  useEffect(() => {
    if (!arePredictionsReady && areAnnotationsReady && !isEmpty(currentItemPredictions) && isReady) {
      let newAnnotation = []
      if (projectPrefillPredictions) {
        newAnnotation = !isEmpty(annotations)
          ? currentItemPredictions.reduce(
              (result, prediction) =>
                !annotations.some((annotation) => isPredictionEquivalentToAnnotation(annotation, prediction)) &&
                (!isAnnotationNer(prediction) ||
                  isEmpty(doesOverlapWithCurrentAnnotations(annotations, prediction.ner.start, prediction.ner.end)))
                  ? [...result, prediction]
                  : result,
              annotations
            )
          : currentItemPredictions
      } else {
        newAnnotation = !isEmpty(currentItemPredictions)
          ? annotations.reduce(
              (result, annotation) =>
                (isArray(currentItemAnnotations) && currentItemAnnotations.includes(annotation)) ||
                !currentItemPredictions.some((prediction) => isPredictionEquivalentToAnnotation(annotation, prediction))
                  ? [...result, annotation]
                  : result,
              []
            )
          : annotations
      }
      setAnnotations(newAnnotation)

      setArePredictionsReady(true)
    }
  }, [
    arePredictionsReady,
    areAnnotationsReady,
    annotations,
    currentItemPredictions,
    projectType,
    projectPrefillPredictions,
    currentItemAnnotations,
    isReady,
  ])

  useEffect(() => {
    if (isAnnotationPosted) {
      message.success(t('project:annotation.postAnnotationSuccess'))
    }
  }, [t, isAnnotationPosted])

  useEffect(() => {
    if (!selectedMode) {
      setSelectedMode(projectType === TEXT ? WORD : TWO_POINTS)
    }
  }, [projectType, selectedMode])

  const selectDisplayOption = currentItem ? [ITEM, ...[RAW, PREDICTIONS].filter((option) => !!currentItem[option])] : []

  const _onNextButtonClick = useCallback(() => dispatch(navigateToNextItem()), [dispatch])

  const _onSaveAndNextClick = useCallback(() => {
    const errors = []
    const categoriesWithConstraints = projectTasks.reduce(
      (result, { min, max, value, type, category: newCategory }) => {
        if (isNumber(min) || isNumber(max)) {
          const category = result.find(({ value: v }) => newCategory === v)
          if (category) {
            result[result.indexOf(category)] = { ...category, values: [...category.values, value] }
          } else {
            result.push({ value: newCategory, type, values: [value], min, max })
          }
        }
        return result
      },
      []
    )

    if (!isEmpty(categoriesWithConstraints)) {
      categoriesWithConstraints.forEach(({ value, type, values, min, max }) => {
        if (!isEmpty(values)) {
          const numberOfAnnotations = annotations.reduce(
            (result, { value: v }) => (values.includes(v) ? result + 1 : result),
            0
          )

          if (isNumber(min) && !isNumber(max) && numberOfAnnotations < min) {
            errors.push(
              t(`project:annotation.nav.saveError${type === TASKS ? 'Annotation' : 'Labeling'}Inferior`, {
                task: value,
                min,
                current: numberOfAnnotations,
              })
            )
          } else if (!isNumber(min) && isNumber(max) && numberOfAnnotations > max) {
            errors.push(
              t(`project:annotation.nav.saveError${type === TASKS ? 'Annotation' : 'Labeling'}Superior`, {
                task: value,
                max,
                current: numberOfAnnotations,
              })
            )
          } else if (isNumber(min) && isNumber(max) && (numberOfAnnotations > max || numberOfAnnotations < min)) {
            errors.push(
              t(`project:annotation.nav.saveError${type === TASKS ? 'Annotation' : 'Labeling'}Between`, {
                task: value,
                min,
                max,
                current: numberOfAnnotations,
              })
            )
          }
        }
      })
    }

    if (!isEmpty(errors)) {
      Modal.error({
        title: t('project:annotation.nav.errorTitle'),
        content: errors.map((error, index) => <p key={`error_${index}`}>{error}</p>),
      })
    } else {
      dispatch(saveAnnotationsItem(annotations, entitiesRelations, projectId, currentItemId))
    }
  }, [dispatch, entitiesRelations, annotations, projectId, currentItemId, t, projectTasks])

  const _onPrevButtonClick = useCallback(() => dispatch(navigateToPrevItem()), [dispatch])

  const _onGuideClick = useCallback(() => dispatch(openGuideModal()), [dispatch])

  const handlers = useMemo(
    () => ({
      NEXT: _onNextButtonClick,
      PREV: _onPrevButtonClick,
      SAVE_AND_NEXT: _onSaveAndNextClick,
    }),
    [_onNextButtonClick, _onPrevButtonClick, _onSaveAndNextClick]
  )

  const resolvedHeaderButton = useMemo(
    () => (
      <>
        <Button onClick={_onPrevButtonClick} disabled={items?.[0]?._id === currentItem?._id || false} type="link">
          <CaretLeftOutlined />
          {t('project:annotation.nav.prev')}
        </Button>
        <Button type="primary" onClick={_onSaveAndNextClick} loading={isAnnotationPosted} disabled={false}>
          {t('project:annotation.nav.save')}
        </Button>
        <Button onClick={_onNextButtonClick} type="link">
          {t('project:annotation.nav.next')}
          <CaretRightOutlined />
        </Button>
        <Styled.HeaderDivider type={'vertical'} />
        <Styled.QuestionCircleOutlined onClick={_onGuideClick} />
      </>
    ),
    [
      items,
      currentItem,
      isAnnotationPosted,
      _onPrevButtonClick,
      _onSaveAndNextClick,
      _onNextButtonClick,
      _onGuideClick,
      t,
    ]
  )

  useEffect(() => setHeaderActions && setHeaderActions(resolvedHeaderButton), [resolvedHeaderButton, setHeaderActions])

  const _onToolChange = (value) => setSelectedMode(value)

  const _onSelectionChange = useCallback((section) => {
    setSelectedRelation(null)
    return setSelectedSection(section)
  }, [])

  const _onRelationChange = useCallback((relation) => {
    setSelectedSection(null)
    return setSelectedRelation(relation)
  }, [])

  const _onAnnotationChange = (values) => setAnnotations(values)

  const _onEntitiesRelationChange = (values) => setEntitiesRelations(values)

  const _onSelectTagChange = (values) => dispatch(putItemTags(currentItem._id, projectId, values))

  const _onDisplayChange = (value) => setSelectedDisplay(value)

  const _onClickToolButton = () => setIsToolOpen(true)

  const _onToolClose = () => setIsToolOpen(false)

  const _onEditFilterClick = useCallback(() => dispatch(openFilterModal()), [dispatch])

  const _onSettingsChange = useCallback((_, values) => dispatch(putProject(values)), [dispatch])

  console.log(AnnotationItemWrapper.propTypes)

  return (
    <Page id="annotation">
      {isReady ? (
        <GlobalHotKeys handlers={handlers} keyMap={keyMap} allowChanges>
          <Styled.Root>
            {projectType ? (
              <Row gutter={['11', '11']}>
                <Col span={14}>
                  <Styled.Container>
                    <Styled.Space direction="vertical" $isTextContent={projectType === TEXT}>
                      <ActionBar
                        tags={currentItem?.tags}
                        availableTags={availableTags}
                        selectDisplayOptions={selectDisplayOption}
                        selectedDisplay={selectedDisplay}
                        totalFilter={filter?.total}
                        onDisplayChange={_onDisplayChange}
                        onSelectTagChange={_onSelectTagChange}
                        onEditFilterClick={_onEditFilterClick}
                        onClickToolButton={_onClickToolButton}
                      />
                      {currentItem && !isEmpty(items) ? (
                        <Styled.ItemContainer>
                          <HeaderItemContainer id={currentItem?._id} />
                          <Styled.Divider />
                          <Styled.ItemContent>
                            {/* eslint-disable-next-line no-nested-ternary */}
                            {selectedDisplay === ITEM ? (
                              <AnnotationItemWrapper
                                tasks={projectTasks}
                                projectType={projectType}
                                currentItem={currentItem}
                                options={{
                                  mode: selectedMode,
                                  selectedSection,
                                  annotations,
                                  selectedRelation,
                                  entitiesRelations,
                                  predictions: currentItemPredictions,
                                  showPredictions: projectShowPrediction,
                                  entitiesRelationsGroup: projectEntitiesRelationsGroup,
                                  onAnnotationChange: _onAnnotationChange,
                                  onEntitiesRelationChange: _onEntitiesRelationChange,
                                }}
                              />
                            ) : (
                              <JSONPreview
                                json={
                                  selectedDisplay === PREDICTIONS
                                    ? currentItem[selectedDisplay]?.raw
                                    : currentItem[selectedDisplay]
                                }
                              />
                            )}
                          </Styled.ItemContent>
                        </Styled.ItemContainer>
                      ) : (
                        <WarningMessage
                          message={t(
                            // eslint-disable-next-line no-nested-ternary
                            `project:warning.${isEmpty(items) ? (filter?.total ? 'filter' : 'dataset') : 'item'}`
                          )}
                        />
                      )}
                      {projectType === TEXT && currentItem && (
                        <LogsContainer logs={currentItemLogs?.data || []} isProjectContext={false} />
                      )}
                    </Styled.Space>
                  </Styled.Container>
                </Col>
                <Col span={10}>
                  <Styled.RightContainer>
                    {projectTasks.some((task) => task.type === NER || task.type === ZONE) && selectedMode && (
                      <Styled.Content>
                        <ZoneTools
                          selectedSection={selectedSection}
                          selectedRelation={selectedRelation}
                          selectedMode={selectedMode}
                          isProjectTypeText={projectType === TEXT}
                          entitiesRelationsGroup={projectEntitiesRelationsGroup}
                          tasks={projectTasks.filter(({ type }) => type === (projectType === TEXT ? NER : ZONE))}
                          onToolChange={_onToolChange}
                          onSelectionChange={_onSelectionChange}
                          onRelationChange={_onRelationChange}
                          annotations={annotations}
                        />
                      </Styled.Content>
                    )}
                    {projectTasks.some((task) => task.type === CLASSIFICATIONS) && (
                      <Styled.Content>
                        <CheckLabelList
                          annotations={annotations}
                          tasks={projectTasks.filter((task) => task.type === CLASSIFICATIONS)}
                          predictions={currentItemPredictions}
                          showPredictions={projectShowPrediction}
                          onChange={_onAnnotationChange}
                        />
                      </Styled.Content>
                    )}
                    {projectTasks.some((task) => task.type === TEXT) && (
                      <Styled.Content>
                        <TextAnnotationsContainer
                          annotations={annotations}
                          tasks={projectTasks.filter(({ type }) => type === ANNOTATION_TEXT)}
                          predictions={currentItemPredictions}
                          showPredictions={projectShowPrediction}
                          onChange={_onAnnotationChange}
                        />
                      </Styled.Content>
                    )}
                    {projectType === IMAGE && currentItem && projectId && (
                      <Styled.Content>
                        <LogsContainer logs={currentItemLogs?.data || []} isProjectContext={false} />
                      </Styled.Content>
                    )}
                  </Styled.RightContainer>
                </Col>
              </Row>
            ) : (
              <Styled.TypeError>{t('project:annotation.errors.emptyType')}</Styled.TypeError>
            )}
            <SettingsDrawer
              onClose={_onToolClose}
              visible={isToolOpen}
              isHighlightAllowed={isHighlightAllowed}
              showPredictions={projectShowPrediction}
              prefillPredictions={projectPrefillPredictions}
              highlights={projectHighlights}
              onValuesChange={_onSettingsChange}
            />
          </Styled.Root>
        </GlobalHotKeys>
      ) : (
        <Loader />
      )}
    </Page>
  )
}

export default AnnotationPage
