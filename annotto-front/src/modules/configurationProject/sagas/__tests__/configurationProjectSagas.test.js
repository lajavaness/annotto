import { call, fork, put, race, select, take, takeLatest } from 'redux-saga/effects'
import { globalHistory, navigate } from '@reach/router'

import { sagaNextN } from 'setupTests'

import {
  EXPORT_CONFIG,
  EXPORT_CURRENT_CONFIG,
  POST_FILE,
  POST_FILE_SUCCESS,
  POST_PROJECT,
  PUT_CONFIG_PROJECT,
  STARTUP,
  UPDATE_CONFIG_PROJECT,
  exportCurrentConfigFailure,
  exportCurrentConfigSuccess,
  postFile,
  postFileFailure,
  postFileSuccess,
  postProjectFailure,
  postProjectSuccess,
  putConfigProjectFailure,
  putConfigProjectSuccess,
  startupFailure,
  startupSuccess,
  updateConfigProjectFailure,
  updateConfigProjectSuccess,
} from 'modules/configurationProject/actions/configurationProjectActions'
import { fetchBundle } from 'shared/actions/i18nActions'
import { fetchProject } from 'modules/root/actions/rootActions'
import { request } from 'shared/actions/apiActions'

import configurationProjectSagas, {
  exportConfigSaga,
  exportCurrentConfigSaga,
  postFileSaga,
  postProjectSaga,
  putConfigProjectSaga,
  startupSaga,
  updateConfigProjectSaga,
  watchExportConfig,
  watchExportCurrentConfig,
  watchPostFile,
  watchPostProject,
  watchPutConfigProject,
  watchStartup,
  watchUpdateConfigProject,
} from 'modules/configurationProject/sagas/configurationProjectSagas'

import { resolveApiUrl } from 'shared/utils/urlUtils'

import { initialState } from 'modules/configurationProject/reducers/configurationProjectReducer'

import {
  mapConfigProjectPostRequestService,
  mapConfigProjectResponseService,
  mergeConfigService,
} from 'modules/configurationProject/services/configurationProjectServices'

import {
  ANNOTATIONS,
  FILE,
  ITEMS,
  LABELING,
  PREDICTIONS,
  PROJECT,
} from 'shared/enums/configurationsProjectPropertiesTypes'

import {
  selectConfigAnnotations,
  selectConfigItems,
  selectConfigPredictions,
  selectConfigProject,
  selectConfigProjectName,
} from 'modules/configurationProject/selectors/configurationProjectSelectors'

describe('configurationProjectSagas', () => {
  describe('watchStartup', () => {
    it('links to startupSaga', () => {
      const saga = watchStartup()
      expect(saga.next().value).toEqual(takeLatest(STARTUP, startupSaga))
    })
  })

  describe('startupSaga', () => {
    const namespace = 'configurationProject'

    it('puts bundle fetching', () => {
      const saga = startupSaga()
      expect(saga.next().value).toEqual(put(fetchBundle(namespace)))
    })

    it('takes bundle fetching result', () => {
      const saga = startupSaga()
      sagaNextN(saga, 1)
      expect(saga.next().value).toMatchObject({ type: 'TAKE' })
    })

    describe('creation mode', () => {
      const { project } = initialState.config

      beforeEach(() => {
        globalHistory.location.pathname = `/create_project/config`
      })

      it('puts success', () => {
        const saga = startupSaga()
        sagaNextN(saga, 2)
        expect(saga.next().value).toEqual(put(startupSuccess(project)))
      })
    })

    describe('edit mode', () => {
      const project = { name: 'foo' }
      const projectId = 'foo'

      beforeEach(() => {
        globalHistory.location.pathname = `/edit_project/${projectId}/config`
      })

      it('puts fetchProject', () => {
        const saga = startupSaga()
        sagaNextN(saga, 2)
        expect(saga.next().value).toEqual(put(fetchProject(projectId)))
      })

      it('races logs fetching result', () => {
        const saga = startupSaga()
        sagaNextN(saga, 3)
        expect(saga.next().value).toEqual(
          race({
            success: expect.anything(),
            failure: expect.anything(),
          })
        )
      })

      describe('success', () => {
        const success = { payload: { project } }

        it('calls mapConfigProjectResponseService', () => {
          const saga = startupSaga()
          sagaNextN(saga, 4)
          expect(saga.next({ success }).value).toEqual(call(mapConfigProjectResponseService, success.payload.project))
        })

        it('puts success', () => {
          const saga = startupSaga()
          sagaNextN(saga, 4)
          saga.next({ success })
          expect(saga.next(project).value).toEqual(put(startupSuccess(project)))
        })
      })

      describe('failure', () => {
        const failure = { payload: { error: 'foo' } }

        it('calls navigate', () => {
          const saga = startupSaga()
          sagaNextN(saga, 4)

          expect(saga.next({ failure }).value).toEqual(call(navigate, '/'))
        })
        it('puts startupFailure', () => {
          const saga = startupSaga()
          sagaNextN(saga, 4)
          saga.next({ failure })
          expect(saga.next().value).toEqual(put(startupFailure(failure.payload.error)))
        })
      })
    })

    it('puts startupFailure', () => {
      const saga = startupSaga()
      sagaNextN(saga, 1)
      const err = new Error('error')
      expect(saga.throw(err).value).toEqual(put(startupFailure(err)))
    })
  })

  describe('watchPostProject', () => {
    it('links to postProjectSaga', () => {
      const saga = watchPostProject()
      expect(saga.next().value).toEqual(takeLatest(POST_PROJECT, postProjectSaga))
    })
  })

  describe('postProjectSaga', () => {
    const transactionId = 'post_project'
    const projectConfig = { foo: 'foo' }
    const itemsConfig = { bar: 'bar', file: 'bar' }
    const predictionsConfig = 'foo'
    const annotationsConfig = 'foo'
    const url = resolveApiUrl('REACT_APP_POST_PROJECT_ROUTE')
    const configFile = new File([new Blob([JSON.stringify(projectConfig)])], 'config.json', {
      type: 'text/json;charset=utf-8',
      lastModified: new Date(),
    })

    it('selects selectConfigProject', () => {
      const saga = postProjectSaga()
      expect(saga.next().value).toEqual(select(selectConfigProject))
    })

    it('selects selectConfigItems', () => {
      const saga = postProjectSaga()
      sagaNextN(saga, 1)
      expect(saga.next(projectConfig).value).toEqual(select(selectConfigItems))
    })

    it('selects selectConfigPredictions', () => {
      const saga = postProjectSaga()
      sagaNextN(saga, 1)
      saga.next(projectConfig)
      expect(saga.next(itemsConfig).value).toEqual(select(selectConfigPredictions))
    })

    it('selects selectConfigAnnotations', () => {
      const saga = postProjectSaga()
      sagaNextN(saga, 1)
      saga.next(projectConfig)
      saga.next(itemsConfig)
      expect(saga.next(predictionsConfig).value).toEqual(select(selectConfigAnnotations))
    })

    it('calls mapConfigProjectPostRequestService', () => {
      const saga = postProjectSaga()
      sagaNextN(saga, 1)
      saga.next(projectConfig)
      saga.next(itemsConfig)
      saga.next(predictionsConfig)
      expect(saga.next(annotationsConfig).value).toEqual(call(mapConfigProjectPostRequestService, projectConfig))
    })

    const cases = [
      {
        title: 'prediction config is defined and annotationConfig is not defined',
        projectConfig,
        annotationsConfig: null,
      },
      {
        title: 'prediction config is not defined and annotationConfig is defined',
        projectConfig: null,
        annotationsConfig,
      },
      { title: 'prediction config and annotationConfig are defined', projectConfig, annotationsConfig },
      { title: 'prediction config and annotationConfig are not defined', projectConfig: null, annotationsConfig: null },
    ]

    cases.forEach(({ title, projectConfig: newProjectConfig, annotationsConfig: newAnnotationsConfig }) => {
      describe(title, () => {
        it('calls resolveApiUrl', () => {
          const saga = postProjectSaga()
          sagaNextN(saga, 1)
          saga.next(newProjectConfig)
          saga.next(itemsConfig)
          saga.next(predictionsConfig)
          saga.next(newAnnotationsConfig)
          expect(saga.next(newProjectConfig).value).toEqual(call(resolveApiUrl, 'REACT_APP_POST_PROJECT_ROUTE'))
        })

        it('puts request', () => {
          const data = new FormData()
          data.append(PROJECT, configFile)
          data.append(ITEMS, itemsConfig?.file)

          if (predictionsConfig) {
            data.append(PREDICTIONS, predictionsConfig)
          }

          if (newAnnotationsConfig) {
            data.append(ANNOTATIONS, newAnnotationsConfig)
          }

          const options = {
            method: 'POST',
            mimeType: 'multipart/form-data',
            body: data,
          }

          const saga = postProjectSaga()
          sagaNextN(saga, 1)
          saga.next(newProjectConfig)
          saga.next(itemsConfig)
          saga.next(predictionsConfig)
          saga.next(newAnnotationsConfig)
          saga.next(newProjectConfig)
          expect(saga.next(url).value).toEqual(put(request(url, options, transactionId)))
        })

        it('races put fetching result', () => {
          const saga = postProjectSaga()
          sagaNextN(saga, 1)
          saga.next(newProjectConfig)
          saga.next(itemsConfig)
          saga.next(predictionsConfig)
          saga.next(newAnnotationsConfig)
          saga.next(newProjectConfig)
          saga.next(url)
          expect(saga.next().value).toEqual(
            race({
              success: expect.anything(),
              failure: expect.anything(),
            })
          )
        })

        describe('success', () => {
          const success = { payload: { responseBody: { project: { _id: 'bar' } } } }

          it('calls navigate', () => {
            const saga = postProjectSaga()
            sagaNextN(saga, 1)
            saga.next(newProjectConfig)
            saga.next(itemsConfig)
            saga.next(predictionsConfig)
            saga.next(newAnnotationsConfig)
            saga.next(newProjectConfig)
            saga.next(url)
            sagaNextN(saga, 1)
            expect(saga.next({ success }).value).toEqual(
              call(navigate, `/project/${success.payload.responseBody.project._id}`)
            )
          })

          it('puts postProjectSuccess', () => {
            const saga = postProjectSaga()
            sagaNextN(saga, 1)
            saga.next(newProjectConfig)
            saga.next(itemsConfig)
            saga.next(predictionsConfig)
            saga.next(newAnnotationsConfig)
            saga.next(newProjectConfig)
            saga.next(url)
            sagaNextN(saga, 1)
            saga.next({ success })
            expect(saga.next().value).toEqual(put(postProjectSuccess()))
          })
        })

        describe('failure', () => {
          const failure = { payload: { error: 'foo' } }

          it('puts postProjectFailure', () => {
            const saga = postProjectSaga()
            sagaNextN(saga, 1)
            saga.next(newProjectConfig)
            saga.next(itemsConfig)
            saga.next(predictionsConfig)
            saga.next(newAnnotationsConfig)
            saga.next(newProjectConfig)
            saga.next(url)
            sagaNextN(saga, 1)
            expect(saga.next({ failure }).value).toEqual(put(postProjectFailure(failure.payload.error)))
          })
        })
      })
    })

    it('puts postProjectFailure', () => {
      const saga = postProjectSaga()
      sagaNextN(saga, 1)
      const err = new Error('error')
      expect(saga.throw(err).value).toEqual(put(postProjectFailure(err)))
    })
  })

  describe('watchPutConfigProject', () => {
    it('links to exportCurrentConfigSaga', () => {
      const saga = watchPutConfigProject()
      expect(saga.next().value).toEqual(takeLatest(PUT_CONFIG_PROJECT, putConfigProjectSaga))
    })
  })

  describe('putConfigProjectSaga', () => {
    const transactionId = 'put_project'
    const projectId = 'foo'
    const projectConfig = { foo: 'foo' }
    const itemsConfig = { bar: 'bar', file: 'bar', isUpdate: true }
    const predictionsConfig = 'foo'
    const annotationsConfig = 'foo'
    const url = resolveApiUrl('REACT_APP_POST_PROJECT_ROUTE')

    beforeEach(() => {
      globalHistory.location.pathname = `/configurationProject/${projectId}`
    })

    it('selects selectConfigProject', () => {
      const saga = putConfigProjectSaga()
      expect(saga.next().value).toEqual(select(selectConfigProject))
    })

    it('selects selectConfigItems', () => {
      const saga = putConfigProjectSaga()
      sagaNextN(saga, 1)
      expect(saga.next(projectConfig).value).toEqual(select(selectConfigItems))
    })

    it('selects selectConfigPredictions', () => {
      const saga = putConfigProjectSaga()
      sagaNextN(saga, 1)
      saga.next(projectConfig)
      expect(saga.next(itemsConfig).value).toEqual(select(selectConfigPredictions))
    })

    it('selects selectConfigAnnotations', () => {
      const saga = putConfigProjectSaga()
      sagaNextN(saga, 1)
      saga.next(projectConfig)
      saga.next(itemsConfig)
      expect(saga.next(predictionsConfig).value).toEqual(select(selectConfigAnnotations))
    })

    it('calls mapConfigProjectPostRequestService', () => {
      const saga = putConfigProjectSaga()
      sagaNextN(saga, 1)
      saga.next(projectConfig)
      saga.next(itemsConfig)
      saga.next(predictionsConfig)
      expect(saga.next(annotationsConfig).value).toEqual(call(mapConfigProjectPostRequestService, projectConfig))
    })

    it('calls resolveApiUrl', () => {
      const saga = postProjectSaga()
      sagaNextN(saga, 1)
      saga.next(projectConfig)
      saga.next(itemsConfig)
      saga.next(predictionsConfig)
      saga.next(annotationsConfig)
      expect(saga.next(projectConfig).value).toEqual(call(resolveApiUrl, 'REACT_APP_POST_PROJECT_ROUTE'))
    })

    it('puts request', () => {
      const options = {
        method: 'PUT',
        body: projectConfig,
      }

      const saga = putConfigProjectSaga()
      sagaNextN(saga, 1)
      saga.next(projectConfig)
      saga.next(itemsConfig)
      saga.next(predictionsConfig)
      saga.next(annotationsConfig)
      saga.next(projectConfig)
      expect(saga.next(url).value).toEqual(put(request(url, options, transactionId)))
    })

    it('races put fetching result', () => {
      const saga = putConfigProjectSaga()
      sagaNextN(saga, 1)
      saga.next(projectConfig)
      saga.next(itemsConfig)
      saga.next(predictionsConfig)
      saga.next(annotationsConfig)
      saga.next(projectConfig)
      saga.next(url)
      expect(saga.next().value).toEqual(
        race({
          success: expect.anything(),
          failure: expect.anything(),
        })
      )
    })

    describe('success', () => {
      const success = { payload: { responseBody: { project: { _id: 'bar' } } } }

      it('puts postFile for items', () => {
        const saga = putConfigProjectSaga()
        sagaNextN(saga, 1)
        saga.next(projectConfig)
        saga.next(itemsConfig)
        saga.next(predictionsConfig)
        saga.next(annotationsConfig)
        saga.next(projectConfig)
        saga.next(url)
        sagaNextN(saga, 1)
        expect(saga.next({ success }).value).toEqual(
          put(
            postFile(
              projectId,
              'REACT_APP_PROJECT_ITEMS_UPLOAD',
              ITEMS,
              itemsConfig.file,
              itemsConfig.isUpdate,
              `${transactionId}_${ITEMS}`
            )
          )
        )
      })

      it('takes POST_FILE_SUCCESS', () => {
        const saga = putConfigProjectSaga()
        sagaNextN(saga, 1)
        saga.next(projectConfig)
        saga.next(itemsConfig)
        saga.next(predictionsConfig)
        saga.next(annotationsConfig)
        saga.next(projectConfig)
        saga.next(url)
        sagaNextN(saga, 1)
        saga.next({ success })
        expect(saga.next().value).toEqual(take(POST_FILE_SUCCESS))
      })

      it('puts postFile for predictions', () => {
        const saga = putConfigProjectSaga()
        sagaNextN(saga, 1)
        saga.next(projectConfig)
        saga.next(itemsConfig)
        saga.next(predictionsConfig)
        saga.next(annotationsConfig)
        saga.next(projectConfig)
        saga.next(url)
        sagaNextN(saga, 1)
        saga.next({ success })
        sagaNextN(saga, 1)
        expect(saga.next().value).toEqual(
          put(
            postFile(
              projectId,
              'REACT_APP_PROJECT_PREDICTIONS_UPLOAD',
              PREDICTIONS,
              predictionsConfig,
              null,
              `${transactionId}_${PREDICTIONS}`
            )
          )
        )
      })

      it('takes postFile', () => {
        const saga = putConfigProjectSaga()
        sagaNextN(saga, 1)
        saga.next(projectConfig)
        saga.next(itemsConfig)
        saga.next(predictionsConfig)
        saga.next(annotationsConfig)
        saga.next(projectConfig)
        saga.next(url)
        sagaNextN(saga, 1)
        saga.next({ success })
        sagaNextN(saga, 2)
        expect(saga.next().value).toEqual(take(POST_FILE_SUCCESS))
      })

      it('puts postFile for annotations', () => {
        const saga = putConfigProjectSaga()
        sagaNextN(saga, 1)
        saga.next(projectConfig)
        saga.next(itemsConfig)
        saga.next(predictionsConfig)
        saga.next(annotationsConfig)
        saga.next(projectConfig)
        saga.next(url)
        sagaNextN(saga, 1)
        saga.next({ success })
        sagaNextN(saga, 3)
        expect(saga.next().value).toEqual(
          put(
            postFile(
              projectId,
              'REACT_APP_PROJECT_ANNOTATIONS_UPLOAD',
              ANNOTATIONS,
              annotationsConfig,
              null,
              `${transactionId}_${ANNOTATIONS}`
            )
          )
        )
      })

      it('takes postFile success', () => {
        const saga = putConfigProjectSaga()
        sagaNextN(saga, 1)
        saga.next(projectConfig)
        saga.next(itemsConfig)
        saga.next(predictionsConfig)
        saga.next(annotationsConfig)
        saga.next(projectConfig)
        saga.next(url)
        sagaNextN(saga, 1)
        saga.next({ success })
        sagaNextN(saga, 4)
        expect(saga.next().value).toEqual(take(POST_FILE_SUCCESS))
      })

      it('puts putConfigProjectSuccess', () => {
        const saga = putConfigProjectSaga()
        sagaNextN(saga, 1)
        saga.next(projectConfig)
        saga.next(itemsConfig)
        saga.next(predictionsConfig)
        saga.next(annotationsConfig)
        saga.next(projectConfig)
        saga.next(url)
        sagaNextN(saga, 1)
        saga.next({ success })
        sagaNextN(saga, 5)
        expect(saga.next().value).toEqual(put(putConfigProjectSuccess()))
      })
    })

    describe('failure', () => {
      const failure = { payload: { error: 'foo' } }

      it('puts postProjectFailure', () => {
        const saga = putConfigProjectSaga()
        sagaNextN(saga, 1)
        saga.next(projectConfig)
        saga.next(itemsConfig)
        saga.next(predictionsConfig)
        saga.next(annotationsConfig)
        saga.next(projectConfig)
        saga.next(url)
        sagaNextN(saga, 1)
        expect(saga.next({ failure }).value).toEqual(put(putConfigProjectFailure(failure.payload.error)))
      })
    })

    it('puts putConfigProjectFailure', () => {
      const saga = putConfigProjectSaga()
      sagaNextN(saga, 1)
      const err = new Error('error')
      expect(saga.throw(err).value).toEqual(put(putConfigProjectFailure(err)))
    })
  })

  describe('watchPostFile', () => {
    it('links to postFileSaga', () => {
      const saga = watchPostFile()
      expect(saga.next().value).toEqual(takeLatest(POST_FILE, postFileSaga))
    })
  })

  describe('postFileSaga', () => {
    const projectId = 'foo'
    const route = 'REACT_APP_PROJECT_ITEMS_UPLOAD'
    const type = 'foo'
    const file = 'foo'
    const isUpdate = true
    const transactionId = 'foo'
    const payload = { projectId, route, type, file, isUpdate, transactionId }
    const query = { isUpdate }
    const data = new FormData()
    data.append(type, file)
    const options = {
      method: 'POST',
      body: data,
      query,
    }
    const url = resolveApiUrl(route, { projectId })

    it('calls resolveApiUrl', () => {
      const saga = postFileSaga({ payload })
      expect(saga.next().value).toEqual(call(resolveApiUrl, route, { projectId }))
    })

    describe('if isUpdate is Boolean and true', () => {
      it('puts request', () => {
        const saga = postFileSaga({ payload })
        sagaNextN(saga, 1)
        expect(saga.next(url).value).toEqual(put(request(url, options, transactionId)))
      })
    })

    describe('if isUpdate is Boolean and false', () => {
      const newIsUpdate = false
      const newOptions = {
        method: 'POST',
        body: data,
        query: { isUpdate: newIsUpdate },
      }
      it('puts request', () => {
        const saga = postFileSaga({ payload: { ...payload, isUpdate: newIsUpdate } })
        sagaNextN(saga, 1)
        expect(saga.next(url).value).toEqual(put(request(url, newOptions, transactionId)))
      })
    })

    describe('if isUpdate is null', () => {
      const newIsUpdate = null
      const newOptions = {
        method: 'POST',
        body: data,
        query: {},
      }
      it('puts request', () => {
        const saga = postFileSaga({ payload: { ...payload, isUpdate: newIsUpdate } })
        sagaNextN(saga, 1)
        expect(saga.next(url).value).toEqual(put(request(url, newOptions, transactionId)))
      })
    })

    it('races post fetching result', () => {
      const saga = postFileSaga({ payload })
      sagaNextN(saga, 2)
      expect(saga.next().value).toEqual(
        race({
          success: expect.anything(),
          failure: expect.anything(),
        })
      )
    })

    describe('success', () => {
      it('puts postFileSuccess', () => {
        const success = { payload: { foo: 'foo' } }
        const saga = postFileSaga({ payload })
        sagaNextN(saga, 3)
        expect(saga.next({ success }).value).toEqual(put(postFileSuccess()))
      })
    })

    describe('failure', () => {
      it('puts postFileSuccess', () => {
        const failure = { payload: { error: 'foo' } }
        const saga = postFileSaga({ payload })
        sagaNextN(saga, 3)
        expect(saga.next({ failure }).value).toEqual(put(postFileFailure(failure.payload.error)))
      })
    })

    it('puts postFileFailure', () => {
      const saga = postFileSaga({ payload })
      sagaNextN(saga, 1)
      const err = new Error('error')
      expect(saga.throw(err).value).toEqual(put(postFileFailure(err)))
    })
  })

  describe('watchUpdateConfigProject', () => {
    it('links to updateConfigProjectSaga', () => {
      const saga = watchUpdateConfigProject()
      expect(saga.next().value).toEqual(takeLatest(UPDATE_CONFIG_PROJECT, updateConfigProjectSaga))
    })
  })

  describe('updateConfigProjectSaga', () => {
    let key = 'foo'
    const config = 'foo'
    let payload = { key, config }
    const oldConfig = 'bar'
    const newConfig = 'foo'
    const currentConfig = 'bar'

    it('selects selectConfigProject', () => {
      const saga = updateConfigProjectSaga({ payload })
      expect(saga.next().value).toEqual(select(selectConfigProject))
    })

    describe('if key different of PROJECT, FILE or LABELING', () => {
      it('calls mergeConfigService', () => {
        const saga = updateConfigProjectSaga({ payload })
        sagaNextN(saga, 1)
        expect(saga.next(oldConfig).value).toEqual(call(mergeConfigService, config, oldConfig))
      })

      it('puts updateConfigProjectSuccess', () => {
        const saga = updateConfigProjectSaga({ payload })
        sagaNextN(saga, 1)
        saga.next(oldConfig)
        expect(saga.next(newConfig).value).toEqual(put(updateConfigProjectSuccess(newConfig)))
      })
    })

    describe('if key === PROJECT', () => {
      beforeEach(() => {
        key = PROJECT
        payload = { key, config }
      })

      it('calls mapConfigProjectResponseService', () => {
        const saga = updateConfigProjectSaga({ payload })
        sagaNextN(saga, 1)
        expect(saga.next(oldConfig).value).toEqual(call(mapConfigProjectResponseService, { ...oldConfig, ...config }))
      })

      it('puts updateConfigProjectSuccess', () => {
        const saga = updateConfigProjectSaga({ payload })
        sagaNextN(saga, 1)
        saga.next(oldConfig)
        expect(saga.next(newConfig).value).toEqual(put(updateConfigProjectSuccess(newConfig)))
      })
    })

    describe('if key === FILE', () => {
      beforeEach(() => {
        key = FILE
        payload = { key, config }
      })

      it('calls mapUploadedConfigProjectResponseService', () => {
        const saga = updateConfigProjectSaga({ payload })
        sagaNextN(saga, 1)
        expect(saga.next(oldConfig).value).toEqual(call(mapConfigProjectResponseService, config))
      })

      it('calls mergeConfigService', () => {
        const saga = updateConfigProjectSaga({ payload })
        sagaNextN(saga, 1)
        saga.next(oldConfig)
        expect(saga.next(currentConfig).value).toEqual(call(mergeConfigService, currentConfig, oldConfig))
      })

      it('puts updateConfigProjectSuccess', () => {
        const saga = updateConfigProjectSaga({ payload })
        sagaNextN(saga, 1)
        saga.next(oldConfig)
        saga.next(currentConfig)
        expect(saga.next(newConfig).value).toEqual(put(updateConfigProjectSuccess(newConfig)))
      })
    })

    describe('if key === LABELING', () => {
      beforeEach(() => {
        key = LABELING
        payload = { key, config }
      })

      it('puts updateConfigProjectSuccess', () => {
        const saga = updateConfigProjectSaga({ payload })
        sagaNextN(saga, 1)
        expect(saga.next(newConfig).value).toEqual(put(updateConfigProjectSuccess(newConfig)))
      })
    })

    it('puts updateConfigProjectFailure', () => {
      const saga = updateConfigProjectSaga({ payload })
      sagaNextN(saga, 1)
      const err = new Error('error')
      expect(saga.throw(err).value).toEqual(put(updateConfigProjectFailure(err)))
    })
  })

  describe('watchExportCurrentConfig', () => {
    it('links to exportCurrentConfigSaga', () => {
      const saga = watchExportCurrentConfig()
      expect(saga.next().value).toEqual(takeLatest(EXPORT_CURRENT_CONFIG, exportCurrentConfigSaga))
    })
  })

  describe('exportCurrentConfigSaga', () => {
    const config = 'foo'

    it('select selectConfigProject', () => {
      const saga = exportCurrentConfigSaga()
      expect(saga.next().value).toEqual(select(selectConfigProject))
    })

    it('calls mapConfigProjectPostRequestService', () => {
      const saga = exportCurrentConfigSaga()
      sagaNextN(saga, 1)
      expect(saga.next(config).value).toEqual(call(mapConfigProjectPostRequestService, config))
    })

    it('returns result', () => {
      const saga = exportCurrentConfigSaga()
      sagaNextN(saga, 1)
      saga.next(config)
      expect(saga.next().value).toEqual(put(exportCurrentConfigSuccess()))
    })

    it('returns error', () => {
      const err = new Error('error')
      const saga = exportCurrentConfigSaga()
      sagaNextN(saga, 1)
      expect(saga.throw(err).value).toEqual(put(exportCurrentConfigFailure(err)))
    })
  })

  describe('watchExportConfig', () => {
    it('links to exportConfigSaga', () => {
      const saga = watchExportConfig()
      expect(saga.next().value).toEqual(takeLatest(EXPORT_CONFIG, exportConfigSaga))
    })
  })

  describe('exportConfigSaga', () => {
    const transactionId = 'export_project'
    const types = 'foo'
    const payload = { types }
    const projectId = 'foo'
    const projectName = 'bar'
    const options = { query: types, responseType: 'arraybuffer' }
    const url = resolveApiUrl('REACT_APP_PROJECT_EXPORT_ROUTE', { projectId })

    beforeEach(() => {
      globalHistory.location.pathname = `/edit_project/${projectId}/config`
      window.URL.createObjectURL = jest.fn()
    })

    it('selects projectName', () => {
      const saga = exportConfigSaga({ payload })
      expect(saga.next().value).toEqual(select(selectConfigProjectName))
    })

    it('calls resolveApiUrl', () => {
      const saga = exportConfigSaga({ payload })
      sagaNextN(saga, 1)
      expect(saga.next(projectName).value).toEqual(call(resolveApiUrl, 'REACT_APP_PROJECT_EXPORT_ROUTE', { projectId }))
    })

    it('puts requets', () => {
      const saga = exportConfigSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(projectName)
      expect(saga.next(url).value).toEqual(put(request(url, options, transactionId)))
    })

    it('races logs fetching result', () => {
      const saga = exportConfigSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(projectName)
      saga.next(url)
      expect(saga.next().value).toEqual(
        race({
          success: expect.anything(),
          failure: expect.anything(),
        })
      )
    })

    describe('success', () => {
      const success = { payload: { responseBody: 'foo' } }

      it('puts exportCurrentConfigFailure', () => {
        const saga = exportConfigSaga({ payload })
        sagaNextN(saga, 1)
        saga.next(projectName)
        saga.next(url)
        sagaNextN(saga, 1)
        expect(saga.next({ success }).value).toEqual(put(exportCurrentConfigSuccess()))
      })
    })

    describe('failure', () => {
      const failure = { payload: { error: 'foo' } }

      it('puts exportCurrentConfigFailure', () => {
        const saga = exportConfigSaga({ payload })
        sagaNextN(saga, 1)
        saga.next(projectName)
        saga.next(url)
        sagaNextN(saga, 1)
        expect(saga.next({ failure }).value).toEqual(put(exportCurrentConfigFailure(failure.payload.error)))
      })
    })

    it('returns error', () => {
      const err = new Error('error')
      const saga = exportConfigSaga({ payload })
      sagaNextN(saga, 1)
      expect(saga.throw(err).value).toEqual(put(exportCurrentConfigFailure(err)))
    })
  })

  it('forked sagas', () => {
    const saga = configurationProjectSagas()
    expect(saga.next().value).toEqual(fork(watchStartup))
    expect(saga.next().value).toEqual(fork(watchPostProject))
    expect(saga.next().value).toEqual(fork(watchPostFile))
    expect(saga.next().value).toEqual(fork(watchPutConfigProject))
    expect(saga.next().value).toEqual(fork(watchExportCurrentConfig))
    expect(saga.next().value).toEqual(fork(watchUpdateConfigProject))
    expect(saga.next().value).toEqual(fork(watchExportConfig))
  })
})
