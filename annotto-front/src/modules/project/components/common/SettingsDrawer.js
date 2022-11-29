import { Form, Switch } from 'antd'
import { useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'
import React from 'react'

import * as Styled from './__styles__/SettingsDrawer.styles'

const SettingsDrawer = ({
  visible,
  highlights,
  isHighlightAllowed,
  showPredictions,
  prefillPredictions,
  onClose,
  onValuesChange,
}) => {
  const { t } = useTranslation('project')

  return (
    <Styled.Drawer
      placement="left"
      width={320}
      closable={false}
      onClose={onClose}
      visible={visible}
      getContainer={false}
    >
      <Styled.Row>
        <Styled.Header>{t('project:projectSettings.title')}</Styled.Header>
        <Styled.LeftCircleFilled onClick={onClose} />
      </Styled.Row>
      <Form
        layout="vertical"
        initialValues={{ highlights, showPredictions, prefillPredictions }}
        onValuesChange={onValuesChange}
      >
        <Form.Item name="showPredictions" label={t('project:projectSettings.showPredictions')} valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item
          name="prefillPredictions"
          label={t('project:projectSettings.prefillPredictions')}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        {isHighlightAllowed && (
          <Form.Item name="highlights" label={t('project:projectSettings.highlights')}>
            <Styled.Select allowClear mode="tags" dropdownStyle={{ display: 'none' }} value={highlights} />
          </Form.Item>
        )}
      </Form>
    </Styled.Drawer>
  )
}

export default SettingsDrawer

SettingsDrawer.propTypes = {
  /** Defines if the drawer is visible. */
  visible: PropTypes.bool,
  /** Defines the highlighted of the project. */
  highlights: PropTypes.arrayOf(PropTypes.string),
  /** Defines if the highlight is allowed. */
  isHighlightAllowed: PropTypes.bool,
  /** Defines the value of showPredictions in project. */
  showPredictions: PropTypes.bool,
  /** Defines the value of prefillPredictions in project. */
  prefillPredictions: PropTypes.bool,
  /** Defines the handler called when the close button is clicked. */
  onClose: PropTypes.func,
  /** Defines the handler called when the form is changed. */
  onValuesChange: PropTypes.func,
}

SettingsDrawer.defaultProps = {
  visible: false,
  highlights: null,
  isHighlightAllowed: false,
  showPredictions: false,
  prefillPredictions: false,
  onClose: null,
  onValuesChange: null,
}
