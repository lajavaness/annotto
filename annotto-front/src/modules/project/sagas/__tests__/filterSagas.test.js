import { call, put, race, select, takeLatest } from 'redux-saga/effects'

import { sagaNextN } from 'setupTests'

import { resolveApiUrl } from 'shared/utils/urlUtils'

import {
  fetchProjectFilterOperatorsSaga,
  fetchProjectFilterSaga,
  postProjectFilterSaga,
  watchFetchProjectFilter,
  watchFetchProjectFilterOperators,
  watchPostProjectFilter,
} from 'modules/project/sagas/filterSagas'

import {
  FETCH_PROJECT_FILTER,
  FETCH_PROJECT_FILTER_OPERATORS,
  POST_PROJECT_FILTER,
  fetchProjectFilterFailure,
  fetchProjectFilterOperatorsFailure,
  fetchProjectFilterOperatorsSuccess,
  fetchProjectFilterSuccess,
  postProjectFilterFailure,
  postProjectFilterSuccess,
} from 'modules/project/actions/filterActions'
import { fetchProjectItems } from 'modules/project/actions/projectActions'
import { request } from 'shared/actions/apiActions'

import {
  mapFilterRequestService,
  mapFilterResponseService,
  mapOperatorResponseService,
} from 'modules/project/services/projectServices'

import { selectProjectFilterId } from 'modules/project/selectors/projectSelectors'

import { PROJECT_ITEMS_SIZE } from 'shared/enums/paginationTypes'

describe('watchFetchProjectFilter', () => {
  it('links to fetchProjectFilterSaga', () => {
    const saga = watchFetchProjectFilter()
    expect(saga.next().value).toEqual(takeLatest(FETCH_PROJECT_FILTER, fetchProjectFilterSaga))
  })
})

describe('fetchProjectFilterSaga', () => {
  const projectId = 'project_filter'
  const payload = { projectId }
  const responseBody = {
    payload: [
      { id: 1, foo: 'foo' },
      { id: 2, foo: 'foo2' },
    ],
  }
  const transactionId = 'project_filter'
  const url = resolveApiUrl('REACT_APP_PROJECT_FILTER_ROUTE', { projectId })

  it('calls resolveApiUrl', () => {
    const saga = fetchProjectFilterSaga({ payload })
    expect(saga.next().value).toEqual(call(resolveApiUrl, 'REACT_APP_PROJECT_FILTER_ROUTE', { projectId }))
  })

  it('puts request', () => {
    const saga = fetchProjectFilterSaga({ payload })
    sagaNextN(saga, 1)
    expect(saga.next(url).value).toEqual(put(request(url, null, transactionId)))
  })

  it('races put fetching result', () => {
    const saga = fetchProjectFilterSaga({ payload })
    sagaNextN(saga, 1)
    saga.next(url)
    expect(saga.next().value).toEqual(
      race({
        success: expect.anything(),
        failure: expect.anything(),
      })
    )
  })

  describe('success', () => {
    const data = { success: { payload: { responseBody } } }

    it('call mapFilterResponseService', () => {
      const saga = fetchProjectFilterSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(url)
      sagaNextN(saga, 1)
      expect(saga.next(data).value).toEqual(call(mapFilterResponseService, responseBody))
    })

    it('puts fetchProjectFilterSuccess', () => {
      const saga = fetchProjectFilterSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(url)
      sagaNextN(saga, 1)
      saga.next(data)
      expect(saga.next().value).toEqual(put(fetchProjectFilterSuccess()))
    })
  })

  describe('failure', () => {
    const data = { failure: { payload: { error: 'foo' } } }

    it('put fetchProjectFilterFailure', () => {
      const saga = fetchProjectFilterSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(url)
      sagaNextN(saga, 1)
      expect(saga.next(data).value).toEqual(put(fetchProjectFilterFailure(data.failure.payload.error)))
    })
  })

  it('puts fetchProjectFilterFailure', () => {
    const saga = fetchProjectFilterSaga({ payload })
    sagaNextN(saga, 1)
    const err = new Error('error')
    expect(saga.throw(err).value).toEqual(put(fetchProjectFilterFailure(err)))
  })
})

describe('watchPostProjectFilter', () => {
  it('links to postProjectFilterSaga', () => {
    const saga = watchPostProjectFilter()
    expect(saga.next().value).toEqual(takeLatest(POST_PROJECT_FILTER, postProjectFilterSaga))
  })
})

describe('postProjectFilterSaga', () => {
  const projectId = 'foo'
  const filters = 'foo'
  const payload = { projectId, filters }
  const responseBody = {
    payload: [
      { id: 1, foo: 'foo' },
      { id: 2, foo: 'foo2' },
    ],
  }
  const transactionId = 'project_filter'
  const url = resolveApiUrl('REACT_APP_PROJECT_FILTER_ROUTE', { projectId })

  it('select filterId', () => {
    const saga = postProjectFilterSaga({ payload })
    expect(saga.next().value).toEqual(select(selectProjectFilterId))
  })

  it('calls resolveApiUrl', () => {
    const saga = postProjectFilterSaga({ payload })
    sagaNextN(saga, 1)
    expect(saga.next().value).toEqual(call(resolveApiUrl, 'REACT_APP_PROJECT_FILTER_ROUTE', { projectId }))
  })

  it('calls mapFilterRequestService', () => {
    const saga = postProjectFilterSaga({ payload })
    sagaNextN(saga, 2)
    expect(saga.next(filters).value).toEqual(call(mapFilterRequestService, filters))
  })

  describe("post filter if filter doesn't exist", () => {
    it('puts request', () => {
      const body = '1'
      const method = 'PUT'
      const filterId = 1
      const saga = postProjectFilterSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(filterId)
      saga.next(url)
      expect(saga.next(body).value).toEqual(put(request(url, { body, method }, transactionId)))
    })
  })

  it('puts request', () => {
    const body = '1'
    const method = 'POST'
    const saga = postProjectFilterSaga({ payload })
    sagaNextN(saga, 2)
    saga.next(url)
    expect(saga.next(body).value).toEqual(put(request(url, { body, method }, transactionId)))
  })

  it('races put fetching result', () => {
    const saga = postProjectFilterSaga({ payload })
    sagaNextN(saga, 2)
    saga.next(url)
    sagaNextN(saga, 1)
    expect(saga.next().value).toEqual(
      race({
        success: expect.anything(),
        failure: expect.anything(),
      })
    )
  })

  describe('success', () => {
    const data = { success: { payload: { responseBody } } }

    it('calls mapFilterResponseService', () => {
      const saga = postProjectFilterSaga({ payload })
      sagaNextN(saga, 5)
      expect(saga.next(data).value).toEqual(call(mapFilterResponseService, responseBody))
    })

    it('puts postProjectFilterSuccess', () => {
      const saga = postProjectFilterSaga({ payload })
      sagaNextN(saga, 5)
      saga.next(data)
      expect(saga.next().value).toEqual(put(postProjectFilterSuccess()))
    })

    it('puts fetchProjectItems', () => {
      const saga = postProjectFilterSaga({ payload })
      sagaNextN(saga, 5)
      saga.next(data)
      sagaNextN(saga, 1)
      expect(saga.next().value).toEqual(put(fetchProjectItems(projectId, 0, PROJECT_ITEMS_SIZE)))
    })
  })

  describe('failure', () => {
    const data = { failure: { payload: { error: 'foo' } } }

    it('puts postProjectFilterFailure', () => {
      const saga = postProjectFilterSaga({ payload })
      sagaNextN(saga, 5)
      expect(saga.next(data).value).toEqual(put(postProjectFilterFailure(data.failure.payload.error)))
    })
  })

  it('puts postProjectFilterFailure', () => {
    const saga = postProjectFilterSaga({ payload })
    sagaNextN(saga, 1)
    const err = new Error('error')
    expect(saga.throw(err).value).toEqual(put(postProjectFilterFailure(err)))
  })
})

describe('watchFetchProjectFilterOperators', () => {
  it('links to fetchProjectFilterOperatorsSaga', () => {
    const saga = watchFetchProjectFilterOperators()
    expect(saga.next().value).toEqual(takeLatest(FETCH_PROJECT_FILTER_OPERATORS, fetchProjectFilterOperatorsSaga))
  })
})

describe('fetchProjectFilterOperatorsSaga', () => {
  const projectId = 'foo'
  const payload = { projectId }
  const responseBody = {
    payload: [
      { id: 1, foo: 'foo' },
      { id: 2, foo: 'foo2' },
    ],
  }
  const transactionId = 'project_filter_operators'
  const url = resolveApiUrl('REACT_APP_PROJECT_FILTER_OPERATORS_ROUTE', { projectId })

  it('calls resolveApiUrl', () => {
    const saga = fetchProjectFilterOperatorsSaga({ payload })
    expect(saga.next().value).toEqual(call(resolveApiUrl, 'REACT_APP_PROJECT_FILTER_OPERATORS_ROUTE', { projectId }))
  })

  it('puts request', () => {
    const saga = fetchProjectFilterOperatorsSaga({ payload })
    sagaNextN(saga, 1)
    expect(saga.next(url).value).toEqual(put(request(url, null, transactionId)))
  })

  it('races put fetching result', () => {
    const saga = fetchProjectFilterOperatorsSaga({ payload })
    sagaNextN(saga, 1)
    saga.next(url)
    expect(saga.next().value).toEqual(
      race({
        success: expect.anything(),
        failure: expect.anything(),
      })
    )
  })

  describe('success', () => {
    const data = { success: { payload: { responseBody } } }

    it('calls  mapOperatorResponseService', () => {
      const saga = fetchProjectFilterOperatorsSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(url)
      sagaNextN(saga, 1)
      expect(saga.next(data).value).toEqual(call(mapOperatorResponseService, responseBody))
    })

    it('puts fetchProjectFilterOperatorsSuccess', () => {
      const saga = fetchProjectFilterOperatorsSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(url)
      sagaNextN(saga, 1)
      saga.next(data)
      expect(saga.next(responseBody).value).toEqual(put(fetchProjectFilterOperatorsSuccess(responseBody)))
    })
  })

  describe('failure', () => {
    const data = { failure: { payload: { error: 'foo' } } }

    it('puts  fetchProjectFilterOperatorsFailure', () => {
      const saga = fetchProjectFilterOperatorsSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(url)
      sagaNextN(saga, 1)
      expect(saga.next(data).value).toEqual(put(fetchProjectFilterOperatorsFailure(data.failure.payload.error)))
    })
  })

  it('puts fetchProjectFilterOperatorsFailure', () => {
    const saga = fetchProjectFilterOperatorsSaga({ payload })
    sagaNextN(saga, 1)
    const err = new Error('error')
    expect(saga.throw(err).value).toEqual(put(fetchProjectFilterOperatorsFailure(err)))
  })
})
