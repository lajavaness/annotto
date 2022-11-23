export const FETCH_PROJECT_FILTER = 'FETCH_PROJECT_FILTER'
export const FETCH_PROJECT_FILTER_SUCCESS = 'FETCH_PROJECT_FILTER_SUCCESS'
export const FETCH_PROJECT_FILTER_FAILURE = 'FETCH_PROJECT_FILTER_FAILURE'

export const POST_PROJECT_FILTER = 'POST_PROJECT_FILTER'
export const POST_PROJECT_FILTER_SUCCESS = 'POST_PROJECT_FILTER_SUCCESS'
export const POST_PROJECT_FILTER_FAILURE = 'POST_PROJECT_FILTER_FAILURE'

export const FETCH_PROJECT_FILTER_OPERATORS = 'FETCH_PROJECT_FILTER_OPERATORS'
export const FETCH_PROJECT_FILTER_OPERATORS_SUCCESS = 'FETCH_PROJECT_FILTER_OPERATORS_SUCCESS'
export const FETCH_PROJECT_FILTER_OPERATORS_FAILURE = 'FETCH_PROJECT_FILTER_OPERATORS_FAILURE'

export const fetchProjectFilter = (projectId) => ({
	type: FETCH_PROJECT_FILTER,
	payload: { projectId },
})

export const fetchProjectFilterSuccess = (filter) => ({
	type: FETCH_PROJECT_FILTER_SUCCESS,
	payload: { filter },
})

export const fetchProjectFilterFailure = (err) => ({
	type: FETCH_PROJECT_FILTER_FAILURE,
	payload: {
		error: err,
		errorString: err && err.toString(),
	},
})

export const postProjectFilter = (projectId, filters) => ({
	type: POST_PROJECT_FILTER,
	payload: { projectId, filters },
})

export const postProjectFilterSuccess = (filter) => ({
	type: POST_PROJECT_FILTER_SUCCESS,
	payload: { filter },
})

export const postProjectFilterFailure = (err) => ({
	type: POST_PROJECT_FILTER_FAILURE,
	payload: {
		error: err,
		errorString: err && err.toString(),
	},
})

export const fetchProjectFilterOperators = (projectId) => ({
	type: FETCH_PROJECT_FILTER_OPERATORS,
	payload: { projectId },
})

export const fetchProjectFilterOperatorsSuccess = (operators) => ({
	type: FETCH_PROJECT_FILTER_OPERATORS_SUCCESS,
	payload: { operators },
})

export const fetchProjectFilterOperatorsFailure = (err) => ({
	type: FETCH_PROJECT_FILTER_OPERATORS_FAILURE,
	payload: {
		error: err,
		errorString: err && err.toString(),
	},
})
