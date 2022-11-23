import { call, fork, put, race, take, takeLatest } from 'redux-saga/effects'

import { FETCH_BUNDLE_SUCCESS, fetchBundle } from 'shared/actions/i18nActions'
import {
	FETCH_CLIENTS,
	FETCH_PROJECT,
	FETCH_USERS,
	STARTUP,
	fetchClientsFailure,
	fetchClientsSuccess,
	fetchProjectFailure,
	fetchProjectSuccess,
	fetchUsersFailure,
	fetchUsersSuccess,
	startupFailure,
	startupSuccess,
} from 'modules/root/actions/rootActions'
import { LOGIN_SUCCESS, LOGOUT_SUCCESS, login, logout } from 'modules/root/actions/authActions'
import { REQUEST_FAILURE, REQUEST_SUCCESS, request } from 'shared/actions/apiActions'

import { resolveApiUrl } from 'shared/utils/urlUtils'

function* watchStartup() {
	yield takeLatest(STARTUP, startupSaga)
}

export function* startupSaga() {
	try {
		yield put(fetchBundle('root'))
		yield take(({ type, payload }) => type === FETCH_BUNDLE_SUCCESS && payload.namespace === 'root')
		yield put(login())
		yield take(LOGIN_SUCCESS)

		yield put(startupSuccess())
	} catch (err) {
		yield put(logout())
		yield take(LOGOUT_SUCCESS)

		yield put(startupFailure(err))
	}
}

export function* watchFetchClients() {
	yield takeLatest(FETCH_CLIENTS, fetchClientsSaga)
}

export function* fetchClientsSaga({ payload }) {
	try {
		const url = resolveApiUrl('REACT_APP_CLIENTS_ROUTE')

		yield put(request(url, { query: { name: payload?.query } }, 'clients'))

		const { success, failure } = yield race({
			success: take(({ type, payload }) => type === REQUEST_SUCCESS && payload.transactionId === 'clients'),
			failure: take(({ type, payload }) => type === REQUEST_FAILURE && payload.transactionId === 'clients'),
		})

		if (success) {
			yield put(fetchClientsSuccess(success.payload?.responseBody))
		} else {
			yield put(fetchClientsFailure(failure.payload?.error))
		}
	} catch (err) {
		yield put(fetchClientsFailure(err))
	}
}

export function* watchFetchProject() {
	yield takeLatest(FETCH_PROJECT, fetchProjectSaga)
}

export function* fetchProjectSaga({ payload }) {
	try {
		const transactionId = 'project'
		const { projectId } = payload

		const url = yield call(resolveApiUrl, 'REACT_APP_PROJECT_ROUTE', { projectId })

		yield put(request(url, null, transactionId))
		const { success, failure } = yield race({
			success: take(({ type, payload }) => type === REQUEST_SUCCESS && payload.transactionId === transactionId),
			failure: take(({ type, payload }) => type === REQUEST_FAILURE && payload.transactionId === transactionId),
		})

		if (success) {
			yield put(fetchProjectSuccess(success?.payload?.responseBody))
		} else {
			yield put(fetchProjectFailure(failure.payload.error))
		}
	} catch (err) {
		yield put(fetchProjectFailure(err))
	}
}

export function* watchFetchUsers() {
	yield takeLatest(FETCH_USERS, fetchUsersSaga)
}

export function* fetchUsersSaga() {
	try {
		const url = yield call(resolveApiUrl, 'REACT_APP_USERS_ROUTE')

		yield put(request(url, null, 'users'))

		const { success, failure } = yield race({
			success: take(({ type, payload }) => type === REQUEST_SUCCESS && payload.transactionId === 'users'),
			failure: take(({ type, payload }) => type === REQUEST_FAILURE && payload.transactionId === 'users'),
		})

		if (success) {
			yield put(fetchUsersSuccess(success.payload?.responseBody))
		} else {
			yield put(fetchUsersFailure(failure.payload?.error))
		}
	} catch (err) {
		yield put(fetchUsersFailure(err))
	}
}

export default function* rootSaga() {
	yield fork(watchStartup)
	yield fork(watchFetchClients)
	yield fork(watchFetchProject)
	yield fork(watchFetchUsers)
}
