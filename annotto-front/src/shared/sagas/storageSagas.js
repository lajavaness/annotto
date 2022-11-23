import { call, fork, put, takeEvery } from 'redux-saga/effects'

import {
	GET_FROM_STORAGE,
	REMOVE_TO_STORAGE,
	SET_TO_STORAGE,
	getFromStorageFailure,
	getFromStorageSuccess,
	removeToStorageFailure,
	removeToStorageSuccess,
	setToStorageFailure,
	setToStorageSuccess,
} from 'shared/actions/storageActions'

import { getFromStorageService, removeToStorageService, setToStorageService } from 'shared/services/storageServices'

export function* watchGetFromStorage() {
	yield takeEvery(GET_FROM_STORAGE, getFromStorageSaga)
}

export function* getFromStorageSaga({ payload }) {
	const { transactionId } = payload
	try {
		const { resourceKey } = payload

		const resourceData = yield call(getFromStorageService, resourceKey)

		yield put(getFromStorageSuccess(transactionId, resourceData))
	} catch (err) {
		yield put(getFromStorageFailure(transactionId, err))
	}
}

export function* watchSetToStorage() {
	yield takeEvery(SET_TO_STORAGE, setToStorageSaga)
}

export function* setToStorageSaga({ payload }) {
	const { transactionId } = payload
	try {
		const { resourceKey, resourceValue } = payload

		yield call(setToStorageService, resourceKey, resourceValue)
		yield put(setToStorageSuccess(transactionId))
	} catch (err) {
		yield put(setToStorageFailure(transactionId, err))
	}
}

export function* watchRemoveToStorage() {
	yield takeEvery(REMOVE_TO_STORAGE, removeToStorageSaga)
}

export function* removeToStorageSaga({ payload }) {
	const { resourceId } = payload
	try {
		const { resourceKey } = payload

		yield call(removeToStorageService, resourceKey)

		yield put(removeToStorageSuccess(resourceId))
	} catch (err) {
		yield put(removeToStorageFailure(resourceId, err))
	}
}

export default function* storageSaga() {
	yield fork(watchSetToStorage)
	yield fork(watchGetFromStorage)
	yield fork(watchRemoveToStorage)
}
