import { call, put, race, takeLatest } from 'redux-saga/effects'

import {
  FETCH_CLIENTS,
  FETCH_USERS,
  fetchClientsFailure,
  fetchClientsSuccess,
  fetchUsersFailure,
  fetchUsersSuccess,
  startupSuccess,
} from 'modules/root/actions/rootActions'
import { fetchBundle } from 'shared/actions/i18nActions'
import { login } from 'modules/root/actions/authActions'
import { request } from 'shared/actions/apiActions'

import {
  fetchClientsSaga,
  fetchUsersSaga,
  startupSaga,
  watchFetchClients,
  watchFetchUsers,
} from 'modules/root/sagas/rootSaga'

import { resolveApiUrl } from 'shared/utils/urlUtils'

import { sagaNextN } from 'setupTests'

describe('rootSaga', () => {
  describe('startupSaga', () => {
    const mockDate = new Date('14 Oct 2020')
    beforeAll(() => {
      global.Date = jest.fn().mockImplementation(() => mockDate)
    })

    const namespace = 'root'

    it('puts bundle fetching', () => {
      const saga = startupSaga()
      expect(saga.next().value).toEqual(put(fetchBundle(namespace)))
    })

    it('takes bundle fetching result', () => {
      const saga = startupSaga()
      sagaNextN(saga, 1)
      expect(saga.next().value).toMatchObject({ type: 'TAKE' })
    })

    it('puts loging', () => {
      const saga = startupSaga()
      sagaNextN(saga, 2)
      expect(saga.next().value).toEqual(put(login()))
    })

    it('takes loging result', () => {
      const saga = startupSaga()
      sagaNextN(saga, 3)
      expect(saga.next().value).toMatchObject({ type: 'TAKE' })
    })

    it('puts startup success', () => {
      const saga = startupSaga()
      sagaNextN(saga, 4)
      expect(saga.next().value).toEqual(put(startupSuccess()))
    })
  })

  describe('watchFetchClients', () => {
    it('links to fetchClientSaga', () => {
      const saga = watchFetchClients()
      expect(saga.next().value).toEqual(takeLatest(FETCH_CLIENTS, fetchClientsSaga))
    })
  })

  describe('fetchClientsSaga', () => {
    const payload = { query: 'foo' }

    it('puts clients fetching', () => {
      const saga = fetchClientsSaga({ payload })
      expect(saga.next().value).toEqual(
        put(request(resolveApiUrl('REACT_APP_CLIENTS_ROUTE'), { query: { name: 'foo' } }, 'clients'))
      )
    })

    it('races clients fetching result', () => {
      const saga = fetchClientsSaga({ payload })
      saga.next()
      expect(saga.next().value).toEqual(
        race({
          success: expect.anything(),
          failure: expect.anything(),
        })
      )
    })

    describe('Success fetch clients', () => {
      it('returns result', () => {
        const saga = fetchClientsSaga({ payload })
        sagaNextN(saga, 2)
        expect(saga.next({ success: { payload: { responseBody: 'bar' } } }).value).toEqual(
          put(fetchClientsSuccess('bar'))
        )
      })
    })

    describe('Failure fetch clients', () => {
      it('returns result', () => {
        const saga = fetchClientsSaga({ payload })
        sagaNextN(saga, 2)
        const data = { failure: { payload: { error: 'foo' } } }
        expect(saga.next(data).value).toEqual(put(fetchClientsFailure('foo')))
      })
    })

    it('returns error', () => {
      const saga = fetchClientsSaga({ payload })
      saga.next()
      const err = new Error('error')
      expect(saga.throw(err).value).toEqual(put(fetchClientsFailure(err)))
    })
  })

  describe('watchFetchUsers', () => {
    it('links to fetchUserSaga', () => {
      const saga = watchFetchUsers()
      expect(saga.next().value).toEqual(takeLatest(FETCH_USERS, fetchUsersSaga))
    })
  })

  describe('fetchUsersSaga', () => {
    it('call resolves URL functions', () => {
      const saga = fetchUsersSaga()
      expect(saga.next().value).toEqual(call(resolveApiUrl, 'REACT_APP_USERS_ROUTE'))
    })

    it('requests users url', () => {
      const saga = fetchUsersSaga()
      const url = '/users'
      saga.next()
      expect(saga.next(url).value).toEqual(put(request(url, null, 'users')))
    })

    it('races users fetching result', () => {
      const saga = fetchUsersSaga()
      sagaNextN(saga, 2)

      expect(saga.next().value).toEqual(
        race({
          success: expect.anything(),
          failure: expect.anything(),
        })
      )
    })

    describe('Success fetch users', () => {
      it('returns success result', () => {
        const saga = fetchUsersSaga()
        sagaNextN(saga, 3)
        expect(saga.next({ success: { payload: { responseBody: 'foo' } } }).value).toEqual(
          put(fetchUsersSuccess('foo'))
        )
      })
    })

    describe('Failure fetch clients', () => {
      it('returns failure result', () => {
        const saga = fetchUsersSaga()
        sagaNextN(saga, 3)
        const data = { failure: { payload: { error: 'foo' } } }
        expect(saga.next(data).value).toEqual(put(fetchUsersFailure('foo')))
      })
    })

    it('returns error', () => {
      const saga = fetchUsersSaga()
      saga.next()
      const err = new Error('error')
      expect(saga.throw(err).value).toEqual(put(fetchUsersFailure(err)))
    })
  })
})
