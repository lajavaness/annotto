import { Button, Col, Dropdown, Form, Input, Menu, Row, Space, Switch, Typography } from 'antd'
import { isEmpty, isEqual, map } from 'lodash'
import { useDown } from '@xstyled/styled-components'
import { useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'
import { useCallback, useEffect, useMemo, useState } from 'react'
import moment from 'moment'

import {
  renderInputNumberFormItem,
  renderRadioGroupFormItem,
  renderRangePickerFormItem,
  renderSelectFormItem,
  renderSelectGroupFormItem,
  renderTextAreaFormItem,
} from 'modules/project/components/common/formFactory'

import JsonEditor from 'shared/components/common/JsonEditor'

import { ALL } from 'shared/enums/valueTypes'
import fieldTypes, { ANNOTATED, ANNOTATE_AT, ANNOTATE_BY, ANNOTATE_VALUES, TAGS } from 'shared/enums/fieldTypes'
import operatorTypes, { SIMILAR_TO } from 'shared/enums/operatorTypes'

import { isJsonString } from 'shared/utils/jsonUtils'
import { mapFilterFormToFilterJson, mapFilterJsonToFilterForm } from 'shared/utils/filterUtils'

import * as Styled from './__styles__/FilterForm.styles'

const resolveJsonValue = (value) =>
  value.map((filter) =>
    filter.field === ANNOTATE_AT
      ? {
          ...filter,
          value: {
            from: moment(filter.value[0]).format('YYYY-MM-DD'),
            to: moment(filter.value[1]).format('YYYY-MM-DD'),
          },
        }
      : filter
  )

const resolveStringifyJsonValue = (value) => JSON.stringify(resolveJsonValue(value), null, '\t')

const FilterForm = ({
  tags,
  tasks,
  formData,
  isSimilarityAllowed,
  filterFields,
  filterOperators,
  users,
  onSubmitFilterClick,
  onCancelClick,
}) => {
  const [isJsonMode, setIsJsonMode] = useState(false)
  const [isValidJson, setIsValidJson] = useState(true)
  const [isValidDateJson, setIsValidDateJson] = useState(true)
  const [jsonValue, setJsonValue] = useState('[]')

  const isMobile = useDown('sm')

  const [form] = Form.useForm()

  const { t } = useTranslation('project')

  const userOptions = useMemo(() => users?.map((email) => ({ value: email, label: email })), [users])

  const tagOptions = useMemo(() => tags?.map((value) => ({ value, label: value })), [tags])

  const tasksOptions = useMemo(() => {
    return tasks.reduce((result, { category, label, value }) => {
      const index = result.findIndex(({ label: resultLabel }) => category === resultLabel)

      if (index >= 0) {
        result[index] = { label: category, values: [...result[index].values, { label, value }] }
      } else {
        result.push({ label: category, values: [{ label, value }] })
      }

      return result
    }, [])
  }, [tasks])

  useEffect(() => {
    if (formData && !Object.values(formData).every((el) => !el)) {
      form.setFieldsValue(formData)
      setJsonValue(resolveStringifyJsonValue(mapFilterFormToFilterJson(formData)))
    }
  }, [form, formData])

  const _onDeleteFieldClick = (remove, name) => () => remove(name)

  const _onJsonEditorChange = useCallback(
    (editor, data, value) => {
      setJsonValue(value)
      if (isJsonString(value)) {
        let values = JSON.parse(value)

        let error = false

        if (values.some((filter) => filter.field === ANNOTATE_AT)) {
          error = values.some(
            (filter) =>
              filter.field === ANNOTATE_AT &&
              Object.values(filter.value).some((date) => !moment(date, 'YYYY-MM-DD').isValid())
          )
          setIsValidDateJson(!error)
        }

        if (!error) {
          values = values.map((filter) =>
            filter.field === ANNOTATE_AT
              ? { ...filter, value: Object.values(filter.value).map((date) => moment(date).format('YYYY-MM-DD')) }
              : filter
          )
          form.setFieldsValue(mapFilterJsonToFilterForm(values))
          setIsValidJson(true)
        } else {
          setIsValidJson(false)
        }
      } else {
        setIsValidJson(false)
      }
    },
    [form]
  )

  const _onValuesChange = (value, values) => {
    setJsonValue(resolveStringifyJsonValue(mapFilterFormToFilterJson(values)))
  }

  const _onReset = useCallback(() => {
    setJsonValue('[]')
    form.resetFields()
  }, [form])

  const _onJsonModeChange = (checked) => setIsJsonMode(checked)

  const _onAddFilterClick = useCallback(
    (add) =>
      ({ key }) =>
        !isEmpty(filterFields) && add({ field: key, operator: filterFields[key].operators[0] }),
    [filterFields]
  )

  const renderOperator = useCallback(
    (formField) => {
      const { field } = form.getFieldValue('filters')[formField.name]
      const { operators } = !isEmpty(filterFields) ? filterFields[field] : null
      const options = map(operators, (operator) => ({ value: operator, label: t(`project:filter.form.${operator}`) }))

      const _onOperatorChange = () => {
        const newFilters = form.getFieldValue('filters')
        delete newFilters[formField.name].value

        form.setFieldsValue({ filters: newFilters })
      }

      return (
        operators.length > 1 && (
          <Col span={6}>
            {renderSelectFormItem(t(`project:filter.fields.${field}`), 'operator', formField, null, {
              onChange: _onOperatorChange,
              placeholder: t('project:filter.form.selectPlaceholder'),
              options,
            })}
          </Col>
        )
      )
    },
    [form, t, filterFields]
  )

  const renderValues = useCallback(
    (formField, remove) => (
      <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.filters !== currentValues.filters}>
        {({ getFieldValue }) => {
          const { operator, field } = getFieldValue('filters')[formField.name]
          const { param, optionalParam } = filterOperators.find(({ name }) => name === operator)

          return (
            <Styled.FormListCol>
              {map({ ...param, ...optionalParam }, (value, key) => {
                switch (true) {
                  case isEqual(value, 'Boolean'):
                    return renderRadioGroupFormItem(
                      t('project:filter.fields.annotated'),
                      key,
                      formField,
                      [
                        { value: false, label: t('project:filter.form.notAnnotated') },
                        { value: ALL, label: t('project:filter.form.all') },
                        { value: true, label: t('project:filter.form.annotated') },
                      ],
                      null,
                      { rules: [{ required: param[key] !== undefined, message: `Please input ${key}` }] }
                    )

                  case isEqual(value, 'Number'):
                    return (
                      <Styled.InputNumberContainer key={key}>
                        {renderInputNumberFormItem(' ', key, formField, null, {
                          rules: [{ required: param[key] !== undefined, message: `Please input ${key}` }],
                        })}
                      </Styled.InputNumberContainer>
                    )

                  case isEqual(value, { from: 'Date', to: 'Date' }):
                    return renderRangePickerFormItem(t('project:filter.fields.annotatedAt'), key, formField, null, {
                      rules: [{ required: param[key] !== undefined, message: `Please input ${key}` }],
                    })

                  case isEqual(value, ['String']) && field !== ANNOTATE_VALUES:
                    return (
                      <Styled.FormListSelectItem key={key}>
                        {renderSelectFormItem(
                          ' ',
                          key,
                          formField,
                          null,
                          {
                            mode: 'tags',
                            placeholder: key,
                            ...(field === ANNOTATE_BY && {
                              options: userOptions,
                              showSearch: true,
                              allowClear: true,
                            }),
                            ...(field === TAGS && { options: tagOptions }),
                          },
                          { rules: [{ required: param[key] !== undefined, message: `Please input ${key}` }] }
                        )}
                      </Styled.FormListSelectItem>
                    )

                  case isEqual(value, ['String']) && field === ANNOTATE_VALUES:
                    return (
                      <Styled.FormListSelectItem key={key}>
                        {renderSelectGroupFormItem(
                          ' ',
                          key,
                          formField,
                          null,
                          tasksOptions,
                          {
                            mode: 'tags',
                            placeholder: key,
                          },
                          { rules: [{ required: param[key] !== undefined, message: `Please input ${key}` }] }
                        )}
                      </Styled.FormListSelectItem>
                    )

                  case isEqual(value, 'String'):
                    return (
                      <Styled.TextAreaContainer key={key}>
                        {renderTextAreaFormItem(t(`project:filter.fields.${field}`), key, formField, null, null, {
                          rules: [{ required: param[key] !== undefined, message: `Please input ${key}` }],
                        })}
                      </Styled.TextAreaContainer>
                    )

                  default:
                    return null
                }
              })}
              <Styled.DeleteButton type={'link'} onClick={_onDeleteFieldClick(remove, formField.name)}>
                {t(`project:filter.delete`)}
              </Styled.DeleteButton>
            </Styled.FormListCol>
          )
        }}
      </Form.Item>
    ),
    [t, filterOperators, userOptions, tagOptions, tasksOptions]
  )

  const _onFinish = useCallback(() => {
    if (isValidJson && isValidDateJson && isJsonString(jsonValue) && !!onSubmitFilterClick) {
      onSubmitFilterClick(JSON.parse(jsonValue))
    }
  }, [isValidJson, onSubmitFilterClick, isValidDateJson, jsonValue])

  return (
    <Styled.Root>
      <Styled.Header>
        <Row gutter={{ xs: 8, sm: 16, md: 32 }}>
          <Col>
            <Styled.Title ellipsis>{t(`project:filter.editButton`)}</Styled.Title>
          </Col>
          <Col>
            <Styled.ResetButton type="link" onClick={_onReset}>
              {t(`project:filter.reset`)}
            </Styled.ResetButton>
          </Col>
          <Col>
            <Styled.Divider type="vertical" />
          </Col>
          <Col>
            <Typography.Text ellipsis>{t(`project:filter.jsonMode`)}</Typography.Text>
          </Col>
          <Col>
            <Switch checked={isJsonMode} onChange={_onJsonModeChange} disabled={!(isValidJson && isValidDateJson)} />
          </Col>
        </Row>
      </Styled.Header>
      <Form
        layout="vertical"
        requiredMark={false}
        form={form}
        initialValues={{ annotated: ALL }}
        onFinish={_onFinish}
        onValuesChange={_onValuesChange}
      >
        {isJsonMode ? (
          <Styled.FormContainer
            validateStatus={!(isValidJson && isValidDateJson) && 'error'}
            help={
              (!isValidJson && t(`project:filter.requestJsonSchema`)) ||
              (!isValidDateJson && t(`project:filter.requestDateFormat`))
            }
          >
            <Row>
              <Col xs={24} sm={24} md={12}>
                {isMobile ? (
                  <Input.TextArea disabled autoSize value={jsonValue} />
                ) : (
                  <JsonEditor value={jsonValue} onChange={_onJsonEditorChange} />
                )}
              </Col>
              <Col xs={24} sm={24} md={12} />
            </Row>
          </Styled.FormContainer>
        ) : (
          <>
            <Styled.FormContainer>
              {renderRadioGroupFormItem(
                t('project:filter.fields.annotated'),
                null,
                null,
                [
                  { value: false, label: t('project:filter.form.notAnnotated') },
                  { value: ALL, label: t('project:filter.form.all') },
                  { value: true, label: t('project:filter.form.annotated') },
                ],
                ANNOTATED
              )}
              <Row gutter="24">
                <Col sm={24} md={8}>
                  {renderSelectFormItem(t('project:filter.fields.annotatedBy'), null, null, ANNOTATE_BY, {
                    options: userOptions,
                    mode: 'tags',
                    showSearch: true,
                    allowClear: true,
                  })}
                </Col>
                <Col sm={24} md={16}>
                  {renderRangePickerFormItem(t('project:filter.fields.annotatedAt'), null, null, ANNOTATE_AT)}
                </Col>
              </Row>
              {isSimilarityAllowed && (
                <Styled.FormItem>
                  {renderTextAreaFormItem(t('project:filter.fields.uuid'), null, null, SIMILAR_TO, {
                    autoSize: { minRows: 3, maxRows: 5 },
                  })}
                </Styled.FormItem>
              )}
              <Styled.FormItem>
                {renderSelectFormItem(t('project:filter.fields.tags'), null, null, TAGS, {
                  mode: 'tags',
                  options: tagOptions,
                })}
              </Styled.FormItem>
            </Styled.FormContainer>
            <Styled.FormContainer>
              <Form.List name="filters">
                {(fields, { add, remove }) => (
                  <div>
                    {fields
                      .filter(
                        (field) =>
                          Object.values(form.getFieldValue('filters'))[field.name]?.field &&
                          fieldTypes.includes(Object.values(form.getFieldValue('filters'))[field.name]?.field)
                      )
                      .map((field) => (
                        <Styled.FormListRow gutter="24" key={field.fieldKey}>
                          {renderOperator(field)}
                          {renderValues(field, remove)}
                        </Styled.FormListRow>
                      ))}
                    {!isEmpty(filterFields) && (
                      <Form.Item>
                        <Dropdown
                          overlay={
                            <Menu onClick={_onAddFilterClick(add)}>
                              {map(filterFields, (value, key) => (
                                <Menu.Item key={key}>{t(`project:filter.fields.${key}`)}</Menu.Item>
                              ))}
                            </Menu>
                          }
                        >
                          <Button>{t('project:filter.addButton')}</Button>
                        </Dropdown>
                      </Form.Item>
                    )}
                  </div>
                )}
              </Form.List>
            </Styled.FormContainer>
          </>
        )}
        <Styled.FormFooter>
          <Space size="middle">
            <Button type="link" onClick={onCancelClick}>
              {t(`project:filter.cancel`)}
            </Button>
            <Button type="primary" htmlType="submit" disabled={!(isValidJson && isValidDateJson)}>
              {t(`project:filter.submit`)}
            </Button>
          </Space>
        </Styled.FormFooter>
      </Form>
    </Styled.Root>
  )
}

export default FilterForm

const taskShape = PropTypes.shape({
  /** Defines the id of the task. */
  _id: PropTypes.string,
  /** Defines the value of the task. */
  value: PropTypes.value,
  /** Defines the label of the task. */
  label: PropTypes.string,
  /** Defines the hotkey of the task. */
  hotkey: PropTypes.string,
  /** Defines the color of the task. */
  color: PropTypes.string,
  /** Defines the name of the category of the  task. */
  category: PropTypes.string,
})

FilterForm.propTypes = {
  /** Defines the option tag of the tag select. */
  tags: PropTypes.array,
  /** Defines the options tasks to filter by annotationValues. */
  tasks: PropTypes.arrayOf(taskShape),
  /** Defines the value of the form. */
  formData: PropTypes.shape({
    annotated: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    annotatedAt: PropTypes.array,
    annotatedBy: PropTypes.array,
    tags: PropTypes.array,
    similarTo: PropTypes.string,
    filters: PropTypes.arrayOf(
      PropTypes.shape({
        operator: PropTypes.oneOf(operatorTypes),
        field: PropTypes.oneOf(fieldTypes),
        value: PropTypes.oneOfType([PropTypes.number, PropTypes.array, PropTypes.string, PropTypes.bool]),
      })
    ),
  }),
  /** Defines if the similarity is allowed. */
  isSimilarityAllowed: PropTypes.bool,
  /** Defines the value of the filter operators. */
  filterOperators: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.oneOf(operatorTypes),
      param: PropTypes.object,
      optionalParam: PropTypes.object,
    })
  ),
  /** Defines the value of the filter fields. */
  filterFields: PropTypes.object,
  /** Used to fill the annotatedBy select. */
  users: PropTypes.arrayOf(PropTypes.string),
  /** Trigger when submitting the form. */
  onSubmitFilterClick: PropTypes.func,
  /** Trigger when closing the modal. */
  onCancelClick: PropTypes.func,
}

FilterForm.defaultProps = {
  tags: null,
  tasks: null,
  formData: null,
  isSimilarityAllowed: false,
  filterOperators: null,
  filterFields: null,
  users: null,
  onSubmitFilterClick: null,
  onCancelClick: null,
}
