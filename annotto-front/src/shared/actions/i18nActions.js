export const FETCH_BUNDLE = 'i18n/fetchBundle'
export const FETCH_BUNDLE_SUCCESS = 'i18n/fetchBundleSuccess'
export const FETCH_BUNDLE_FAILURE = 'i18n/fetchBundleFailure'

export const fetchBundle = (namespace, language) => ({
	type: FETCH_BUNDLE,
	payload: {
		namespace,
		language,
	},
})

export const fetchBundleSuccess = (namespace, bundleData) => ({
	type: FETCH_BUNDLE_SUCCESS,
	payload: {
		namespace,
		bundleData,
	},
})

export const fetchBundleFailure = (namespace, err) => ({
	type: FETCH_BUNDLE_FAILURE,
	payload: {
		namespace,
		error: err,
		errorString: err && err.toString(),
	},
})
