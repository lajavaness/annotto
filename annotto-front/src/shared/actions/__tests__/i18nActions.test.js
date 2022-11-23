import {
	FETCH_BUNDLE,
	FETCH_BUNDLE_FAILURE,
	FETCH_BUNDLE_SUCCESS,
	fetchBundle,
	fetchBundleFailure,
	fetchBundleSuccess,
} from '../i18nActions'

describe('bundleActions', () => {
	describe('fetchBundle', () => {
		it('returns type', () => {
			const { type } = fetchBundle()
			expect(type).toBe(FETCH_BUNDLE)
		})

		it('returns payload', () => {
			const namespace = 'foo'
			const language = 'en'
			const { payload } = fetchBundle(namespace, language)
			expect(payload).toEqual({ namespace, language })
		})
	})

	describe('fetchBundleSuccess', () => {
		it('returns type', () => {
			const { type } = fetchBundleSuccess()
			expect(type).toBe(FETCH_BUNDLE_SUCCESS)
		})

		it('returns payload', () => {
			const namespace = 'foo'
			const data = 'bar'
			const { payload } = fetchBundleSuccess(namespace, data)
			expect(payload).toEqual({ namespace, bundleData: data })
		})
	})

	describe('fetchBundleFailure', () => {
		it('returns type', () => {
			const { type } = fetchBundleFailure()
			expect(type).toBe(FETCH_BUNDLE_FAILURE)
		})

		it('returns payload', () => {
			const namespace = 'foo'
			const error = new Error('foo')
			const { payload } = fetchBundleFailure(namespace, error)
			expect(payload).toEqual({ namespace, error, errorString: error.toString() })
		})
	})
})
