import { call, put, select, takeEvery } from 'redux-saga/effects'

import { REQUEST, requestFailure, requestSuccess } from 'shared/actions/apiActions'

import { requestSaga, watchRequest } from 'shared/sagas/apiSagas'

import { selectKeycloakInstance } from 'modules/root/selectors/authSelectors'

import { sagaNextN } from 'setupTests'

import { refreshTokenService } from 'modules/root/services/authServices'

import { logout } from 'modules/root/actions/rootActions'

import { requestService } from '../../services/apiServices'

describe('apiSagas', () => {
  const isTokenExpired = true
  const keyCloakInstance = (tokenExpired = isTokenExpired) => ({
    isTokenExpired: () => tokenExpired,
    token: 'fakeToken',
    updateToken: () => true,
  })
  describe('watchRequest', () => {
    it('links to requestSaga', () => {
      const saga = watchRequest()
      expect(saga.next().value).toEqual(takeEvery(REQUEST, requestSaga))
    })
  })

  describe('requestSaga', () => {
    const payload = { requestUrl: 'foo', requestOptions: 'bar', transactionId: 'expirationDate' }

    it('selects keycloak instance', () => {
      const saga = requestSaga({ payload })
      expect(saga.next(keyCloakInstance).value).toEqual(select(selectKeycloakInstance))
    })

    it('checks if keycloak token is expired', () => {
      const saga = requestSaga({ payload })
      saga.next()
      expect(saga.next(keyCloakInstance(true)).value).toEqual(true)
    })

    describe('if token is expired', () => {
      it('calls refresh access token service', () => {
        const saga = requestSaga({ payload })
        saga.next()
        saga.next(keyCloakInstance(true))
        expect(JSON.stringify(saga.next(true).value)).toEqual(
          JSON.stringify(call(refreshTokenService, keyCloakInstance(true)))
        )
      })

      it('logs user out if refresh token is also expired', () => {
        const saga = requestSaga({ payload })
        saga.next()
        saga.next(keyCloakInstance(true))
        saga.next(keyCloakInstance(true))
        const err = new Error('error')
        expect(saga.throw(err).value).toEqual(put(logout()))
      })
    })

    it('calls requestService', () => {
      const saga = requestSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(keyCloakInstance(true))
      expect(saga.next().value).toEqual(
        call(requestService, payload.requestUrl, payload.requestOptions, keyCloakInstance().token)
      )
    })

    it('returns result', () => {
      const body = 'body'
      const status = 200
      const headers = 'headers'
      const saga = requestSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(keyCloakInstance())
      saga.next()
      expect(saga.next({ body, status, headers }).value).toEqual(
        put(requestSuccess(body, status, headers, payload.transactionId))
      )
    })

    it('returns error', () => {
      const saga = requestSaga({ payload })
      saga.next()
      const err = new Error('error')
      expect(saga.throw(err).value).toEqual(put(requestFailure(err, payload.transactionId)))
    })
  })
})
