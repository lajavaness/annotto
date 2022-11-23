export const FETCH_LOGS = 'FETCH_LOGS'
export const FETCH_LOGS_SUCCESS = 'FETCH_LOGS_SUCCESS'
export const FETCH_LOGS_FAILURE = 'FETCH_LOGS_FAILURE'

export const POST_COMMENT = 'POST_COMMENT'
export const POST_COMMENT_SUCCESS = 'POST_COMMENT_SUCCESS'
export const POST_COMMENT_FAILURE = 'POST_COMMENT_FAILURE'

export const fetchLogs = (projectId, fetchLogsParams, transactionId) => ({
	type: FETCH_LOGS,
	payload: { fetchLogsParams, projectId, transactionId },
})

export const fetchLogsSuccess = (logs) => ({
	type: FETCH_LOGS_SUCCESS,
	payload: { logs },
})

export const fetchLogsFailure = (err, transactionId) => ({
	type: FETCH_LOGS_FAILURE,
	payload: {
		error: err,
		errorString: err && err.toString(),
		transactionId,
	},
})

export const postComment = (postCommentBody, projectId, transactionId) => ({
	type: POST_COMMENT,
	payload: { postCommentBody, projectId, transactionId },
})

export const postCommentSuccess = (logs) => ({
	type: POST_COMMENT_SUCCESS,
	payload: { logs },
})

export const postCommentFailure = (err, transactionId) => ({
	type: POST_COMMENT_FAILURE,
	payload: {
		error: err,
		errorString: err && err.toString(),
		transactionId,
	},
})
