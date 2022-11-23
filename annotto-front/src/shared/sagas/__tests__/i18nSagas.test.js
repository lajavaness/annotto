import { call, put, takeEvery } from 'redux-saga/effects'
import i18n from 'assets/locales'

import { FETCH_BUNDLE, fetchBundleFailure, fetchBundleSuccess } from '../../actions/i18nActions'

import { importModuleService } from '../../services/moduleServices'

import { fetchBundleSaga, watchFetchBundle } from '../i18nSagas'

describe('bundleSagas', () => {
	describe('watchFetchBundle', () => {
		it('links to fetchBundleSaga', () => {
			const saga = watchFetchBundle()
			expect(saga.next().value).toEqual(takeEvery(FETCH_BUNDLE, fetchBundleSaga))
		})
	})

	describe('fetchBundleSaga', () => {
		const language = 'en'
		const namespace = 'foo'

		beforeEach(() => {
			i18n.removeResourceBundle(language, namespace)
		})

		describe('With no language in payload', () => {
			const payload = { namespace }

			it('calls bundle import', () => {
				const saga = fetchBundleSaga({ payload })
				expect(saga.next().value).toEqual(call(importModuleService, `assets/locales/en/${payload.namespace}.json`))
			})

			it('returns result', () => {
				const saga = fetchBundleSaga({ payload })
				saga.next(language)
				const data = { foo: 'bar' }
				expect(i18n.hasResourceBundle(language, payload.namespace))
				expect(saga.next(data).value).toEqual(put(fetchBundleSuccess(payload.namespace, data)))
			})
		})

		describe('With language in payload', () => {
			const payload = {
				namespace,
				language,
			}

			it('calls bundle import', () => {
				const saga = fetchBundleSaga({ payload })
				expect(saga.next().value).toEqual(
					call(importModuleService, `assets/locales/${payload.language}/${payload.namespace}.json`)
				)
			})

			it('returns result', () => {
				const saga = fetchBundleSaga({ payload })
				saga.next()
				const data = { foo: 'bar' }
				expect(i18n.hasResourceBundle(payload.language, payload.namespace))
				expect(saga.next(data).value).toEqual(put(fetchBundleSuccess(payload.namespace, data)))
			})
		})

		it('stops execution', () => {
			i18n.addResourceBundle(language, namespace, { foo: 'bar' }, false, true)
			const saga = fetchBundleSaga({ payload: { language, namespace } })
			expect(saga.next().value).toEqual(put(fetchBundleSuccess(namespace, { foo: 'bar' })))
		})

		it('returns error', () => {
			const saga = fetchBundleSaga({ payload: { language, namespace } })
			saga.next()
			const err = new Error('error')
			expect(saga.throw(err).value).toEqual(put(fetchBundleFailure(namespace, err)))
		})
	})
})
