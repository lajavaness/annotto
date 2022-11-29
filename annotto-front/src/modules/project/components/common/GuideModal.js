import { Col, Row, Switch, Typography } from 'antd'
import { EditOutlined, ExportOutlined } from '@ant-design/icons'
import { isEmpty } from 'lodash'
import { navigate } from '@reach/router'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'
import React, { useCallback, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'

import WarningMessage from 'shared/components/warning/WarningMessage'

import useProjectPrivileges from 'shared/hooks/useProjectPrivileges'

import { selectProjectId } from 'modules/project/selectors/projectSelectors'

import { EDIT_PROJECT } from 'shared/enums/privilegesTypes'

import { groupTasksByCategories } from 'shared/utils/tasksUtils'

import 'github-markdown-css'

import * as Styled from './__styles__/GuideModal.styles'

const GuideModal = ({ guidelines, tasks, entitiesRelationsGroup }) => {
  const [isAnnotationGuide, setIsAnnotationGuide] = useState(false)

  const projectId = useSelector(selectProjectId)

  const { t } = useTranslation('project')

  const hasPrivilege = useProjectPrivileges()

  const _onModeChange = (checked) => setIsAnnotationGuide(checked)

  const _onEditClick = useCallback(
    () => navigate(`/edit_project/${projectId}/${isAnnotationGuide ? 'guide' : 'labeling'}`, { replace: true }),
    [isAnnotationGuide, projectId]
  )

  const resolvedTasksByCategories = useMemo(() => groupTasksByCategories(tasks), [tasks])

  const resolveSections = (key, name, children) => (
    <Styled.Group key={key}>
      <Typography.Title level={4}>{name}</Typography.Title>
      {!isEmpty(children) &&
        children.map(({ label, hotkey, description }, index) => (
          <Styled.Task key={`section_child_${label}_${index}`}>
            <Typography.Title level={5}>
              {label} {hotkey && `(${hotkey})`}
            </Typography.Title>
            <Styled.Description>{description}</Styled.Description>
          </Styled.Task>
        ))}
    </Styled.Group>
  )

  return (
    <Styled.Root>
      <Styled.Header>
        <Row gutter={{ xs: 8, sm: 10, md: 20 }}>
          <Col>
            <Styled.Title $isActive={isAnnotationGuide}>{t('project:guide.glossary')}</Styled.Title>
          </Col>
          <Col>
            <Switch checked={isAnnotationGuide} onChange={_onModeChange} />
          </Col>
          <Col>
            <Styled.Title $isActive={!isAnnotationGuide}>{t('project:guide.guidelines')}</Styled.Title>
          </Col>
          <Col>
            <Styled.Divider type="vertical" />
          </Col>
          <Col>
            {hasPrivilege(EDIT_PROJECT) && (
              <Styled.Button type="link" icon={<EditOutlined />} onClick={_onEditClick}>
                {t('project:guide.edit')}
              </Styled.Button>
            )}
          </Col>
          <Styled.LastCol>
            <Styled.Button type="link" icon={<ExportOutlined />} />
            <Styled.Divider type="vertical" />
          </Styled.LastCol>
        </Row>
      </Styled.Header>
      {isAnnotationGuide ? (
        <Styled.MarkdownContainer className="markdown-body">
          {!isEmpty(guidelines) ? (
            <ReactMarkdown source={guidelines} />
          ) : (
            <WarningMessage message={t('project:guide.emptyGuidelines')} />
          )}
        </Styled.MarkdownContainer>
      ) : (
        <Styled.GlossaryContainer>
          {resolvedTasksByCategories.map(({ category, children }, index) =>
            resolveSections(`task_${category}_${index}`, category, children)
          )}
          {!isEmpty(entitiesRelationsGroup) &&
            entitiesRelationsGroup.map(({ name, values }, index) =>
              resolveSections(`entitiesRelation_${name}_${index}`, name, values)
            )}
        </Styled.GlossaryContainer>
      )}
    </Styled.Root>
  )
}

export default GuideModal

const EntitiesRelationShape = PropTypes.shape({
  /** The label of the entitiesRelation. Defines the text to displayed to define the entitiesRelation. */
  label: PropTypes.string.isRequired,
  /** A keyboard shortcut that is bound when the list is displayed to toggle.
   * an annotation. */
  hotkey: PropTypes.hotkey,
  /** The text displayed below the label and used to describe it. */
  description: PropTypes.string,
})

const TaskShape = PropTypes.shape({
  /** The label of the task. Defines the text to displayed to define the task. */
  label: PropTypes.string.isRequired,
  /** A keyboard shortcut that is bound when the list is displayed to toggle an annotation. */
  hotkey: PropTypes.hotkey,
  /** The text displayed below the label and used to describe it. */
  description: PropTypes.string,
  /** Used to group the different task and to display the name this group. */
  category: PropTypes.string,
})

GuideModal.propTypes = {
  /** Defines the source of markdown. */
  guidelines: PropTypes.string,
  /** The list of task available in the project. Used to displayed the label,.
   * the hotkey and the description of each task. */
  tasks: PropTypes.arrayOf(TaskShape),
  /** The list of entitiesRelationsGroup available in the project. Used to displayed the label,.
   * the hotkey and the description of each entitiesRelations. */
  entitiesRelationsGroup: PropTypes.arrayOf(
    PropTypes.shape({
      /** Used to group the different relations and to display the name this group. */
      name: PropTypes.string,
      values: PropTypes.arrayOf(EntitiesRelationShape),
    })
  ),
}

GuideModal.defaultProps = {
  guidelines: null,
  tasks: null,
  entitiesRelationsGroup: null,
}
