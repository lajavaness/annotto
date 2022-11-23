import {
	FETCH_LOGS,
	FETCH_LOGS_FAILURE,
	FETCH_LOGS_SUCCESS,
	POST_COMMENT,
	POST_COMMENT_FAILURE,
	POST_COMMENT_SUCCESS,
	fetchLogs,
	fetchLogsFailure,
	fetchLogsSuccess,
	postComment,
	postCommentFailure,
	postCommentSuccess,
} from 'shared/actions/logsActions'

describe('logsActions', () => {
	describe('fetchLogs', () => {
		it('returns type', () => {
			const { type } = fetchLogs()
			expect(type).toBe(FETCH_LOGS)
		})

		it('returns payload', () => {
			const projectId = 1
			const fetchLogsParams = ['Foo']
			const transactionId = 'foo'
			const { payload } = fetchLogs(projectId, fetchLogsParams, transactionId)
			expect(payload).toEqual({ projectId, fetchLogsParams, transactionId })
		})
	})

	describe('fetchLogsSuccess', () => {
		it('returns type', () => {
			const { type } = fetchLogsSuccess()
			expect(type).toBe(FETCH_LOGS_SUCCESS)
		})

		it('returns payload', () => {
			const logs = ['Foo']
			const { payload } = fetchLogsSuccess(logs)
			expect(payload).toEqual({ logs })
		})
	})

	describe('fetchLogsFailure', () => {
		it('returns type', () => {
			const { type } = fetchLogsFailure()
			expect(type).toBe(FETCH_LOGS_FAILURE)
		})

		it('returns payload', () => {
			const error = new Error('foo')
			const transactionId = 'bar'
			const { payload } = fetchLogsFailure(error, transactionId)
			expect(payload).toEqual({ error, errorString: error.toString(), transactionId })
		})
	})

	describe('postComment', () => {
		it('returns type', () => {
			const { type } = postComment()
			expect(type).toBe(POST_COMMENT)
		})

		it('returns payload', () => {
			const postCommentBody = ['Foo']
			const transactionId = 'foo'
			const projectId = 1
			const { payload } = postComment(postCommentBody, projectId, transactionId)
			expect(payload).toEqual({ postCommentBody, projectId, transactionId })
		})
	})

	describe('postCommentSuccess', () => {
		it('returns type', () => {
			const { type } = postCommentSuccess()
			expect(type).toBe(POST_COMMENT_SUCCESS)
		})

		it('returns payload', () => {
			const logs = ['Foo']
			const { payload } = postCommentSuccess(logs)
			expect(payload).toEqual({ logs })
		})
	})

	describe('postCommentFailure', () => {
		it('returns type', () => {
			const { type } = postCommentFailure()
			expect(type).toBe(POST_COMMENT_FAILURE)
		})

		it('returns payload', () => {
			const error = new Error('foo')
			const transactionId = 'bar'
			const { payload } = postCommentFailure(error, transactionId)
			expect(payload).toEqual({ error, errorString: error.toString(), transactionId })
		})
	})
})
