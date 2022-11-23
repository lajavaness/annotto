import { call, fork, put, select, takeEvery } from 'redux-saga/effects'

import { REQUEST, requestFailure, requestSuccess } from 'shared/actions/apiActions'

import { requestService } from 'shared/services/apiServices'

import { refreshTokenService } from 'modules/root/services/authServices'

import { selectKeycloakInstance } from 'modules/root/selectors/authSelectors'

import { logout } from 'modules/root/actions/rootActions'

export function* watchRequest() {
	yield takeEvery(REQUEST, requestSaga)
}

export function* requestSaga({ payload }) {
	const { transactionId } = payload
	try {
		const { requestUrl, requestOptions } = payload

		const keyCloakInstance = yield select(selectKeycloakInstance)

		const isTokenExpired = yield keyCloakInstance.isTokenExpired()

		if (isTokenExpired) {
			try {
				yield call(refreshTokenService, keyCloakInstance)
			} catch {
				yield put(logout())
			}
		}

		try {
			const { body, status, headers } = yield call(requestService, requestUrl, requestOptions, keyCloakInstance.token)
			yield put(requestSuccess(body, status, headers, transactionId))
		} catch (err) {
			yield put(requestFailure(err, transactionId))
		}
	} catch (err) {
		if (!err.isCancel) yield put(requestFailure(err, transactionId))
	}
}

export default function* apiSaga() {
	yield fork(watchRequest)
}
