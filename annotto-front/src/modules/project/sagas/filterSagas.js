import { call, put, race, select, take, takeLatest } from 'redux-saga/effects'

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
import { REQUEST_FAILURE, REQUEST_SUCCESS, request } from 'shared/actions/apiActions'
import { fetchProjectItems } from 'modules/project/actions/projectActions'

import {
  mapFilterRequestService,
  mapFilterResponseService,
  mapOperatorResponseService,
} from 'modules/project/services/projectServices'

import { selectProjectFilterId } from 'modules/project/selectors/projectSelectors'

import { PROJECT_ITEMS_SIZE } from 'shared/enums/paginationTypes'

import { resolveApiUrl } from 'shared/utils/urlUtils'

export function* watchFetchProjectFilter() {
  yield takeLatest(FETCH_PROJECT_FILTER, fetchProjectFilterSaga)
}

export function* fetchProjectFilterSaga({ payload }) {
  try {
    const { projectId } = payload

    const transactionId = 'project_filter'
    const url = yield call(resolveApiUrl, 'REACT_APP_PROJECT_FILTER_ROUTE', { projectId })

    yield put(request(url, null, transactionId))

    const { success, failure } = yield race({
      success: take(
        ({ type, payload: requestPayload }) =>
          type === REQUEST_SUCCESS && requestPayload.transactionId === transactionId
      ),
      failure: take(
        ({ type, payload: requestPayload }) =>
          type === REQUEST_FAILURE && requestPayload.transactionId === transactionId
      ),
    })

    if (success) {
      const filter = yield call(mapFilterResponseService, success.payload.responseBody)

      yield put(fetchProjectFilterSuccess(filter))
    } else {
      yield put(fetchProjectFilterFailure(failure.payload.error))
    }
  } catch (err) {
    yield put(fetchProjectFilterFailure(err))
  }
}

export function* watchPostProjectFilter() {
  yield takeLatest(POST_PROJECT_FILTER, postProjectFilterSaga)
}

export function* postProjectFilterSaga({ payload }) {
  try {
    const { projectId, filters } = payload
    const transactionId = 'project_filter'

    const filterId = yield select(selectProjectFilterId)
    const url = yield call(resolveApiUrl, 'REACT_APP_PROJECT_FILTER_ROUTE', { projectId })
    const body = yield call(mapFilterRequestService, filters)

    const method = filterId ? 'PUT' : 'POST'
    const options = { method, body }

    yield put(request(url, options, transactionId))

    const { success, failure } = yield race({
      success: take(
        ({ type, payload: requestPayload }) =>
          type === REQUEST_SUCCESS && requestPayload.transactionId === transactionId
      ),
      failure: take(
        ({ type, payload: requestPayload }) =>
          type === REQUEST_FAILURE && requestPayload.transactionId === transactionId
      ),
    })

    if (success) {
      const filter = yield call(mapFilterResponseService, success.payload.responseBody)

      yield put(postProjectFilterSuccess(filter))
      yield put(fetchProjectItems(projectId, 0, PROJECT_ITEMS_SIZE))
    } else {
      yield put(postProjectFilterFailure(failure.payload.error))
    }
  } catch (err) {
    yield put(postProjectFilterFailure(err))
  }
}

export function* watchFetchProjectFilterOperators() {
  yield takeLatest(FETCH_PROJECT_FILTER_OPERATORS, fetchProjectFilterOperatorsSaga)
}

export function* fetchProjectFilterOperatorsSaga({ payload }) {
  try {
    const { projectId } = payload

    const transactionId = 'project_filter_operators'
    const url = yield call(resolveApiUrl, 'REACT_APP_PROJECT_FILTER_OPERATORS_ROUTE', { projectId })

    yield put(request(url, null, transactionId))
    const { success, failure } = yield race({
      success: take(
        ({ type, payload: requestPayload }) =>
          type === REQUEST_SUCCESS && requestPayload.transactionId === transactionId
      ),
      failure: take(
        ({ type, payload: requestPayload }) =>
          type === REQUEST_FAILURE && requestPayload.transactionId === transactionId
      ),
    })

    if (success) {
      const operators = yield call(mapOperatorResponseService, success.payload.responseBody)

      yield put(fetchProjectFilterOperatorsSuccess(operators))
    } else {
      yield put(fetchProjectFilterOperatorsFailure(failure.payload.error))
    }
  } catch (err) {
    yield put(fetchProjectFilterOperatorsFailure(err))
  }
}
