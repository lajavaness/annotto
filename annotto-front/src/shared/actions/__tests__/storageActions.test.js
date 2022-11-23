import {
	GET_FROM_STORAGE,
	GET_FROM_STORAGE_FAILURE,
	GET_FROM_STORAGE_SUCCESS,
	SET_TO_STORAGE,
	SET_TO_STORAGE_FAILURE,
	SET_TO_STORAGE_SUCCESS,
	getFromStorage,
	getFromStorageFailure,
	getFromStorageSuccess,
	setToStorage,
	setToStorageFailure,
	setToStorageSuccess,
} from '../storageActions'

describe('storageActions', () => {
	describe('setToStorage', () => {
		it('returns type', () => {
			const { type } = setToStorage()
			expect(type).toBe(SET_TO_STORAGE)
		})

		it('returns payload', () => {
			const id = 'foo'
			const key = 'bar'
			const value = 'gag'
			const { payload } = setToStorage(id, key, value)
			expect(payload).toEqual({ transactionId: id, resourceKey: key, resourceValue: value })
		})
	})

	describe('setToStorageSuccess', () => {
		it('returns type', () => {
			const { type } = setToStorageSuccess()
			expect(type).toBe(SET_TO_STORAGE_SUCCESS)
		})

		it('returns payload', () => {
			const id = 'foo'
			const { payload } = setToStorageSuccess(id)
			expect(payload).toEqual({ transactionId: id })
		})
	})

	describe('setToStorageFailure', () => {
		it('returns type', () => {
			const { type } = setToStorageFailure()
			expect(type).toBe(SET_TO_STORAGE_FAILURE)
		})

		it('returns payload', () => {
			const id = 'foo'
			const error = new Error('foo')
			const { payload } = setToStorageFailure(id, error)
			expect(payload).toEqual({ transactionId: id, error, errorString: error.toString() })
		})
	})

	describe('getFromStorage', () => {
		it('returns type', () => {
			const { type } = getFromStorage()
			expect(type).toBe(GET_FROM_STORAGE)
		})

		it('returns payload', () => {
			const id = 'foo'
			const key = 'bar'
			const { payload } = getFromStorage(id, key)
			expect(payload).toEqual({ transactionId: id, resourceKey: key })
		})
	})

	describe('getFromStorageSuccess', () => {
		it('returns type', () => {
			const { type } = getFromStorageSuccess()
			expect(type).toBe(GET_FROM_STORAGE_SUCCESS)
		})

		it('returns payload', () => {
			const id = 'foo'
			const data = 'bar'
			const { payload } = getFromStorageSuccess(id, data)
			expect(payload).toEqual({ transactionId: id, resourceData: data })
		})
	})

	describe('getFromStorageFailure', () => {
		it('returns type', () => {
			const { type } = getFromStorageFailure()
			expect(type).toBe(GET_FROM_STORAGE_FAILURE)
		})

		it('returns payload', () => {
			const id = 'foo'
			const error = new Error('foo')
			const { payload } = getFromStorageFailure(id, error)
			expect(payload).toEqual({ transactionId: id, error, errorString: error.toString() })
		})
	})
})
