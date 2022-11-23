export const SET_TO_STORAGE = 'storage/setToStorage'
export const SET_TO_STORAGE_SUCCESS = 'storage/setToStorageSuccess'
export const SET_TO_STORAGE_FAILURE = 'storage/setToStorageFailure'

export const GET_FROM_STORAGE = 'storage/getFromStorage'
export const GET_FROM_STORAGE_SUCCESS = 'storage/getFromStorageSuccess'
export const GET_FROM_STORAGE_FAILURE = 'storage/getFromStorageFailure'

export const REMOVE_TO_STORAGE = 'storage/removeToStorage'
export const REMOVE_TO_STORAGE_SUCCESS = 'storage/removeToStorageSuccess'
export const REMOVE_TO_STORAGE_FAILURE = 'storage/removeToStorageFailure'

export const setToStorage = (transactionId, resourceKey, resourceValue) => ({
	type: SET_TO_STORAGE,
	payload: {
		transactionId,
		resourceKey,
		resourceValue,
	},
})

export const setToStorageSuccess = (transactionId) => ({
	type: SET_TO_STORAGE_SUCCESS,
	payload: {
		transactionId,
	},
})

export const setToStorageFailure = (transactionId, err) => ({
	type: SET_TO_STORAGE_FAILURE,
	payload: {
		transactionId,
		error: err,
		errorString: err && err.toString(),
	},
})

export const getFromStorage = (transactionId, resourceKey) => ({
	type: GET_FROM_STORAGE,
	payload: {
		transactionId,
		resourceKey,
	},
})

export const getFromStorageSuccess = (transactionId, resourceData) => ({
	type: GET_FROM_STORAGE_SUCCESS,
	payload: {
		transactionId,
		resourceData,
	},
})

export const getFromStorageFailure = (transactionId, err) => ({
	type: GET_FROM_STORAGE_FAILURE,
	payload: {
		transactionId,
		error: err,
		errorString: err && err.toString(),
	},
})

export const removeToStorage = (resourceId, resourceKey) => ({
	type: REMOVE_TO_STORAGE,
	payload: {
		resourceId,
		resourceKey,
	},
})

export const removeToStorageSuccess = (resourceId) => ({
	type: REMOVE_TO_STORAGE_SUCCESS,
	payload: {
		resourceId,
	},
})

export const removeToStorageFailure = (resourceId, err) => ({
	type: REMOVE_TO_STORAGE_FAILURE,
	payload: {
		resourceId,
		error: err,
		errorString: err && err.toString(),
	},
})
