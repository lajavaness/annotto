import { Form, Input, Select } from 'antd'
import { debounce, isEmpty } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import React, { useCallback, useEffect, useMemo } from 'react'
import moment from 'moment'

import { fetchClients, fetchUsers } from 'modules/root/actions/rootActions'
import { updateConfigProject } from 'modules/configurationProject/actions/configurationProjectActions'

import {
  selectConfigProject,
  selectInitialConfigDefaultTag,
} from 'modules/configurationProject/selectors/configurationProjectSelectors'
import { selectProjectClients, selectUsers } from 'modules/root/selectors/rootSelectors'

import {
  ADMINS,
  CLIENT,
  DATASCIENTISTS,
  DEADLINE,
  DESCRIPTION,
  NAME,
  PROJECT,
  TAGS,
  TYPE,
  USERS,
} from 'shared/enums/configurationsProjectPropertiesTypes'
import projectType from 'shared/enums/projectType'
import tagTypes from 'shared/enums/tagTypes'

import * as Styled from 'modules/configurationProject/components/__styles__/ConfigStepPage.styles'

const ConfigStepPage = () => {
  const projectConfig = useSelector(selectConfigProject)
  const users = useSelector(selectUsers)
  const client = useSelector(selectProjectClients)
  const defaultInitialTags = useSelector(selectInitialConfigDefaultTag)

  const dispatch = useDispatch()

  const { t } = useTranslation('configurationProject')

  const [form] = Form.useForm()

  const projectConfigWithDefaultTags = useMemo(
    () => ({
      ...projectConfig,
      defaultTags: tagTypes.map((tag) => t(`configurationProject:config.${tag}`)),
    }),
    [projectConfig, t]
  )

  const tagOptions = useMemo(
    () => [
      ...(!isEmpty(defaultInitialTags)
        ? defaultInitialTags
            .filter((value) => !tagTypes.some((tag) => value !== tag))
            .map((value) => ({ value, label: value }))
        : []),
      ...tagTypes.map((value) => ({
        value: t(`configurationProject:config.${value}`),
        label: t(`configurationProject:config.${value}`),
      })),
    ],
    [defaultInitialTags, t]
  )

  const projectOptions = projectType.map((value) => ({ value, label: value }))
  const userOptions = users?.map(({ email }) => ({ value: email, label: email }))
  const clientOptions = client?.data?.map(({ name }) => ({ value: name, label: name }))
  const today = useMemo(() => moment(), [])

  const disabledDate = useCallback((current) => current.startOf('day').diff(today.startOf('day'), 'days') < 0, [today])

  useEffect(() => {
    if (projectConfig) {
      form.setFieldsValue(projectConfig)
    }
  }, [form, projectConfig])

  const _onUserSearch = useCallback(
    debounce((value) => dispatch(fetchUsers(value)), 500),
    [dispatch]
  )

  const _onClientSearch = useCallback(
    debounce((value) => dispatch(fetchClients(value)), 500),
    [dispatch]
  )

  const _onClientFocus = useCallback(() => dispatch(fetchClients()), [dispatch])

  const _onValuesChange = useCallback(
    debounce((_, values) => dispatch(updateConfigProject(PROJECT, values)), 500),
    [dispatch]
  )

  return (
    <Styled.Root>
      <Styled.Form
        layout="vertical"
        initialValues={projectConfigWithDefaultTags}
        form={form}
        onValuesChange={_onValuesChange}
      >
        <Styled.ItemsContainer>
          <Styled.Title>{t('configurationProject:config.detail')}</Styled.Title>
          <Form.Item required label={t('configurationProject:config.client')} name={CLIENT} onFocus={_onClientFocus}>
            <Styled.AutoComplete onSearch={_onClientSearch} options={clientOptions} />
          </Form.Item>
          <Form.Item required label={t('configurationProject:config.type')} name={TYPE}>
            <Styled.Select options={projectOptions} />
          </Form.Item>
          <Form.Item required label={t('configurationProject:config.name')} name={NAME}>
            <Styled.Input />
          </Form.Item>
          <Form.Item required label={t('configurationProject:config.deadline')} name={DEADLINE}>
            <Styled.DatePicker disabledDate={disabledDate} format={'L'} />
          </Form.Item>
          <Form.Item required label={t('configurationProject:config.description')} name={DESCRIPTION}>
            <Input.TextArea autoSize={{ minRows: 4 }} />
          </Form.Item>
          <Form.Item label={t('configurationProject:config.tags')} name={TAGS}>
            <Select mode="tags" options={tagOptions} />
          </Form.Item>
          <Styled.Title>{t('configurationProject:config.permissions')}</Styled.Title>
          <Form.Item label={t('configurationProject:config.admins')} name={ADMINS}>
            <Select mode="multiple" onSearch={_onUserSearch} options={userOptions} />
          </Form.Item>
          <Form.Item label={t('configurationProject:config.dataScientists')} name={DATASCIENTISTS}>
            <Select mode="multiple" onSearch={_onUserSearch} options={userOptions} />
          </Form.Item>
          <Form.Item label={t('configurationProject:config.users')} name={USERS}>
            <Select mode="multiple" onSearch={_onUserSearch} options={userOptions} />
          </Form.Item>
        </Styled.ItemsContainer>
      </Styled.Form>
    </Styled.Root>
  )
}

export default ConfigStepPage
