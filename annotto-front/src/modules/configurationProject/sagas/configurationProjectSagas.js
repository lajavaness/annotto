import { call, fork, put, race, select, take, takeLatest } from 'redux-saga/effects'
import { globalHistory, navigate } from '@reach/router'
import { isBoolean } from 'lodash'
import { match } from '@reach/router/lib/utils'
import dayjs from 'dayjs'

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
import { FETCH_BUNDLE_SUCCESS, fetchBundle } from 'shared/actions/i18nActions'
import { FETCH_PROJECT_FAILURE, FETCH_PROJECT_SUCCESS, fetchProject } from 'modules/root/actions/rootActions'
import { REQUEST_FAILURE, REQUEST_SUCCESS, request } from 'shared/actions/apiActions'

import {
	selectConfigAnnotations,
	selectConfigItems,
	selectConfigPredictions,
	selectConfigProject,
	selectConfigProjectName,
} from 'modules/configurationProject/selectors/configurationProjectSelectors'

import {
	ANNOTATIONS,
	FILE,
	ITEMS,
	LABELING,
	PREDICTIONS,
	PROJECT,
} from 'shared/enums/configurationsProjectPropertiesTypes'

import {
	mapConfigProjectPostRequestService,
	mapConfigProjectResponseService,
	mergeConfigService,
} from 'modules/configurationProject/services/configurationProjectServices'

import { initialState } from 'modules/configurationProject/reducers/configurationProjectReducer'
import { resolveApiUrl } from 'shared/utils/urlUtils'

export function* watchStartup() {
	yield takeLatest(STARTUP, startupSaga)
}

export function* startupSaga() {
	try {
		let project = initialState?.config?.project

		yield put(fetchBundle('configurationProject'))
		yield take(({ type, payload }) => type === FETCH_BUNDLE_SUCCESS && payload.namespace === 'configurationProject')

		const isEdit = !!match('/edit_project/:projectId/*', globalHistory.location.pathname)

		if (isEdit) {
			const projectId = globalHistory.location.pathname.split('/')[2]

			yield put(fetchProject(projectId))

			const { success, failure } = yield race({
				success: take(({ type }) => type === FETCH_PROJECT_SUCCESS),
				failure: take(({ type }) => type === FETCH_PROJECT_FAILURE),
			})

			if (success) {
				project = yield call(mapConfigProjectResponseService, success.payload.project)
			} else {
				yield call(navigate, '/')
				throw failure.payload.error
			}
		}

		yield put(startupSuccess(project))
	} catch (err) {
		yield put(startupFailure(err))
	}
}

export function* watchPostProject() {
	yield takeLatest(POST_PROJECT, postProjectSaga)
}

export function* postProjectSaga() {
	try {
		const transactionId = 'post_project'
		let projectConfig = yield select(selectConfigProject)
		const itemsConfig = yield select(selectConfigItems)
		const predictionsConfig = yield select(selectConfigPredictions)
		const annotationsConfig = yield select(selectConfigAnnotations)

		projectConfig = yield call(mapConfigProjectPostRequestService, projectConfig)

		const configFile = new File([new Blob([JSON.stringify(projectConfig)])], 'config.json', {
			type: 'text/json;charset=utf-8',
			lastModified: new Date(),
		})

		const data = new FormData()
		data.append(PROJECT, configFile)
		data.append(ITEMS, itemsConfig?.file)

		if (predictionsConfig) {
			data.append(PREDICTIONS, predictionsConfig)
		}

		if (annotationsConfig) {
			data.append(ANNOTATIONS, annotationsConfig)
		}

		const url = yield call(resolveApiUrl, 'REACT_APP_POST_PROJECT_ROUTE')

		const options = {
			method: 'POST',
			mimeType: 'multipart/form-data',
			body: data,
		}

		yield put(request(url, options, transactionId))

		const { success, failure } = yield race({
			success: take(({ type, payload }) => type === REQUEST_SUCCESS && payload.transactionId === transactionId),
			failure: take(({ type, payload }) => type === REQUEST_FAILURE && payload.transactionId === transactionId),
		})

		if (success) {
			yield call(navigate, `/project/${success?.payload?.responseBody?.project?._id}`)
			yield put(postProjectSuccess())
		} else {
			yield put(postProjectFailure(failure.payload.error))
		}
	} catch (err) {
		yield put(postProjectFailure(err))
	}
}

export function* watchPutConfigProject() {
	yield takeLatest(PUT_CONFIG_PROJECT, putConfigProjectSaga)
}

export function* putConfigProjectSaga() {
	try {
		const transactionId = 'put_project'
		const projectId = globalHistory.location.pathname.split('/')[2]

		let projectConfig = yield select(selectConfigProject)
		const itemsConfig = yield select(selectConfigItems)
		const predictionsConfig = yield select(selectConfigPredictions)
		const annotationsConfig = yield select(selectConfigAnnotations)

		projectConfig = yield call(mapConfigProjectPostRequestService, projectConfig)

		const url = yield call(resolveApiUrl, 'REACT_APP_PROJECT_ROUTE', { projectId })

		const options = {
			method: 'PUT',
			body: projectConfig,
		}

		yield put(request(url, options, transactionId))
		const { success, failure } = yield race({
			success: take(({ type, payload }) => type === REQUEST_SUCCESS && payload.transactionId === transactionId),
			failure: take(({ type, payload }) => type === REQUEST_FAILURE && payload.transactionId === transactionId),
		})

		if (success) {
			if (itemsConfig?.file) {
				yield put(
					postFile(
						projectId,
						'REACT_APP_PROJECT_ITEMS_UPLOAD',
						ITEMS,
						itemsConfig.file,
						itemsConfig.isUpdate,
						`${transactionId}_${ITEMS}`
					)
				)
				yield take(POST_FILE_SUCCESS)
			}

			if (predictionsConfig) {
				yield put(
					postFile(
						projectId,
						'REACT_APP_PROJECT_PREDICTIONS_UPLOAD',
						PREDICTIONS,
						predictionsConfig,
						null,
						`${transactionId}_${PREDICTIONS}`
					)
				)
				yield take(POST_FILE_SUCCESS)
			}

			if (annotationsConfig) {
				yield put(
					postFile(
						projectId,
						'REACT_APP_PROJECT_ANNOTATIONS_UPLOAD',
						ANNOTATIONS,
						annotationsConfig,
						null,
						`${transactionId}_${ANNOTATIONS}`
					)
				)
				yield take(POST_FILE_SUCCESS)
			}

			yield put(putConfigProjectSuccess())
		} else {
			yield put(putConfigProjectFailure(failure.payload.error))
		}
	} catch (err) {
		yield put(putConfigProjectFailure(err))
	}
}

export function* watchPostFile() {
	yield takeLatest(POST_FILE, postFileSaga)
}

export function* postFileSaga({ payload }) {
	try {
		const { projectId, route, type, file, isUpdate, transactionId } = payload

		const url = yield call(resolveApiUrl, route, { projectId })
		let query = {}

		const data = new FormData()
		data.append(type, file)

		if (isBoolean(isUpdate)) {
			query = { isUpdate }
		}

		const options = {
			method: 'POST',
			body: data,
			query,
		}
		yield put(request(url, options, transactionId))

		const { success, failure } = yield race({
			success: take(({ type, payload }) => type === REQUEST_SUCCESS && payload.transactionId === transactionId),
			failure: take(({ type, payload }) => type === REQUEST_FAILURE && payload.transactionId === transactionId),
		})
		if (success) {
			yield put(postFileSuccess())
		} else {
			yield put(postFileFailure(failure.payload.error))
		}
	} catch (err) {
		yield put(postFileFailure(err))
	}
}

export function* watchUpdateConfigProject() {
	yield takeLatest(UPDATE_CONFIG_PROJECT, updateConfigProjectSaga)
}

export function* updateConfigProjectSaga({ payload }) {
	try {
		const { key, config } = payload

		const oldConfig = yield select(selectConfigProject)

		let newConfig

		if (key === PROJECT) {
			newConfig = yield call(mapConfigProjectResponseService, { ...oldConfig, ...config })
		} else if (key === FILE) {
			const currentConfig = yield call(mapConfigProjectResponseService, config)
			newConfig = yield call(mergeConfigService, currentConfig, oldConfig)
		} else if (key === LABELING) {
			newConfig = config
		} else {
			newConfig = yield call(mergeConfigService, config, oldConfig)
		}

		yield put(updateConfigProjectSuccess(newConfig))
	} catch (err) {
		yield put(updateConfigProjectFailure(err))
	}
}

export function* watchExportCurrentConfig() {
	yield takeLatest(EXPORT_CURRENT_CONFIG, exportCurrentConfigSaga)
}

export function* exportCurrentConfigSaga() {
	try {
		let config = yield select(selectConfigProject)

		config = yield call(mapConfigProjectPostRequestService, config)

		const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(config))
		const exportFileDefaultName = `config_${dayjs(Date.now()).format('YYYY-MM-DDTHH:mm:ssZ[Z]')}.json`
		const linkElement = document.createElement('a')

		linkElement.setAttribute('href', dataUri)
		linkElement.setAttribute('download', exportFileDefaultName)
		linkElement.click()

		yield put(exportCurrentConfigSuccess())
	} catch (err) {
		yield put(exportCurrentConfigFailure(err))
	}
}

export function* watchExportConfig() {
	yield takeLatest(EXPORT_CONFIG, exportConfigSaga)
}

export function* exportConfigSaga({ payload }) {
	try {
		const transactionId = 'export_project'
		const { types } = payload
		const projectId = globalHistory.location.pathname.split('/')[2]
		const projectName = yield select(selectConfigProjectName)
		const options = { query: types, responseType: 'arraybuffer' }

		const url = yield call(resolveApiUrl, 'REACT_APP_PROJECT_EXPORT_ROUTE', { projectId })

		yield put(request(url, options, transactionId))
		const { success, failure } = yield race({
			success: take(({ type, payload }) => type === REQUEST_SUCCESS && payload.transactionId === transactionId),
			failure: take(({ type, payload }) => type === REQUEST_FAILURE && payload.transactionId === transactionId),
		})

		if (success) {
			const data = success.payload?.responseBody

			const exportFileName = `export-${projectName}-${dayjs(Date.now()).format('YYYY-MM-DDTHH:mm:ssZ[Z]')}.zip`

			const a = document.createElement('a')
			const blob = new Blob([data], {
				type: 'application/octet-stream',
			})
			a.href = window.URL.createObjectURL(blob)
			a.download = exportFileName
			a.click()
			yield put(exportCurrentConfigSuccess())
		} else {
			yield put(exportCurrentConfigFailure(failure.payload.error))
		}
	} catch (err) {
		yield put(exportCurrentConfigFailure(err))
	}
}

export default function* configurationProjectSagas() {
	yield fork(watchStartup)
	yield fork(watchPostProject)
	yield fork(watchPostFile)
	yield fork(watchPutConfigProject)
	yield fork(watchExportCurrentConfig)
	yield fork(watchUpdateConfigProject)
	yield fork(watchExportConfig)
}
