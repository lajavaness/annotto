import { Button, Col, Collapse, Form, Modal, Row, Select, Space, Tooltip } from 'antd'
import { DownOutlined, ExclamationCircleOutlined, UpOutlined } from '@ant-design/icons'
import { SketchPicker } from 'react-color'
import { debounce, isEmpty, map, omit, size } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'

import {
  exportCurrentConfig,
  updateConfigProject,
} from 'modules/configurationProject/actions/configurationProjectActions'

import {
  selectConfigProject,
  selectInitialConfig,
} from 'modules/configurationProject/selectors/configurationProjectSelectors'

import {
  renderInputFormItem,
  renderInputNumberFormItem,
  renderSelectFormItem,
  renderSelectGroupFormItem,
} from 'modules/project/components/common/formFactory'

import { CONFIG, LABELING } from 'shared/enums/configurationsProjectPropertiesTypes'
import taskTypes, { ENTITIES_RELATIONS_GROUP, NER, TEXT } from 'shared/enums/taskTypes'

import theme from '__theme__'

import * as Styled from 'modules/configurationProject/components/__styles__/LabelingStepPage.styles'

const colors = theme.colors.defaultAnnotationColors

const LabelingStepPage = ({ isEdit }) => {
  const [isAddColor, setIsAddColor] = useState(false)
  const [addColor, setAddColor] = useState('#ffffff')
  const [collapseKeys, setCollapseKeys] = useState([0])

  const dispatch = useDispatch()

  const { t } = useTranslation('configurationProject')

  const projectConfig = useSelector(selectConfigProject)
  const initialConfig = useSelector(selectInitialConfig)

  const [form] = Form.useForm()

  const availableTaskTypes = useMemo(
    () =>
      !isEmpty(projectConfig?.[LABELING]) && projectConfig[LABELING].some(({ type }) => type === NER)
        ? taskTypes
        : taskTypes.filter((value) => value !== ENTITIES_RELATIONS_GROUP),
    [projectConfig]
  )

  const taskTypeOptions = useMemo(
    () => availableTaskTypes.map((value) => ({ value, label: t(`configurationProject:labeling.${value}`) })),
    [t, availableTaskTypes]
  )

  const isTaskEntitiesRelationsGroup = useCallback(
    (index) => projectConfig?.[LABELING]?.[index]?.type === ENTITIES_RELATIONS_GROUP,
    [projectConfig]
  )

  const isTaskText = useCallback((index) => projectConfig?.[LABELING]?.[index]?.type === TEXT, [projectConfig])

  const resolveConditionsOptions = useCallback(
    (index) => {
      if (!isEmpty(projectConfig?.[LABELING])) {
        const taskType = projectConfig[LABELING][index]?.type
        const parents = projectConfig[LABELING][index]?.parents
        let filteredLabeling = projectConfig[LABELING].slice(0, index).filter(({ type }) => taskType === type)

        if (!isEmpty(parents)) {
          filteredLabeling = filteredLabeling.filter(
            ({ values }) => !!values && values.some(({ value }) => parents.includes(value))
          )
        }
        return filteredLabeling.map(({ name, values }) => ({
          label: name,
          values: !isEmpty(values) ? values.map(({ label, value }) => ({ label, value })) : [],
        }))
      }
      return []
    },
    [projectConfig]
  )

  useEffect(() => {
    if (projectConfig?.[LABELING]?.some(({ type, name }) => type === TEXT && !name)) {
      const updatedProjectConfig = projectConfig[LABELING].map((task, index) =>
        task.type === TEXT && !task.name
          ? { ...task, name: t('configurationProject:labeling.form.defaultTaskTextName', { index: index + 1 }) }
          : task
      )

      form.setFieldsValue({ [LABELING]: updatedProjectConfig })
    }
  }, [t, form, projectConfig])

  const canUpdateTask = useCallback(
    (index) => !isEdit || (isEdit && initialConfig?.project?.[LABELING] && !initialConfig?.project?.[LABELING][index]),
    [isEdit, initialConfig]
  )

  const canUpdateTaskValue = useCallback(
    (taskIndex, valueIndex) =>
      !isEdit ||
      (isEdit &&
        initialConfig?.project?.[LABELING] &&
        !initialConfig?.project?.[LABELING]?.[taskIndex]?.values[valueIndex]),
    [isEdit, initialConfig]
  )

  const resolvedNameOfTaskChild = useCallback(
    (taskIndex, valueIndex) => {
      const labeling = projectConfig?.[LABELING]

      if (!isEmpty(labeling)) {
        const value = labeling?.[taskIndex]?.values?.[valueIndex]?.value
        return canUpdateTaskValue(taskIndex, valueIndex)
          ? labeling.find(({ conditions }) => !isEmpty(conditions) && conditions.includes(value))?.name
          : null
      }
      return null
    },
    [canUpdateTaskValue, projectConfig]
  )

  const _onTaskAddClick = useCallback(
    (add, key) => () => {
      form.validateFields().then(() => {
        setCollapseKeys([...collapseKeys, key])
        add()
      })
    },
    [form, collapseKeys]
  )

  const _onDeleteTaskClick = useCallback(
    (remove, name) => (event) => {
      event.stopPropagation()

      if (isEmpty(form.getFieldValue([LABELING, name]))) {
        remove(name)
      } else {
        Modal.confirm({
          title: t('configurationProject:labeling.waring.title', {
            name: form.getFieldValue([LABELING, name, 'name']),
          }),
          icon: <ExclamationCircleOutlined />,
          content: t('configurationProject:labeling.waring.delete'),
          onOk: () => remove(name),
        })
      }
    },
    [t, form]
  )

  const _onExportConfigClick = useCallback(() => dispatch(exportCurrentConfig([CONFIG])), [dispatch])

  const _onColorChange = ({ hex }) => setAddColor(hex)

  const _onClickAddColor = () => setIsAddColor(true)

  const _onConfirmAddColorClick = (field, valueField) => () => {
    const formValues = form.getFieldsValue()
    formValues[LABELING][field].values[valueField].color = addColor
    colors[size(colors)] = addColor

    setIsAddColor(false)
    setAddColor('#ffffff')
    form.setFieldsValue(formValues)
  }

  const _onCloseModal = () => setIsAddColor(false)

  const _onCollapseChange = (keys) => form.validateFields().finally(() => setCollapseKeys(keys))

  const _onAddLabelClick = (add) => () => {
    form.validateFields().then(() => add({ exposed: true, color: null }))
  }

  const _onDeleteLabelClick = (remove, name) => () => remove(name)

  const _uniqueValidation =
    (name) =>
    ({ getFieldValue }) => ({
      validator(rule, value) {
        const values = getFieldValue()?.[LABELING].reduce((fieldValues, task) => {
          if (!isEmpty(task?.values)) {
            task.values.forEach((taskValue) => {
              if (taskValue[name]) {
                fieldValues = [...fieldValues, taskValue[name]]
              }
            })
          }
          return fieldValues
        }, [])

        if (!value || values.filter((taskValue) => taskValue === value).length < 2) {
          return Promise.resolve()
        }
        return Promise.reject(t('configurationProject:labeling.waring.duplicate', { value }))
      },
    })

  const _onValuesChange = useCallback(
    debounce((changedValues, values) => {
      const labeling = !isEmpty(values[LABELING])
        ? values[LABELING].filter((value) => !!value).map((task) => ({
            ...task,
            values: !isEmpty(task.values)
              ? task.values.filter(({ value, label, color, hotkey, description }) =>
                  task.type !== ENTITIES_RELATIONS_GROUP
                    ? value || label || color || hotkey || description
                    : value || label
                )
              : [],
          }))
        : []
      return dispatch(updateConfigProject(LABELING, { ...omit(projectConfig, LABELING), labeling }))
    }, 100),
    [dispatch]
  )

  const resolvedComponentWithTooltip = (show, title, component) =>
    show ? (
      <Tooltip placement="top" title={title}>
        {component}
      </Tooltip>
    ) : (
      component
    )

  return (
    <Styled.Root>
      <Styled.Form
        layout="vertical"
        form={form}
        initialValues={{ [LABELING]: projectConfig?.[LABELING] || [{}] }}
        onValuesChange={_onValuesChange}
      >
        <Form.List name={LABELING}>
          {(fields, { add, remove }) => (
            <>
              <Styled.Collapse
                onChange={_onCollapseChange}
                expandIconPosition="right"
                bordered={false}
                activeKey={collapseKeys}
                expandIcon={({ isActive }) => (isActive ? <UpOutlined /> : <DownOutlined />)}
              >
                {fields.map((field) => (
                  <Collapse.Panel
                    header={
                      <Styled.Header>
                        <Form.Item shouldUpdate>{() => form.getFieldValue([LABELING, field.name, 'name'])}</Form.Item>
                      </Styled.Header>
                    }
                    key={field.name}
                    extra={
                      canUpdateTask(field.fieldKey) && (
                        <Styled.DeleteFilled onClick={_onDeleteTaskClick(remove, field.name)} />
                      )
                    }
                  >
                    <Row gutter={[8, 8]}>
                      <Col>
                        <Space size={24}>
                          {renderInputFormItem(
                            t('configurationProject:labeling.form.name'),
                            null,
                            field,
                            [field.name, 'name'],
                            { placeholder: t('configurationProject:labeling.form.name') },
                            {
                              rules: [
                                {
                                  required: true,
                                  message: t('configurationProject:labeling.form.required', {
                                    label: t('configurationProject:labeling.form.name'),
                                  }),
                                },
                                _uniqueValidation('name', LABELING),
                              ],
                            }
                          )}
                          {canUpdateTask(field.fieldKey) && (
                            <Styled.DeleteFilled onClick={_onDeleteTaskClick(remove, field.name)} />
                          )}
                        </Space>
                      </Col>
                    </Row>
                    <Row gutter={[8, 8]}>
                      <Col span="4">
                        {resolvedComponentWithTooltip(
                          !!resolvedNameOfTaskChild(field.name, field.fieldKey),
                          t('configurationProject:labeling.form.isTaskUsedInCondition', {
                            task: resolvedNameOfTaskChild(field.name, field.fieldKey),
                          }),
                          renderSelectFormItem(
                            t('configurationProject:labeling.form.type'),
                            [field.fieldKey, 'type'],
                            field,
                            [field.name, 'type'],
                            {
                              options: taskTypeOptions,
                              disabled:
                                !!resolvedNameOfTaskChild(field.name, field.fieldKey) || !canUpdateTask(field.name),
                            },
                            {
                              rules: [
                                {
                                  required: true,
                                  message: t('configurationProject:labeling.form.required', {
                                    label: t('configurationProject:labeling.form.type'),
                                  }),
                                },
                              ],
                            }
                          )
                        )}
                      </Col>
                      {field.name > 0 && !isTaskEntitiesRelationsGroup(field.name) && !isTaskText(field.name) && (
                        <>
                          <Col span="3">
                            {renderSelectGroupFormItem(
                              t('configurationProject:labeling.form.condition'),
                              [field.fieldKey, 'conditions'],
                              field,
                              [field.name, 'conditions'],
                              resolveConditionsOptions(field.name),
                              {
                                mode: 'multiple',
                                disabled: !canUpdateTask(field.name),
                              }
                            )}
                          </Col>

                          <Col>
                            {renderInputNumberFormItem(
                              t('configurationProject:labeling.form.min'),
                              null,
                              field,
                              [field.name, 'min'],
                              null,
                              { disabled: !canUpdateTask(field.fieldKey), min: 0 }
                            )}
                          </Col>
                          <Col>
                            {renderInputNumberFormItem(
                              t('configurationProject:labeling.form.max'),
                              null,
                              field,
                              [field.name, 'max'],
                              null,
                              { disabled: !canUpdateTask(field.fieldKey), min: 0 }
                            )}
                          </Col>
                        </>
                      )}
                    </Row>
                    <Form.List name={[field.name, 'values']}>
                      {(valueFields, { add: addToList, remove: removeToList }) => (
                        <>
                          <Styled.Labels>
                            {valueFields.map((valueField) => (
                              <Row gutter={[8, 8]} key={valueField.fieldKey}>
                                <Col span="3">
                                  {resolvedComponentWithTooltip(
                                    !!resolvedNameOfTaskChild(field.name, valueField.fieldKey),
                                    t('configurationProject:labeling.form.isLabelUsedInCondition', {
                                      task: resolvedNameOfTaskChild(field.name, valueField.fieldKey),
                                    }),
                                    renderInputFormItem(
                                      !valueField.name && t('configurationProject:labeling.form.label.code'),
                                      null,
                                      null,
                                      [valueField.name, 'value'],
                                      {
                                        disabled:
                                          !!resolvedNameOfTaskChild(field.name, valueField.fieldKey) ||
                                          !canUpdateTaskValue(field.name, valueField.fieldKey),
                                      },
                                      {
                                        rules: [
                                          {
                                            required: true,
                                            message: t('configurationProject:labeling.form.required', {
                                              label: t('configurationProject:labeling.form.code'),
                                            }),
                                          },
                                          _uniqueValidation('value', [LABELING, field.name, 'values']),
                                        ],
                                      }
                                    )
                                  )}
                                </Col>
                                <Col span="4">
                                  {renderInputFormItem(
                                    !valueField.name && t('configurationProject:labeling.form.label.name'),
                                    null,
                                    null,
                                    [valueField.name, 'label'],
                                    null,
                                    {
                                      rules: [_uniqueValidation('label', [LABELING, field.name, 'values'])],
                                    }
                                  )}
                                </Col>
                                {!isTaskText(field.name) && (
                                  <>
                                    {' '}
                                    <Col flex="75px">
                                      <Form.Item
                                        name={[valueField.name, 'color']}
                                        fieldKey={[valueField.name, 'color']}
                                        label={!valueField.name && t('configurationProject:labeling.form.label.color')}
                                      >
                                        <Select
                                          dropdownRender={(menu) => (
                                            <Styled.DropdownMenu>
                                              {menu}
                                              <Styled.Divider />
                                              <Styled.PlusOutlined onClick={_onClickAddColor} />
                                              <Styled.Modal
                                                width={268}
                                                visible={isAddColor}
                                                closable={false}
                                                onCancel={_onCloseModal}
                                                onOk={_onConfirmAddColorClick(field.name, valueField.name)}
                                              >
                                                <SketchPicker
                                                  presetColors={[]}
                                                  color={addColor}
                                                  onChange={_onColorChange}
                                                />
                                              </Styled.Modal>
                                            </Styled.DropdownMenu>
                                          )}
                                        >
                                          <Select.Option value={null} key={0}>
                                            <Styled.StopOutlined />
                                          </Select.Option>
                                          {map(colors, (value, i) => (
                                            <Select.Option value={value} key={i + 1}>
                                              <Styled.Tag color={value} />
                                            </Select.Option>
                                          ))}
                                        </Select>
                                      </Form.Item>
                                    </Col>
                                    <Col span="3">
                                      {renderInputFormItem(
                                        !valueField.name && t('configurationProject:labeling.form.label.hotkey'),
                                        null,
                                        null,
                                        [valueField.name, 'hotkey'],
                                        {
                                          maxLength: 1,
                                        },
                                        {
                                          rules: [
                                            _uniqueValidation('hotkey', [LABELING, field.name, 'values']),
                                            {
                                              max: 1,
                                              message: t('configurationProject:labeling.form.maxHotkey'),
                                            },
                                          ],
                                        }
                                      )}
                                    </Col>
                                  </>
                                )}
                                <Col flex="auto">
                                  {renderInputFormItem(
                                    !valueField.name && t('configurationProject:labeling.form.label.description'),
                                    null,
                                    null,
                                    [valueField.name, 'description']
                                  )}
                                </Col>
                                <Styled.LastCol span="1">
                                  {canUpdateTaskValue(field.name, valueField.fieldKey) && (
                                    <Styled.CloseCircleFilled
                                      onClick={_onDeleteLabelClick(removeToList, valueField.name)}
                                    />
                                  )}
                                </Styled.LastCol>
                              </Row>
                            ))}
                          </Styled.Labels>
                          <Form.Item>
                            <Button onClick={_onAddLabelClick(addToList)} type="primary" ghost>
                              {t('configurationProject:labeling.addLabel')}
                            </Button>
                          </Form.Item>
                        </>
                      )}
                    </Form.List>
                  </Collapse.Panel>
                ))}
              </Styled.Collapse>
              {!isEdit ? (
                <Styled.ButtonsContainer>
                  <Form.Item>
                    <Button onClick={_onTaskAddClick(add, fields.length)} type="primary" ghost>
                      {t('configurationProject:labeling.addTask')}
                    </Button>
                  </Form.Item>
                  <Form.Item>
                    <Button type="ghost" disabled={isEmpty(projectConfig)} onClick={_onExportConfigClick}>
                      {t('configurationProject:exportButton')}
                    </Button>
                  </Form.Item>
                </Styled.ButtonsContainer>
              ) : (
                <Form.Item>
                  <Button onClick={_onTaskAddClick(add, fields.length)} type="primary" ghost>
                    {t('configurationProject:labeling.addTask')}
                  </Button>
                </Form.Item>
              )}
            </>
          )}
        </Form.List>
      </Styled.Form>
    </Styled.Root>
  )
}

LabelingStepPage.propTypes = {
  isEdit: PropTypes.bool,
}

export default LabelingStepPage
