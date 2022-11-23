import { call, fork, put, take, takeLatest } from 'redux-saga/effects'

import { FETCH_BUNDLE_SUCCESS, fetchBundle } from 'shared/actions/i18nActions'
import { FETCH_CLIENTS_SUCCESS, fetchClients } from 'modules/root/actions/rootActions'
import {
	FETCH_PROJECTS,
	FETCH_PROJECTS_SUCCESS,
	STARTUP,
	fetchProjects,
	fetchProjectsFailure,
	fetchProjectsSuccess,
	startupFailure,
	startupSuccess,
} from 'modules/projects/actions/projectsActions'
import { REQUEST_SUCCESS, request } from 'shared/actions/apiActions'

import { PROJECTS_SIZE } from 'shared/enums/projectsTypes'

import { resolveApiUrl } from 'shared/utils/urlUtils'

export function* watchStartup() {
	yield takeLatest(STARTUP, startupSaga)
}

export function* startupSaga() {
	try {
		yield put(fetchBundle('projects'))
		yield take(({ type, payload }) => type === FETCH_BUNDLE_SUCCESS && payload.namespace === 'projects')

		yield put(fetchProjects(0, PROJECTS_SIZE))
		yield take(FETCH_PROJECTS_SUCCESS)

		yield put(fetchClients())
		yield take(FETCH_CLIENTS_SUCCESS)

		yield put(startupSuccess())
	} catch (err) {
		yield put(startupFailure(err))
	}
}

export function* watchFetchProjects() {
	yield takeLatest(FETCH_PROJECTS, fetchProjectsSaga)
}

export function* fetchProjectsSaga({ payload }) {
	try {
		const transactionId = 'fetch_project'
		const url = yield call(resolveApiUrl, 'REACT_APP_PROJECTS_ROUTE')

		const options = {
			query: {
				index: payload.index || 0,
				limit: payload.limit || PROJECTS_SIZE,
			},
		}

		yield put(request(url, options, transactionId))

		const {
			payload: {
				responseBody: { data, index, total, limit, pageCount },
			},
		} = yield take(({ type, payload }) => type === REQUEST_SUCCESS && payload.transactionId === transactionId)

		yield put(fetchProjectsSuccess({ data: [...data], total, index, limit, pageCount }))
	} catch (err) {
		yield put(fetchProjectsFailure(err))
	}
}

export default function* projectSagas() {
	yield fork(watchStartup)
	yield fork(watchFetchProjects)
}
