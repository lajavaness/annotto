import { call, put, race, takeEvery } from 'redux-saga/effects'

import { sagaNextN } from 'setupTests'

import {
	FETCH_LOGS,
	POST_COMMENT,
	fetchLogsFailure,
	fetchLogsSuccess,
	postCommentFailure,
	postCommentSuccess,
} from 'shared/actions/logsActions'
import { request } from 'shared/actions/apiActions'

import { fetchLogsSaga, postCommentSaga, watchFetchLogs, watchPostComment } from 'shared/sagas/logsSagas'

import { resolveApiUrl } from 'shared/utils/urlUtils'

describe('logsSagas', () => {
	describe('watchFetchLogs', () => {
		it('links to fetchLogsSaga', () => {
			const saga = watchFetchLogs()
			expect(saga.next().value).toEqual(takeEvery(FETCH_LOGS, fetchLogsSaga))
		})
	})

	describe('fetchLogsSaga', () => {
		const payload = { projectId: 1, fetchLogsParams: 'bar', transactionId: 'foo' }
		const projectId = 1
		const url = '/foo'
		const options = {
			query: {
				limit: 0,
				index: 0,
				...payload.fetchLogsParams,
			},
		}

		it('calls resolveApiUrl', () => {
			const saga = fetchLogsSaga({ payload })
			expect(saga.next().value).toEqual(call(resolveApiUrl, 'REACT_APP_LOGS_ROUTE', { projectId }))
		})

		it('puts requestService', () => {
			const saga = fetchLogsSaga({ payload })
			sagaNextN(saga, 1)
			expect(saga.next(url).value).toEqual(put(request(url, options, payload.transactionId)))
		})

		it('races logs fetching result', () => {
			const saga = fetchLogsSaga({ payload })
			sagaNextN(saga, 1)
			saga.next(url)
			expect(saga.next().value).toEqual(
				race({
					success: expect.anything(),
					failure: expect.anything(),
				})
			)
		})

		describe('Success fetch logs', () => {
			const data = { success: { payload: { responseBody: 'foo' } } }

			it('returns fetchLogsFailure', () => {
				const saga = fetchLogsSaga({ payload })
				sagaNextN(saga, 1)
				saga.next(url)
				sagaNextN(saga, 1)
				expect(saga.next(data).value).toEqual(put(fetchLogsSuccess('foo')))
			})
		})

		describe('Failure fetch logs', () => {
			it('returns fetchLogsFailure', () => {
				const data = { failure: { payload: { error: 'foo' } } }
				const saga = fetchLogsSaga({ payload })
				sagaNextN(saga, 1)
				saga.next(url)
				sagaNextN(saga, 1)
				expect(saga.next(data).value).toEqual(put(fetchLogsFailure('foo', payload.transactionId)))
			})
		})

		it('returns fetchLogsFailure', () => {
			const saga = fetchLogsSaga({ payload })
			sagaNextN(saga, 1)
			const err = new Error('error')
			expect(saga.throw(err).value).toEqual(put(fetchLogsFailure(err, payload.transactionId)))
		})
	})

	describe('watchPostComment', () => {
		it('links to postCommentSaga', () => {
			const saga = watchPostComment()
			expect(saga.next().value).toEqual(takeEvery(POST_COMMENT, postCommentSaga))
		})
	})

	describe('postCommentSaga', () => {
		const payload = { postCommentBody: 'bar', transactionId: 'foo', projectId: 1 }
		const projectId = 1
		const url = '/foo'
		const options = {
			method: 'POST',
			body: payload.postCommentBody,
		}

		it('calls resolveApiUrl', () => {
			const saga = postCommentSaga({ payload })
			expect(saga.next().value).toEqual(call(resolveApiUrl, 'REACT_APP_COMMENTS_ROUTE', { projectId }))
		})

		it('puts requestService', () => {
			const saga = postCommentSaga({ payload })
			sagaNextN(saga, 1)
			expect(saga.next(url).value).toEqual(put(request(url, options, payload.transactionId)))
		})

		it('races logs fetching result', () => {
			const saga = postCommentSaga({ payload })
			sagaNextN(saga, 1)
			saga.next(url)
			expect(saga.next().value).toEqual(
				race({
					success: expect.anything(),
					failure: expect.anything(),
				})
			)
		})

		describe('Success fetch logs', () => {
			const data = { success: { payload: { responseBody: 'foo' } } }

			it('returns postCommentFailure', () => {
				const saga = postCommentSaga({ payload })
				sagaNextN(saga, 1)
				saga.next(url)
				sagaNextN(saga, 1)
				expect(saga.next(data).value).toEqual(put(postCommentSuccess('foo')))
			})
		})

		describe('Failure fetch logs', () => {
			it('returns postCommentFailure', () => {
				const data = { failure: { payload: { error: 'foo' } } }
				const saga = postCommentSaga({ payload })
				sagaNextN(saga, 1)
				saga.next(url)
				sagaNextN(saga, 1)
				expect(saga.next(data).value).toEqual(put(postCommentFailure('foo', payload.transactionId)))
			})
		})

		it('returns postCommentFailure', () => {
			const saga = postCommentSaga({ payload })
			sagaNextN(saga, 1)
			const err = new Error('error')
			expect(saga.throw(err).value).toEqual(put(postCommentFailure(err, payload.transactionId)))
		})
	})
})
