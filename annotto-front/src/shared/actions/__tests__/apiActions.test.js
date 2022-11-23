import { REQUEST, REQUEST_FAILURE, REQUEST_SUCCESS, request, requestFailure, requestSuccess } from '../apiActions'

describe('apiActions', () => {
	describe('request', () => {
		it('returns type', () => {
			const { type } = request()
			expect(type).toBe(REQUEST)
		})

		it('returns payload', () => {
			const requestUrl = '/auth'
			const requestOptions = null
			const transactionId = 'auth'
			const { payload } = request(requestUrl, requestOptions, transactionId)
			expect(payload).toEqual({ requestUrl, requestOptions, transactionId })
		})
	})

	describe('requestSuccess', () => {
		it('returns type', () => {
			const { type } = requestSuccess()
			expect(type).toBe(REQUEST_SUCCESS)
		})

		it('returns payload', () => {
			const responseBody = { data: 'foo' }
			const responseStatus = 200
			const responseHeaders = 'bar'
			const transactionId = 'auth'
			const { payload } = requestSuccess(responseBody, responseStatus, responseHeaders, transactionId)
			expect(payload).toEqual({ responseBody, responseStatus, responseHeaders, transactionId })
		})
	})

	describe('requestFailure', () => {
		it('returns type', () => {
			const { type } = requestFailure()
			expect(type).toBe(REQUEST_FAILURE)
		})

		it('returns payload', () => {
			const transactionId = 'foo'
			const error = new Error('foo')
			const { payload } = requestFailure(error, transactionId)
			expect(payload).toEqual({ transactionId, error, errorString: error.toString() })
		})
	})
})
