import { Col, Row, Select } from 'antd'
import { ITEM } from 'shared/enums/itemTypes'
import { RightCircleFilled } from '@ant-design/icons'
import { isEmpty } from 'lodash'
import { useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'

import * as Styled from 'modules/project/components/common/__styles__/ActionBar.styles'

const ActionBar = ({
  selectDisplayOptions,
  selectedDisplay,
  tags,
  totalFilter,
  availableTags,
  onDisplayChange,
  onSelectTagChange,
  onEditFilterClick,
  onClickToolButton,
}) => {
  const { t } = useTranslation('project')

  const options = !isEmpty(availableTags) ? availableTags.map((value) => ({ value })) : []

  return (
    <Row align="middle" gutter={['12', '8']} justify="end">
      <Col>
        <Styled.ToolButton icon={<RightCircleFilled />} type="link" onClick={onClickToolButton}>
          {t('project:projectSettings.title')}
        </Styled.ToolButton>
      </Col>
      {selectDisplayOptions && selectedDisplay && (
        <Col>
          <Row align="middle" gutter={4}>
            <Col>
              <Styled.FunnelPlotOutlinedIcon />
              {totalFilter > 0 && <Styled.Badge count={`x${totalFilter}`} />}
              <Styled.EditButton type="link" onClick={onEditFilterClick}>
                {t(`project:filter.editButton`)}
              </Styled.EditButton>
            </Col>
            <Col>
              <Styled.EyeOutlined />
            </Col>
            <Col flex={1}>
              <Styled.DisplaySelect defaultValue={selectedDisplay} onChange={onDisplayChange}>
                {selectDisplayOptions.map((selectOption, i) => (
                  <Select.Option key={i} value={selectOption}>
                    {t(`project:annotation.select.${selectOption}`)}
                  </Select.Option>
                ))}
              </Styled.DisplaySelect>
            </Col>
          </Row>
        </Col>
      )}
      <Col flex={1}>
        <Row align="middle" gutter={4}>
          <Col>
            <Styled.HighlightOutlined />
          </Col>
          <Col flex={1}>
            <Styled.TagsSelect
              allowClear
              mode="tags"
              value={tags}
              onChange={onSelectTagChange}
              options={options}
              tagRender={({ label, closable, onClose }) => (
                <Styled.Tag closable={closable} onClose={onClose}>
                  {label}
                </Styled.Tag>
              )}
            />
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

export default ActionBar

ActionBar.propTypes = {
  /** Defines the tags of an item, used in value in the select which display tags. */
  tags: PropTypes.arrayOf(PropTypes.string),
  /** Defines the number of filter to display in the badge. */
  totalFilter: PropTypes.number,
  /** Defines the available tags in project to display in options of select to add tag. */
  availableTags: PropTypes.arrayOf(PropTypes.string),
  /** Defines the selected display to use it in the select which manages the display of an item.  */
  selectedDisplay: PropTypes.string,
  /** Defines the options to use it in the select which manages the display of an item.  */
  selectDisplayOptions: PropTypes.arrayOf(PropTypes.string),
  /** Defines the handler called when the select of display item option is changed. */
  onDisplayChange: PropTypes.func,
  /** Defines the handler called when the select for tag  is changed. */
  onSelectTagChange: PropTypes.func,
  /** Defines the handler called when the edit filter button is clicked. */
  onEditFilterClick: PropTypes.func,
  /** Defines the handler called when the tool button is clicked. */
  onClickToolButton: PropTypes.func,
}

ActionBar.defaultProps = {
  tags: [],
  availableTags: [],
  selectedDisplay: ITEM,
  selectDisplayOptions: [],
  totalFilter: 0,
  onDisplayChange: null,
  onSelectTagChange: null,
  onEditFilterClick: null,
  onClickToolButton: null,
}
