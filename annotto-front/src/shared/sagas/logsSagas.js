import { call, fork, put, race, take, takeEvery } from 'redux-saga/effects'

import {
  FETCH_LOGS,
  POST_COMMENT,
  fetchLogsFailure,
  fetchLogsSuccess,
  postCommentFailure,
  postCommentSuccess,
} from 'shared/actions/logsActions'
import { REQUEST_FAILURE, REQUEST_SUCCESS, request } from 'shared/actions/apiActions'

import { resolveApiUrl } from 'shared/utils/urlUtils'

export function* watchFetchLogs() {
  yield takeEvery(FETCH_LOGS, fetchLogsSaga)
}

export function* fetchLogsSaga({ payload }) {
  try {
    const { transactionId, fetchLogsParams, projectId } = payload

    const url = yield call(resolveApiUrl, 'REACT_APP_LOGS_ROUTE', { projectId })
    const options = { query: { limit: 0, index: 0, ...fetchLogsParams } }

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
      yield put(fetchLogsSuccess(success.payload.responseBody))
    } else {
      yield put(fetchLogsFailure(failure.payload.error, transactionId))
    }
  } catch (err) {
    const { transactionId } = payload
    yield put(fetchLogsFailure(err, transactionId))
  }
}

export function* watchPostComment() {
  yield takeEvery(POST_COMMENT, postCommentSaga)
}

export function* postCommentSaga({ payload }) {
  try {
    const { transactionId, postCommentBody, projectId } = payload

    const url = yield call(resolveApiUrl, 'REACT_APP_COMMENTS_ROUTE', { projectId })
    const options = {
      method: 'POST',
      body: postCommentBody,
    }

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
      yield put(postCommentSuccess(success.payload.responseBody))
    } else {
      yield put(postCommentFailure(failure.payload.error, transactionId))
    }
  } catch (err) {
    const { transactionId } = payload
    yield put(postCommentFailure(err, transactionId))
  }
}

export default function* logsSaga() {
  yield fork(watchFetchLogs)
  yield fork(watchPostComment)
}
