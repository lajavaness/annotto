import 'github-markdown-css'
import { Col, Input, Row, Switch } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import React, { useCallback, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

// TODO  this is an example of temporary markdown, we need an example specific to Annotto
import TutorialMarkDown from 'assets/tutorialMarkDown.md'

import { selectConfigProject } from 'modules/configurationProject/selectors/configurationProjectSelectors'

import { updateConfigProject } from 'modules/configurationProject/actions/configurationProjectActions'

import { GUIDELINES } from 'shared/enums/configurationsProjectPropertiesTypes'

import * as Styled from 'modules/projects/components/__styles__/GuideStepPage.styles'

const GuideStepPage = () => {
  const [tutorialValue, setTutorialValue] = useState(null)
  const [isModeTutorial, setIsModeTutorial] = useState(false)

  const projectConfig = useSelector(selectConfigProject)

  const [guidelinesValue, setGuidelinesValue] = useState(projectConfig?.guidelines || '')

  const dispatch = useDispatch()

  const { t } = useTranslation('configurationProject')

  useEffect(() => {
    fetch(TutorialMarkDown)
      .then((response) => response.text())
      .then((text) => {
        setTutorialValue(text)
      })
  }, [])

  const _onModeChange = (checked) => {
    setIsModeTutorial(checked)
  }

  const _onTextAreaChange = useCallback(
    (e) => {
      setGuidelinesValue(e.target.value)
      if (!isModeTutorial) {
        dispatch(updateConfigProject(GUIDELINES, { [GUIDELINES]: e.target.value }))
      }
    },
    [isModeTutorial, dispatch]
  )

  return (
    <Styled.Root>
      <Styled.SwitchContainer>
        {t('configurationProject:guide.edit')}
        <Switch checked={isModeTutorial} onChange={_onModeChange} />
        {t('configurationProject:guide.tutorial')}
      </Styled.SwitchContainer>
      <Row gutter={['8', '8']}>
        <Col sm={24} md={12}>
          <Input.TextArea
            value={isModeTutorial ? tutorialValue : guidelinesValue}
            autoSize={{ minRows: 12 }}
            onChange={_onTextAreaChange}
            readOnly={isModeTutorial}
          />
        </Col>
        <Col sm={24} md={12}>
          <Styled.MarkdownContainer className="markdown-body">
            <ReactMarkdown source={isModeTutorial ? tutorialValue : projectConfig?.guidelines} />
          </Styled.MarkdownContainer>
        </Col>
      </Row>
    </Styled.Root>
  )
}

export default GuideStepPage
