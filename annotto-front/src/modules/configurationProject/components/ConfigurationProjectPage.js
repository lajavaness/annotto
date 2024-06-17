import { Button, Modal, Space, Steps, notification } from 'antd'
import { isEmpty, isEqual } from 'lodash'
import { navigate } from '@reach/router'
import { useDispatch, useSelector } from 'react-redux'
import { useDown } from '@xstyled/styled-components'
import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'

import Loader from 'shared/components/loader/Loader'
import Page from 'shared/components/page/Page'

import {
  selectConfig,
  selectConfigItems,
  selectConfigProject,
  selectInitialConfig,
  selectIsPosting,
  selectIsReady,
  selectIsSuccessUpdated,
} from 'modules/configurationProject/selectors/configurationProjectSelectors'

import {
  exportCurrentConfig,
  postProject,
  putConfigProject,
  resetConfig,
} from 'modules/configurationProject/actions/configurationProjectActions'

import {
  CLIENT,
  CONFIG,
  DEADLINE,
  DESCRIPTION,
  LABELING,
  NAME,
  TYPE,
} from 'shared/enums/configurationsProjectPropertiesTypes'

import * as Styled from 'modules/configurationProject/components/__styles__/ConfigurationProjectPage.styles'

const extractTabFromURL = ({ pathname } = {}) => pathname?.split('/')[3]

const ConfigurationProjectPage = ({ children, path, location, setHeaderActions, isEdit }) => {
  const [tabValue, setTabValue] = useState()

  const isReady = useSelector(selectIsReady)
  const projectConfig = useSelector(selectConfigProject)
  const config = useSelector(selectConfig)
  const itemsConfig = useSelector(selectConfigItems)
  const isPosting = useSelector(selectIsPosting)
  const initialConfig = useSelector(selectInitialConfig)
  const isSuccessUpdated = useSelector(selectIsSuccessUpdated)

  const isMobile = useDown('sm')

  const dispatch = useDispatch()

  const { t } = useTranslation('configurationProject')

  const stepsComponent = children?.props?.children?.filter((child) => !!child && !!child.props?.path)
  const index = stepsComponent?.findIndex(({ props }) => location.pathname.includes(props?.path))
  const currentStep = index === -1 ? 0 : index

  const steps = useMemo(() => {
    return !isEmpty(stepsComponent) ? stepsComponent.map(({ props }) => props.path.split('/')[1]) : []
  }, [stepsComponent])

  const isValidCreateForm = useMemo(
    () =>
      !isEmpty(projectConfig) &&
      projectConfig[NAME] &&
      projectConfig[CLIENT] &&
      projectConfig[TYPE] &&
      projectConfig[DEADLINE] &&
      projectConfig[DESCRIPTION] &&
      !isEmpty(projectConfig[LABELING]) &&
      !!itemsConfig?.file,
    [projectConfig, itemsConfig]
  )

  const isValidEditForm = useMemo(
    () =>
      !isEmpty(projectConfig) &&
      projectConfig[NAME] &&
      projectConfig[CLIENT] &&
      projectConfig[TYPE] &&
      projectConfig[DEADLINE] &&
      projectConfig[DESCRIPTION] &&
      !isEmpty(projectConfig[LABELING]),
    [projectConfig]
  )

  useEffect(() => {
    if (tabValue !== extractTabFromURL(location)) {
      setTabValue(() => extractTabFromURL(location))
    }
  }, [location, tabValue])

  useEffect(() => {
    if (isSuccessUpdated) {
      notification.success({ message: t('configurationProject:successMessage') })
    }
  }, [isSuccessUpdated, t])

  const _onClickNext = () => path && navigate(`${path}${stepsComponent[currentStep + 1]?.props?.path}`)

  const _onClickPrev = () => path && navigate(`${path}${stepsComponent[currentStep - 1]?.props?.path}`)

  const _onStepChange = (current) => navigate(`${path}${stepsComponent[current]?.props?.path}`)

  const _onTabClick = useCallback(
    (value) => {
      const { pathname } = location
      if (value !== tabValue) {
        if (!isEqual(config, initialConfig)) {
          Modal.confirm({
            icon: <Styled.ExclamationCircleOutlined />,
            title: t(`configurationProject:changeTabModal.title`),
            content: t(`configurationProject:changeTabModal.${isValidEditForm ? 'content' : 'contentError'}`),
            okText: t(`configurationProject:changeTabModal.okText`),
            cancelText: t(`configurationProject:changeTabModal.cancelText`),
            okButtonProps: {
              disabled: !isValidEditForm,
            },
            onOk() {
              setTabValue(value)
              dispatch(putConfigProject())
              navigate(`${pathname.substring(0, pathname.lastIndexOf('/'))}/${value}`)
            },
            onCancel() {
              setTabValue(value)
              dispatch(resetConfig())
              navigate(`${pathname.substring(0, pathname.lastIndexOf('/'))}/${value}`)
            },
          })
        } else {
          setTabValue(value)
          navigate(`${pathname.substring(0, pathname.lastIndexOf('/'))}/${value}`)
        }
      }
    },
    [dispatch, isValidEditForm, t, location, tabValue, config, initialConfig]
  )

  const _onSubmitClick = useCallback(() => {
    if (isEdit && isValidEditForm) {
      dispatch(putConfigProject())
    } else if (isValidCreateForm) {
      dispatch(postProject())
    }
  }, [isValidEditForm, isValidCreateForm, isEdit, dispatch])

  const _onCancelClick = useCallback(() => navigate('/'), [])

  const _onResetClick = useCallback(
    () =>
      Modal.confirm({
        title: t('configurationProject:resetConfirmationModal.title'),
        content: t('configurationProject:resetConfirmationModal.content'),
        okText: t('configurationProject:resetConfirmationModal.okText'),
        onOk: () => {
          dispatch(resetConfig())
        },
      }),
    [dispatch, t]
  )

  const _onExportConfigClick = useCallback(() => dispatch(exportCurrentConfig([CONFIG])), [dispatch])

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (setHeaderActions) {
      if (isReady) {
        if (isEdit && config?.project && initialConfig && !isEqual(config, initialConfig)) {
          return setHeaderActions(
            <Space>
              <Button type="link" onClick={_onResetClick}>
                {t('configurationProject:reset')}
              </Button>

              <Button type="primary" onClick={_onSubmitClick} loading={isPosting} disabled={!isValidEditForm}>
                {t('configurationProject:save')}
              </Button>
            </Space>
          )
        }
        if (!isEdit) {
          return setHeaderActions(
            <Space>
              <Button type="link" onClick={_onCancelClick}>
                {t('configurationProject:cancel')}
              </Button>
              <Button type="primary" onClick={_onSubmitClick} loading={isPosting} disabled={!isValidCreateForm}>
                {t('configurationProject:submit')}
              </Button>
            </Space>
          )
        }
      }
      return setHeaderActions(null)
    }
  }, [
    _onSubmitClick,
    _onCancelClick,
    _onResetClick,
    isEdit,
    setHeaderActions,
    initialConfig,
    isValidCreateForm,
    isValidEditForm,
    isReady,
    isPosting,
    t,
    config,
  ])

  return (
    <Page id="configuration_project">
      {isReady ? (
        <Styled.Root>
          {!isEdit ? (
            <>
              <Styled.Steps
                progressDot
                direction={isMobile ? 'vertical' : 'horizontal'}
                current={currentStep}
                onChange={_onStepChange}
              >
                {steps.map((item) => (
                  <Steps.Step key={item} title={t(`configurationProject:steps.${item}`)} />
                ))}
              </Styled.Steps>
              <Styled.Content>{children}</Styled.Content>
            </>
          ) : (
            <Styled.Tabs hideAdd activeKey={tabValue} onChange={_onTabClick} type="card">
              {steps.map((item) => (
                <Styled.TabPane key={item} tab={t(`configurationProject:steps.${item}`)}>
                  {children}
                </Styled.TabPane>
              ))}
            </Styled.Tabs>
          )}
          {!isEdit && (
            <Styled.Footer>
              {currentStep !== steps.indexOf(LABELING) && (
                <Styled.ExportButton type="ghost" disabled={isEmpty(projectConfig)} onClick={_onExportConfigClick}>
                  {t('configurationProject:exportButton')}
                </Styled.ExportButton>
              )}
              <Space size={12}>
                <Button disabled={currentStep === 0} onClick={_onClickPrev}>
                  {t('configurationProject:prev')}
                </Button>
                {currentStep < steps.length - 1 && (
                  <Button type="primary" onClick={_onClickNext}>
                    {t('configurationProject:next')}
                  </Button>
                )}
              </Space>
            </Styled.Footer>
          )}
        </Styled.Root>
      ) : (
        <Loader />
      )}
    </Page>
  )
}

ConfigurationProjectPage.propTypes = {
  children: PropTypes.node,
  isEdit: PropTypes.bool,
  path: PropTypes.string,
  setHeaderActions: PropTypes.func,
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }),
}

export default ConfigurationProjectPage
