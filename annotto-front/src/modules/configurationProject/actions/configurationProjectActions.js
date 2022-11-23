export const STARTUP = 'configurationProject/startup'
export const STARTUP_SUCCESS = 'configurationProject/startupSuccess'
export const STARTUP_FAILURE = 'configurationProject/startupFailure'

export const POST_PROJECT = 'POST_PROJECT'
export const POST_PROJECT_SUCCESS = 'POST_PROJECT_SUCCESS'
export const POST_PROJECT_FAILURE = 'POST_PROJECT_FAILURE'

export const PUT_CONFIG_PROJECT = 'PUT_CONFIG_PROJECT'
export const PUT_CONFIG_PROJECT_SUCCESS = 'PUT_CONFIG_PROJECT_SUCCESS'
export const PUT_CONFIG_PROJECT_FAILURE = 'PUT_CONFIG_PROJECT_FAILURE'

export const UPDATE_CONFIG_PROJECT = 'UPDATE_CONFIG_PROJECT'
export const UPDATE_CONFIG_PROJECT_SUCCESS = 'UPDATE_CONFIG_PROJECT_SUCCESS'
export const UPDATE_CONFIG_PROJECT_FAILURE = 'UPDATE_CONFIG_PROJECT_FAILURE'

export const UPLOAD_ITEMS = 'UPLOAD_ITEMS'
export const UPLOAD_PREDICTIONS = 'UPLOAD_PREDICTIONS'
export const UPLOAD_ANNOTATIONS = 'UPLOAD_ANNOTATIONS'

export const POST_FILE = 'POST_FILE'
export const POST_FILE_SUCCESS = 'POST_FILE_SUCCESS'
export const POST_FILE_FAILURE = 'POST_FILE_FAILURE'

export const EXPORT_CURRENT_CONFIG = 'EXPORT_CURRENT_CONFIG'
export const EXPORT_CURRENT_CONFIG_SUCCESS = 'EXPORT_CURRENT_CONFIG_SUCCESS'
export const EXPORT_CURRENT_CONFIG_FAILURE = 'EXPORT_CURRENT_CONFIG_FAILURE'

export const EXPORT_CONFIG = 'EXPORT_CONFIG'
export const EXPORT_CONFIG_SUCCESS = 'EXPORT_CONFIG_SUCCESS'
export const EXPORT_CONFIG_FAILURE = 'EXPORT_CONFIG_FAILURE'

export const RESET_CONFIG = 'RESET_CONFIG'

export const startup = () => {
	return {
		type: STARTUP,
	}
}

export const startupSuccess = (project) => {
	return {
		type: STARTUP_SUCCESS,
		payload: { project },
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

export const postProject = () => ({
	type: POST_PROJECT,
})

export const postProjectSuccess = () => ({
	type: POST_PROJECT_SUCCESS,
})

export const postProjectFailure = (err) => ({
	type: POST_PROJECT_FAILURE,
	payload: {
		error: err,
		errorString: err && err.toString(),
	},
})

export const updateConfigProject = (key, config) => ({
	type: UPDATE_CONFIG_PROJECT,
	payload: {
		key,
		config,
	},
})

export const updateConfigProjectSuccess = (config) => ({
	type: UPDATE_CONFIG_PROJECT_SUCCESS,
	payload: {
		config,
	},
})

export const updateConfigProjectFailure = (err) => ({
	type: UPDATE_CONFIG_PROJECT_FAILURE,
	payload: {
		error: err,
		errorString: err && err.toString(),
	},
})

export const exportCurrentConfig = () => ({
	type: EXPORT_CURRENT_CONFIG,
})

export const exportCurrentConfigSuccess = () => ({
	type: EXPORT_CURRENT_CONFIG_SUCCESS,
})

export const exportCurrentConfigFailure = (err) => ({
	type: EXPORT_CURRENT_CONFIG_FAILURE,
	payload: {
		error: err,
		errorString: err && err.toString(),
	},
})

export const uploadItems = (file, isUpdate) => ({
	type: UPLOAD_ITEMS,
	payload: {
		file,
		isUpdate,
	},
})

export const uploadPredictions = (file) => ({
	type: UPLOAD_PREDICTIONS,
	payload: {
		file,
	},
})

export const uploadAnnotations = (file) => ({
	type: UPLOAD_ANNOTATIONS,
	payload: {
		file,
	},
})

export const postFile = (projectId, route, type, file, isUpdate, transactionId) => ({
	type: POST_FILE,
	payload: { projectId, route, type, file, isUpdate, transactionId },
})

export const postFileSuccess = () => ({
	type: POST_FILE_SUCCESS,
})

export const postFileFailure = (err) => ({
	type: POST_FILE_FAILURE,
	payload: {
		error: err,
		errorString: err && err.toString(),
	},
})

export const exportConfig = (types) => ({
	type: EXPORT_CONFIG,
	payload: {
		types,
	},
})

export const exportConfigSuccess = () => ({
	type: EXPORT_CONFIG_SUCCESS,
})

export const exportConfigFailure = (err) => ({
	type: EXPORT_CONFIG_FAILURE,
	payload: {
		error: err,
		errorString: err && err.toString(),
	},
})

export const resetConfig = () => ({
	type: RESET_CONFIG,
})

export const putConfigProject = () => ({
	type: PUT_CONFIG_PROJECT,
})

export const putConfigProjectSuccess = () => ({
	type: PUT_CONFIG_PROJECT_SUCCESS,
})

export const putConfigProjectFailure = (err) => ({
	type: PUT_CONFIG_PROJECT_FAILURE,
	payload: {
		error: err,
		errorString: err && err.toString(),
	},
})
