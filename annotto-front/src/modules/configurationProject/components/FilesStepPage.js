import { Alert, Button, Form, Modal, Space, Upload, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { debounce, isEmpty, isEqual, some } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import React, { useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'

import {
  updateConfigProject,
  uploadAnnotations,
  uploadItems,
  uploadPredictions,
} from 'modules/configurationProject/actions/configurationProjectActions'

import {
  selectConfigAnnotations,
  selectConfigItems,
  selectConfigPredictions,
  selectConfigProject,
} from 'modules/configurationProject/selectors/configurationProjectSelectors'
import { selectIsSimilarityAllowed } from 'modules/root/selectors/rootSelectors'

import {
  ANNOTATIONS,
  API,
  CONFIG,
  DEADLINE,
  FILE,
  ITEMS,
  PREDICTIONS,
  PROJECT,
} from 'shared/enums/configurationsProjectPropertiesTypes'

import * as Styled from 'modules/configurationProject/components/__styles__/FilesStepPage.styles'

const FilesStepPage = ({ isEdit }) => {
  const projectConfig = useSelector(selectConfigProject)
  const itemsConfig = useSelector(selectConfigItems)
  const predictionsConfig = useSelector(selectConfigPredictions)
  const annotationsConfig = useSelector(selectConfigAnnotations)
  const isSimilarityAllowed = useSelector(selectIsSimilarityAllowed)

  const dispatch = useDispatch()

  const { t } = useTranslation('configurationProject')

  const [form] = Form.useForm()

  useEffect(() => {
    if (projectConfig) {
      form.setFieldsValue(projectConfig)
    }
  }, [form, projectConfig])

  useEffect(() => {
    if (projectConfig || predictionsConfig || itemsConfig?.file) {
      const formData = {
        api: projectConfig?.[API],
        [CONFIG]: projectConfig?.file,
        [PREDICTIONS]: predictionsConfig && [predictionsConfig],
        [ANNOTATIONS]: annotationsConfig && [annotationsConfig],
        [ITEMS]: itemsConfig?.file && [itemsConfig?.file],
      }
      form.setFieldsValue(formData)
    }
  }, [form, projectConfig, predictionsConfig, itemsConfig, annotationsConfig])

  const _onConfigUploadChange = useCallback(
    ({ file, fileList }) => {
      if (!isEmpty(fileList)) {
        if (fileList?.length === 2) {
          fileList = fileList.slice(-1)
          form.setFieldsValue({ [CONFIG]: fileList })
          message.warning(t('configurationProject:files.singleFileUpload'))
        }
        const reader = new FileReader()
        reader.readAsText(file)
        reader.onload = () => {
          try {
            const config = JSON.parse(reader.result)
            config.file = fileList

            const overrideConfig =
              !isEmpty(projectConfig) &&
              some(
                config,
                (value, key) =>
                  !!projectConfig[key] &&
                  !isEqual(value, key === DEADLINE ? projectConfig[key].toISOString() : projectConfig[key])
              )

            if (overrideConfig) {
              Modal.confirm({
                title: t('configurationProject:files.warning'),
                content: t('configurationProject:files.conflict'),
                onOk: () => {
                  dispatch(updateConfigProject(FILE, config))
                },
              })
            } else {
              dispatch(updateConfigProject(FILE, config))
            }
          } catch (err) {
            console.error(err)
            message.error(t('configurationProject:files.onlyJsonFile'))
          }
        }
      }
    },
    [t, form, dispatch, projectConfig]
  )

  const _onUploadChange = useCallback(
    (type, isUpdate) =>
      ({ file, fileList }) => {
        if (fileList?.length === 2) {
          fileList = fileList.slice(-1)
          form.setFieldsValue({ [type]: fileList })
        }

        switch (type) {
          case ITEMS: {
            dispatch(uploadItems(file, isUpdate))
            break
          }
          case PREDICTIONS: {
            dispatch(uploadPredictions(file))
            break
          }
          case ANNOTATIONS: {
            dispatch(uploadAnnotations(file))
            break
          }
          default:
        }
      },
    [dispatch, form]
  )

  const _onValuesChange = useCallback(
    debounce(
      (value, values) =>
        ![CONFIG, PREDICTIONS, ITEMS].includes(Object.keys(value)[0]) && dispatch(updateConfigProject(PROJECT, values)),
      500
    ),
    [dispatch]
  )

  const _normFile = (e) => (Array.isArray(e) ? e : e && e.fileList)

  const _beforeUpload = () => false

  return (
    <Styled.Root>
      <Styled.Form layout="vertical" initialValues={projectConfig} form={form} onValuesChange={_onValuesChange}>
        {isEdit && (
          <Styled.AlertContainer>
            <Alert message={t('configurationProject:files.alert')} type="error" showIcon />
          </Styled.AlertContainer>
        )}
        <Styled.ItemsContainer>
          <Styled.Title>{t('configurationProject:files.files')}</Styled.Title>
          <Form.Item
            name={CONFIG}
            label={t('configurationProject:files.configFile')}
            valuePropName="fileList"
            getValueFromEvent={_normFile}
          >
            <Upload name={CONFIG} onChange={_onConfigUploadChange} beforeUpload={_beforeUpload}>
              <Button icon={<UploadOutlined />}>{t('configurationProject:files.add')}</Button>
            </Upload>
          </Form.Item>
          <Form.Item label={t('configurationProject:files.itemFile')} required={!isEdit}>
            <Styled.Space align="start">
              <Form.Item name={ITEMS} valuePropName="fileList" getValueFromEvent={_normFile} noStyle required={!isEdit}>
                <Upload onChange={_onUploadChange(ITEMS, false)} beforeUpload={_beforeUpload} multiple={false}>
                  <Button icon={<UploadOutlined />}>{t('configurationProject:files.add')}</Button>
                </Upload>
              </Form.Item>
              {isEdit && (
                <>
                  <Styled.Span>{t('configurationProject:files.or')}</Styled.Span>
                  <Form.Item
                    name={ITEMS}
                    valuePropName="fileList"
                    getValueFromEvent={_normFile}
                    noStyle
                    required={!isEdit}
                  >
                    <Upload
                      onChange={_onUploadChange(ITEMS, true)}
                      showUploadList={false}
                      beforeUpload={_beforeUpload}
                      multiple={false}
                    >
                      <Button icon={<UploadOutlined />}>{t('configurationProject:files.update')}</Button>
                    </Upload>
                  </Form.Item>
                </>
              )}
            </Styled.Space>
          </Form.Item>
          <Form.Item label={t('configurationProject:files.annotatedFile')}>
            <Space align="start">
              <Form.Item name={ANNOTATIONS} valuePropName="fileList" getValueFromEvent={_normFile} noStyle>
                <Upload onChange={_onUploadChange(ANNOTATIONS)} beforeUpload={_beforeUpload} multiple={false}>
                  <Button icon={<UploadOutlined />}>{t('configurationProject:files.add')}</Button>
                </Upload>
              </Form.Item>
            </Space>
          </Form.Item>
          <Form.Item label={t('configurationProject:files.predictionFile')}>
            <Space align="start">
              <Form.Item name={PREDICTIONS} valuePropName="fileList" getValueFromEvent={_normFile} noStyle>
                <Upload onChange={_onUploadChange(PREDICTIONS)} beforeUpload={_beforeUpload} multiple={false}>
                  <Button icon={<UploadOutlined />}>{t('configurationProject:files.add')}</Button>
                </Upload>
              </Form.Item>
            </Space>
          </Form.Item>
          {isSimilarityAllowed && (
            <Form.Item label={t('configurationProject:files.api')} name={API}>
              <Styled.Input />
            </Form.Item>
          )}
        </Styled.ItemsContainer>
      </Styled.Form>
    </Styled.Root>
  )
}

FilesStepPage.propTypes = {
  isEdit: PropTypes.bool,
}

export default FilesStepPage
