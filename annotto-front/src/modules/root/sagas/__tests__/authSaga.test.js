import { call, put, select, take } from 'redux-saga/effects'

import { FETCH_USERS_SUCCESS, fetchUsers, logoutSuccess } from 'modules/root/actions/rootActions'

import { loginSuccess } from 'modules/root/actions/authActions'

import { sagaNextN } from 'setupTests'

import { loginSaga, logoutSaga } from 'modules/root/sagas/authSaga'

import { getUserInfoService, initService, logoutService } from 'modules/root/services/authServices'
import { selectKeycloakInstance } from 'modules/root/selectors/authSelectors'

describe('authSaga', () => {
	const fakeUser = {
		email: 'user@lajavaness.com',
		firstName: 'John',
		lastName: 'Doe',
		profile: {
			email: 'user@lajavaness.com',
			roles: ['admin'],
		},
	}
	const keyCloakInstance = { loadUserInfo: () => ({ user: fakeUser }), token: 'fakeToken', logout: () => null }

	describe('loginSaga', () => {
		it('calls keycloak initService', () => {
			const saga = loginSaga()
			expect(saga.next().value).toEqual(call(initService))
		})

		it('calls getUserInfoService', () => {
			const saga = loginSaga()
			sagaNextN(saga, 1)
			expect(saga.next(keyCloakInstance).value).toEqual(call(getUserInfoService, keyCloakInstance))
		})

		it('puts loging success', () => {
			const saga = loginSaga()
			sagaNextN(saga, 1)
			saga.next(keyCloakInstance)
			expect(saga.next(fakeUser).value).toEqual(put(loginSuccess(fakeUser, keyCloakInstance)))
		})

		describe('if keycloak is initiated', () => {
			it('put fetch users', () => {
				const saga = loginSaga()
				sagaNextN(saga, 1)
				saga.next(keyCloakInstance)
				saga.next()
				expect(saga.next().value).toEqual(put(fetchUsers()))
			})

			it('takes FETCH_USERS_SUCCESS', () => {
				const saga = loginSaga()
				sagaNextN(saga, 1)
				saga.next(keyCloakInstance)
				sagaNextN(saga, 2)
				expect(saga.next().value).toEqual(take(FETCH_USERS_SUCCESS))
			})
		})
	})
	describe('logout saga', () => {
		it('select keycloak instance', () => {
			const saga = logoutSaga()
			expect(saga.next().value).toEqual(select(selectKeycloakInstance))
		})

		it('call keycloak logout function', () => {
			const saga = logoutSaga()
			saga.next(keyCloakInstance)
			expect(saga.next(keyCloakInstance).value).toEqual(call(logoutService, keyCloakInstance))
		})

		it('put logout success', () => {
			const saga = logoutSaga()
			saga.next(keyCloakInstance)
			saga.next()
			expect(saga.next().value).toEqual(put(logoutSuccess()))
		})
	})
})
