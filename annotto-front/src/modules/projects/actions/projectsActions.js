export const STARTUP = 'projects/startup'
export const STARTUP_SUCCESS = 'projects/startupSuccess'
export const STARTUP_FAILURE = 'projects/startupFailure'

export const FETCH_PROJECTS = 'FETCH_PROJECTS'
export const FETCH_PROJECTS_SUCCESS = 'FETCH_PROJECTS_SUCCESS'
export const FETCH_PROJECTS_FAILURE = 'FETCH_PROJECTS_FAILURE'

export const startup = () => {
	return {
		type: STARTUP,
	}
}

export const startupSuccess = () => {
	return {
		type: STARTUP_SUCCESS,
	}
}

export const startupFailure = (err) => {
	return {
		type: STARTUP_FAILURE,
		payload: {
			error: err,
			errorString: err && err.toString(),
		},
	}
}

export const fetchProjects = (index, limit) => ({
	type: FETCH_PROJECTS,
	payload: {
		index,
		limit,
	},
})

export const fetchProjectsSuccess = (projects) => ({
	type: FETCH_PROJECTS_SUCCESS,
	payload: {
		projects,
	},
})

export const fetchProjectsFailure = (err) => ({
	type: FETCH_PROJECTS_FAILURE,
	payload: {
		error: err,
		errorString: err && err.toString(),
	},
})
