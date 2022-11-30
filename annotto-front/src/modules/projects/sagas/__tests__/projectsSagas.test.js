import { call, put, take, takeLatest } from 'redux-saga/effects'
import { noop } from 'lodash'

import { sagaNextN } from 'setupTests'

import { FETCH_CLIENTS_SUCCESS, fetchClients } from 'modules/root/actions/rootActions'
import {
  FETCH_PROJECTS,
  FETCH_PROJECTS_SUCCESS,
  STARTUP,
  fetchProjects,
  fetchProjectsFailure,
  fetchProjectsSuccess,
  startupFailure,
  startupSuccess,
} from 'modules/projects/actions/projectsActions'
import { fetchBundle } from 'shared/actions/i18nActions'
import { request } from 'shared/actions/apiActions'

import { fetchProjectsSaga, startupSaga, watchFetchProjects, watchStartup } from 'modules/projects/sagas/projectsSagas'

import { PROJECTS_SIZE } from 'shared/enums/projectsTypes'

import { resolveApiUrl } from 'shared/utils/urlUtils'

describe('projectsSagas', () => {
  describe('startupSaga', () => {
    const namespace = 'projects'

    it('puts bundle fetching', () => {
      const saga = startupSaga()
      expect(saga.next().value).toEqual(put(fetchBundle(namespace)))
    })

    it('takes bundle fetching result', () => {
      const saga = startupSaga()
      sagaNextN(saga, 1)
      expect(saga.next().value).toMatchObject({ type: 'TAKE' })
    })

    it('puts fetchProjects', () => {
      const saga = startupSaga()
      sagaNextN(saga, 2)
      expect(saga.next().value).toEqual(put(fetchProjects(0, PROJECTS_SIZE)))
    })

    it('takes FETCH_PROJECTS_SUCCESS', () => {
      const saga = startupSaga()
      sagaNextN(saga, 3)
      expect(saga.next().value).toEqual(take(FETCH_PROJECTS_SUCCESS))
    })
    it('puts fetchClients', () => {
      const saga = startupSaga()
      sagaNextN(saga, 4)
      expect(saga.next().value).toEqual(put(fetchClients()))
    })

    it('takes FETCH_CLIENTS_SUCCESS', () => {
      const saga = startupSaga()
      sagaNextN(saga, 5)
      expect(saga.next().value).toEqual(take(FETCH_CLIENTS_SUCCESS))
    })

    it('puts success', () => {
      const saga = startupSaga()
      sagaNextN(saga, 6)
      expect(saga.next().value).toEqual(put(startupSuccess()))
    })

    it('puts fetchProjectsFailure', () => {
      const saga = startupSaga()
      sagaNextN(saga, 1)
      const err = new Error('error')
      expect(saga.throw(err).value).toEqual(put(startupFailure(err)))
    })
  })

  describe('watchStartup', () => {
    it('links to startupSaga', () => {
      const saga = watchStartup()
      expect(saga.next().value).toEqual(takeLatest(STARTUP, startupSaga))
    })
  })

  describe('watchFetchProjects', () => {
    it('links to fetchProjectsSaga', () => {
      const saga = watchFetchProjects()
      expect(saga.next().value).toEqual(takeLatest(FETCH_PROJECTS, fetchProjectsSaga))
    })
  })

  describe('fetchProjectsSaga', () => {
    const payload = { index: 0, limit: PROJECTS_SIZE }
    const responseBody = {
      data: [
        { id: 1, foo: 'foo' },
        { id: 2, foo: 'foo2' },
      ],
      index: 0,
      total: 20,
      limit: 10,
      pageCount: 1,
    }
    const transactionId = 'fetch_project'
    const url = resolveApiUrl('REACT_APP_PROJECTS_ROUTE')

    it('calls resolveApiUrl', () => {
      const saga = fetchProjectsSaga({ payload })
      expect(saga.next().value).toEqual(call(resolveApiUrl, 'REACT_APP_PROJECTS_ROUTE'))
    })

    it('puts request', () => {
      const options = {
        query: {
          index: payload.index,
          limit: payload.limit,
        },
      }

      const saga = fetchProjectsSaga({ payload })
      sagaNextN(saga, 1)
      expect(saga.next(url).value).toEqual(put(request(url, options, transactionId)))
    })

    it('takes items fetching result', () => {
      const saga = fetchProjectsSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(url)
      expect(JSON.stringify(saga.next().value)).toEqual(JSON.stringify(take(noop)))
    })

    it('puts fetchProjectsSuccess', () => {
      const saga = fetchProjectsSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(url)
      sagaNextN(saga, 1)
      expect(saga.next({ payload: { responseBody } }).value).toEqual(put(fetchProjectsSuccess(responseBody)))
    })

    it('puts fetchProjectsFailure', () => {
      const saga = fetchProjectsSaga({ payload })
      sagaNextN(saga, 1)
      const err = new Error('error')
      expect(saga.throw(err).value).toEqual(put(fetchProjectsFailure(err)))
    })
  })
})
