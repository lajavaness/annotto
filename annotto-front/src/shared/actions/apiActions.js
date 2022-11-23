export const REQUEST = 'api/request'
export const REQUEST_SUCCESS = 'api/requestSuccess'
export const REQUEST_FAILURE = 'api/requestFailure'

export const request = (requestUrl, requestOptions = null, transactionId = null) => ({
	type: REQUEST,
	payload: {
		requestUrl,
		requestOptions,
		transactionId,
	},
})

export const requestSuccess = (responseBody, responseStatus, responseHeaders, transactionId = null) => ({
	type: REQUEST_SUCCESS,
	payload: {
		responseBody,
		responseStatus,
		responseHeaders,
		transactionId,
	},
})

export const requestFailure = (err, transactionId = null) => ({
	type: REQUEST_FAILURE,
	payload: {
		error: err,
		errorString: err && err.toString(),
		transactionId,
	},
})
