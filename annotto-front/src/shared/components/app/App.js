import { Redirect } from '@reach/router'
import { notification } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react'

import ErrorBoundary from 'shared/components/error/ErrorBoundary'

import { logout } from 'modules/root/actions/rootActions'

import {
  CREATE_PROJECT,
  EDIT_PROJECT,
  EDIT_PROJECT_EXPORT,
  VIEW_PROJECT,
  VIEW_PROJECTS,
} from 'shared/enums/privilegesTypes'

import usePrivileges from 'shared/hooks/usePrivileges'

import { selectHttpError, selectIsAppReady } from 'modules/root/selectors/rootSelectors'
import { selectUserInfo } from 'modules/root/selectors/authSelectors'

import Loader from 'shared/components/loader/Loader'
import Main from 'shared/components/app/Main'
import Result from 'shared/components/result/Result'

import useProjectPrivileges from 'shared/hooks/useProjectPrivileges'

import * as Styled from './__styles__/App.styles'

const Project = lazy(() => import(/* webpackPrefetch: true */ 'modules/project'))
const Projects = lazy(() => import(/* webpackPrefetch: true */ 'modules/projects'))
const HomePage = lazy(() => import(/* webpackPrefetch: true */ 'modules/projects/components/HomePage'))
const ConfigurationProject = lazy(() => import(/* webpackPrefetch: true */ 'modules/configurationProject'))
const ConfigStepPage = lazy(
  () => import(/* webpackPrefetch: true */ 'modules/configurationProject/components/ConfigStepPage')
)
const LabelingStepPage = lazy(
  () => import(/* webpackPrefetch: true */ 'modules/configurationProject/components/LabelingStepPage')
)
const ExportStepPage = lazy(
  () => import(/* webpackPrefetch: true */ 'modules/configurationProject/components/ExportStepPage')
)
const FilesStepPage = lazy(
  () => import(/* webpackPrefetch: true */ 'modules/configurationProject/components/FilesStepPage')
)
const GuideStepPage = lazy(
  () => import(/* webpackPrefetch: true */ 'modules/configurationProject/components/GuideStepPage')
)
const HomeProjectPage = lazy(
  () => import(/* webpackPrefetch: true */ 'modules/project/components/pages/HomeProjectPage')
)
const AnnotationPage = lazy(() => import(/* webpackPrefetch: true */ 'modules/project/components/pages/AnnotationPage'))

const App = () => {
  const [headerActions, setHeaderActions] = useState(null)

  const isAppReady = useSelector(selectIsAppReady)
  const user = useSelector(selectUserInfo)
  const httpError = useSelector(selectHttpError)

  const hasPrivilege = usePrivileges()
  const hasProjectPrivilege = useProjectPrivileges(true)

  const dispatch = useDispatch()

  const { t, i18n } = useTranslation('root', { useSuspense: false })

  useEffect(() => {
    if (httpError) {
      notification.error({
        message: i18n.exists(`root:apiError.${httpError.name}`)
          ? t(`root:apiError.${httpError.name}`)
          : t('root:apiError.title'),
        description: httpError.infos || null,
        duration: 3,
      })
      if (httpError.status === 401) {
        dispatch(logout())
      }
    }
  }, [dispatch, httpError, i18n, t])

  const resolvedProjectsRoutes = useMemo(
    () =>
      hasPrivilege(VIEW_PROJECTS) ? (
        <Projects path="/">
          <Result path="/" default status={'404'} />
          <HomePage path="/" setHeaderActions={setHeaderActions} />
        </Projects>
      ) : (
        <Result path="/" status={'403'} />
      ),
    [hasPrivilege]
  )

  const resolvedProjectRoutes = useMemo(
    () =>
      hasPrivilege(VIEW_PROJECT) ? (
        <Project path="/project/:projectId">
          <Result path="/" default status={'404'} />
          <HomeProjectPage path="/" setHeaderActions={setHeaderActions} />
          <AnnotationPage path="/annotation/*itemId" setHeaderActions={setHeaderActions} />
        </Project>
      ) : (
        <Result path="/project/*" status={'403'} />
      ),
    [hasPrivilege]
  )

  const resolvedConfigurationCreateProject = useMemo(
    () =>
      hasPrivilege(CREATE_PROJECT) ? (
        <ConfigurationProject path="/create_project" setHeaderActions={setHeaderActions}>
          <ConfigStepPage path="/config" />
          <FilesStepPage path="/files" />
          <LabelingStepPage path="/labeling" />
          <GuideStepPage path="/guide" />
          <Redirect from="*" to="/create_project/config" noThrow default />
        </ConfigurationProject>
      ) : (
        <Result path="/create_project/*" status={'403'} />
      ),
    [hasPrivilege]
  )

  const resolvedConfigurationEditProject = useMemo(
    () => (
      <>
        <Result path="/edit_project/*" status={'403'} default />
        <ConfigurationProject path="/edit_project/:projectId" setHeaderActions={setHeaderActions} isEdit>
          {hasProjectPrivilege(EDIT_PROJECT) && <ConfigStepPage path="/config" />}
          {hasProjectPrivilege(EDIT_PROJECT) && <FilesStepPage path="/files" isEdit />}
          {hasProjectPrivilege(EDIT_PROJECT_EXPORT) && <ExportStepPage path="/export" />}
          {hasProjectPrivilege(EDIT_PROJECT) && <LabelingStepPage path="/labeling" isEdit />}
          {hasProjectPrivilege(EDIT_PROJECT) && <GuideStepPage path="/guide" />}
        </ConfigurationProject>
        <Redirect from="/edit_project/:projectId" to="/edit_project/:projectId/config" noThrow />
        <Redirect from="/edit_project/*" to="/" noThrow />
      </>
    ),
    [hasProjectPrivilege]
  )

  return isAppReady ? (
    <Styled.Root>
      <ErrorBoundary>
        <Styled.Router primary={false}>
          <Suspense path="/" fallback={<Loader />}>
            <Main path="/" user={user} headerActions={headerActions} setHeaderActions={setHeaderActions}>
              {resolvedProjectsRoutes}
              {resolvedProjectRoutes}
              {resolvedConfigurationCreateProject}
              {resolvedConfigurationEditProject}
            </Main>
          </Suspense>
        </Styled.Router>
      </ErrorBoundary>
    </Styled.Root>
  ) : (
    <Loader />
  )
}

export default App
