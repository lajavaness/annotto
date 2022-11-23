import { call, fork, put, select, take, takeLatest } from 'redux-saga/effects'

import {
	LOGIN,
	LOGOUT,
	loginFailure,
	loginSuccess,
	logoutFailure,
	logoutSuccess,
} from 'modules/root/actions/authActions'

import { getUserInfoService, initService, logoutService } from 'modules/root/services/authServices'

import { selectKeycloakInstance } from 'modules/root/selectors/authSelectors'

import { FETCH_USERS_SUCCESS, fetchUsers } from 'modules/root/actions/rootActions'

export function* watchLogin() {
	yield takeLatest(LOGIN, loginSaga)
}

export function* loginSaga() {
	try {
		const keycloak = yield call(initService)
		const userInfo = yield call(getUserInfoService, keycloak)
		yield put(loginSuccess(userInfo, keycloak))

		if (!!keycloak) {
			yield put(fetchUsers())
			yield take(FETCH_USERS_SUCCESS)
		}
	} catch (err) {
		yield put(loginFailure(err))
	}
}

export function* watchLogout() {
	yield takeLatest(LOGOUT, logoutSaga)
}

export function* logoutSaga() {
	try {
		const keyCloakInstance = yield select(selectKeycloakInstance)
		yield call(logoutService, keyCloakInstance)
		yield put(logoutSuccess())
	} catch (err) {
		yield put(logoutFailure(err))
	}
}

export default function* authSaga() {
	yield fork(watchLogin)
	yield fork(watchLogout)
}
