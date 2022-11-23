import { call, put, takeEvery } from 'redux-saga/effects'

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

import {
	getFromStorageSaga,
	removeToStorageSaga,
	setToStorageSaga,
	watchGetFromStorage,
	watchRemoveToStorage,
	watchSetToStorage,
} from '../storageSagas'

describe('storageSagas', () => {
	describe('watchGetFromStorage', () => {
		it('links to getFromStorageSaga', () => {
			const saga = watchGetFromStorage()
			expect(saga.next().value).toEqual(takeEvery(GET_FROM_STORAGE, getFromStorageSaga))
		})
	})

	describe('getFromStorageSaga', () => {
		const payload = {
			transactionId: 'foo',
			resourceKey: 'bar',
		}

		it('calls service', () => {
			const saga = getFromStorageSaga({ payload })
			expect(saga.next().value).toEqual(call(getFromStorageService, payload.resourceKey))
		})

		it('returns result', () => {
			const saga = getFromStorageSaga({ payload })
			saga.next()
			const data = 'foo'
			expect(saga.next(data).value).toEqual(put(getFromStorageSuccess(payload.transactionId, data)))
		})

		it('returns error', () => {
			const saga = getFromStorageSaga({ payload })
			saga.next()
			const err = new Error('error')
			expect(saga.throw(err).value).toEqual(put(getFromStorageFailure(payload.transactionId, err)))
		})
	})

	describe('watchSetToStorage', () => {
		it('links to setToStorageSaga', () => {
			const saga = watchSetToStorage()
			expect(saga.next().value).toEqual(takeEvery(SET_TO_STORAGE, setToStorageSaga))
		})
	})

	describe('setToStorageSaga', () => {
		const payload = {
			transactionId: 'foo',
			resourceKey: 'bar',
			resourceValue: 'gag',
		}

		it('calls service', () => {
			const saga = setToStorageSaga({ payload })
			expect(saga.next().value).toEqual(call(setToStorageService, payload.resourceKey, payload.resourceValue))
		})

		it('returns result', () => {
			const saga = setToStorageSaga({ payload })
			saga.next()
			expect(saga.next().value).toEqual(put(setToStorageSuccess(payload.transactionId)))
		})

		it('returns error', () => {
			const saga = setToStorageSaga({ payload })
			saga.next()
			const err = new Error('error')
			expect(saga.throw(err).value).toEqual(put(setToStorageFailure(payload.transactionId, err)))
		})
	})

	describe('watchRemoveToStorage', () => {
		it('links to removeToStorageSaga', () => {
			const saga = watchRemoveToStorage()
			expect(saga.next().value).toEqual(takeEvery(REMOVE_TO_STORAGE, removeToStorageSaga))
		})
	})

	describe('removeToStorageSaga', () => {
		const payload = {
			resourceId: 'foo',
			resourceKey: 'bar',
		}

		it('calls service', () => {
			const saga = removeToStorageSaga({ payload })
			expect(saga.next().value).toEqual(call(removeToStorageService, payload.resourceKey))
		})

		it('returns result', () => {
			const saga = removeToStorageSaga({ payload })
			saga.next()
			expect(saga.next().value).toEqual(put(removeToStorageSuccess(payload.resourceId)))
		})

		it('returns error', () => {
			const saga = removeToStorageSaga({ payload })
			saga.next()
			const err = new Error('error')
			expect(saga.throw(err).value).toEqual(put(removeToStorageFailure(payload.resourceId, err)))
		})
	})
})
