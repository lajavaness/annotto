import { call, fork, put, race, select, take, takeLatest } from 'redux-saga/effects'
import { globalHistory, navigate } from '@reach/router'
import { isEmpty } from 'lodash'
import { match } from '@reach/router/lib/utils'

import { PROJECT_ITEMS_SIZE, PROJECT_LOGS_SIZE, PROJECT_STATS_TASKS_SIZE } from 'shared/enums/paginationTypes'

import { resolveApiUrl } from 'shared/utils/urlUtils'

import {
  watchFetchAnnotationItem,
  watchFetchCurrentItem,
  watchFetchItemLogsSaga,
  watchMountAnnotationPage,
  watchNavigateToNextItem,
  watchNavigateToPrevItem,
  watchPostItemCommentSaga,
  watchPutItemTags,
  watchResetAnnotationItems,
  watchSaveAnnotationsItem,
  watchSetCurrentItem,
  watchUpdateCurrentAnnotationItem,
} from 'modules/project/sagas/annotationSagas'
import {
  watchFetchProjectFilter,
  watchFetchProjectFilterOperators,
  watchPostProjectFilter,
} from 'modules/project/sagas/filterSagas'

import {
  DELETE_PROJECT,
  FETCH_PROJECT_ITEMS,
  FETCH_PROJECT_ITEMS_AND_LOGS,
  FETCH_PROJECT_ITEMS_SUCCESS,
  FETCH_PROJECT_ITEMS_TAGS,
  FETCH_PROJECT_ITEMS_TAGS_SUCCESS,
  FETCH_PROJECT_LOGS,
  FETCH_PROJECT_LOGS_SUCCESS,
  FETCH_PROJECT_STATS_TASKS,
  FETCH_PROJECT_STATS_TASKS_SUCCESS,
  FETCH_PROJECT_USERS,
  FETCH_PROJECT_USERS_SUCCESS,
  NAVIGATE_TO_ITEM,
  POST_PROJECT_COMMENT,
  PUT_PROJECT,
  STARTUP,
  deleteProjectFailure,
  deleteProjectSuccess,
  fetchProjectItems,
  fetchProjectItemsAndLogsFailure,
  fetchProjectItemsAndLogsSuccess,
  fetchProjectItemsFailure,
  fetchProjectItemsSuccess,
  fetchProjectItemsTags,
  fetchProjectItemsTagsFailure,
  fetchProjectItemsTagsSuccess,
  fetchProjectLogs,
  fetchProjectLogsFailure,
  fetchProjectLogsSuccess,
  fetchProjectStatsTasks,
  fetchProjectStatsTasksFailure,
  fetchProjectStatsTasksSuccess,
  fetchProjectUsers,
  fetchProjectUsersFailure,
  fetchProjectUsersSuccess,
  navigateToItemFailure,
  navigateToItemSuccess,
  postProjectCommentFailure,
  postProjectCommentSuccess,
  putProjectFailure,
  putProjectSuccess,
  startupFailure,
  startupSuccess,
} from 'modules/project/actions/projectActions'
import {
  FETCH_ANNOTATION_ITEM_SUCCESS,
  MOUNT_ANNOTATION_PAGE_SUCCESS,
  UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS,
  fetchAnnotationItem,
  mountAnnotationPage,
  updateCurrentAnnotationItem,
} from 'modules/project/actions/annotationActions'
import { FETCH_BUNDLE_SUCCESS, fetchBundle } from 'shared/actions/i18nActions'
import { FETCH_LOGS_SUCCESS, POST_COMMENT_SUCCESS, fetchLogs, postComment } from 'shared/actions/logsActions'
import { FETCH_PROJECT_FAILURE, FETCH_PROJECT_SUCCESS, fetchProject } from 'modules/root/actions/rootActions'
import {
  FETCH_PROJECT_FILTER_OPERATORS_SUCCESS,
  FETCH_PROJECT_FILTER_SUCCESS,
  fetchProjectFilter,
  fetchProjectFilterOperators,
} from 'modules/project/actions/filterActions'
import { REQUEST_FAILURE, REQUEST_SUCCESS, request } from 'shared/actions/apiActions'

import {
  filterDuplicateLogEntries,
  mapAndSortLogsService,
  mapPostCommentResponseService,
} from 'modules/project/services/projectServices'

import { selectAnnotationItems, selectCurrentItem } from 'modules/project/selectors/annotationSelectors'
import {
  selectProjectFilterId,
  selectProjectHighlights,
  selectProjectId,
  selectProjectItems,
  selectProjectItemsIndex,
  selectProjectItemsTotal,
  selectProjectLogs,
  selectProjectStatsTasks,
  selectProjectStatsTasksIndex,
  selectProjectStatsTasksTotal,
} from 'modules/project/selectors/projectSelectors'

function* watchStartup() {
  yield takeLatest(STARTUP, startupSaga)
}

export function* startupSaga() {
  try {
    yield put(fetchBundle('project'))
    yield take(({ type, payload }) => type === FETCH_BUNDLE_SUCCESS && payload.namespace === 'project')

    const projectId = globalHistory.location.pathname.split('/')[2]

    yield put(fetchProject(projectId))

    const { success, failure } = yield race({
      success: take(({ type }) => type === FETCH_PROJECT_SUCCESS),
      failure: take(({ type }) => type === FETCH_PROJECT_FAILURE),
    })

    if (success) {
      const isMatch = match('/project/:projectId/annotation/*itemId', globalHistory.location.pathname)

      yield put(fetchProjectItemsTags(projectId))
      yield take(FETCH_PROJECT_ITEMS_TAGS_SUCCESS)

      yield put(fetchProjectFilterOperators(projectId))
      yield take(FETCH_PROJECT_FILTER_OPERATORS_SUCCESS)

      yield put(fetchProjectFilter(projectId))
      yield take(FETCH_PROJECT_FILTER_SUCCESS)

      yield put(fetchProjectStatsTasks(projectId, 0, PROJECT_STATS_TASKS_SIZE))
      yield take(FETCH_PROJECT_STATS_TASKS_SUCCESS)

      yield put(fetchProjectUsers(projectId))
      yield take(FETCH_PROJECT_USERS_SUCCESS)

      if (isMatch) {
        yield put(mountAnnotationPage())
        yield take(MOUNT_ANNOTATION_PAGE_SUCCESS)
      }

      yield put(startupSuccess())
    } else {
      yield put(startupFailure(failure.payload.error))
      yield call(navigate, '/')
    }
  } catch (err) {
    yield put(startupFailure(err))
  }
}

export function* watchFetchProjectItems() {
  yield takeLatest(FETCH_PROJECT_ITEMS, fetchProjectItemsSaga)
}

export function* fetchProjectItemsSaga({ payload }) {
  try {
    const transactionId = 'items'
    const { projectId } = payload
    const url = yield call(resolveApiUrl, 'REACT_APP_PROJECT_STATS_ITEMS_ROUTE', { projectId })
    const filterId = yield select(selectProjectFilterId)
    const items = yield select(selectProjectItems)
    const itemsIndex = yield select(selectProjectItemsIndex)
    const itemsTotal = yield select(selectProjectItemsTotal)
    const options = {
      query: {
        index: payload.index || 0,
        limit: payload.limit || PROJECT_ITEMS_SIZE,
        filterId,
      },
    }
    yield put(request(url, options, transactionId))
    const {
      payload: { responseBody: data },
    } = yield take(
      ({ type, payload: requestPayload }) => type === REQUEST_SUCCESS && requestPayload.transactionId === transactionId
    )

    if (itemsTotal === data.total && itemsIndex !== data.index) {
      yield put(fetchProjectItemsSuccess({ ...data, data: [...(!isEmpty(items) ? items : []), ...data.data] }))
    } else {
      yield put(fetchProjectItemsSuccess(data))
    }
  } catch (err) {
    yield put(fetchProjectItemsFailure(err))
  }
}

export function* watchFetchProjectStatsTasks() {
  yield takeLatest(FETCH_PROJECT_STATS_TASKS, fetchProjectStatsTasksSaga)
}

export function* fetchProjectStatsTasksSaga({ payload }) {
  try {
    const transactionId = 'stats_tasks'
    const { projectId } = payload
    const url = yield call(resolveApiUrl, 'REACT_APP_PROJECT_STATS_TASKS_ROUTE', { projectId })

    const tasks = yield select(selectProjectStatsTasks)
    const taskIndex = yield select(selectProjectStatsTasksIndex)
    const tasksTotal = yield select(selectProjectStatsTasksTotal)

    const options = {
      query: {
        index: payload.index || 0,
        limit: payload.limit || PROJECT_STATS_TASKS_SIZE,
      },
    }
    yield put(request(url, options, transactionId))
    const {
      payload: { responseBody: data },
    } = yield take(
      ({ type, payload: requestPayload }) => type === REQUEST_SUCCESS && requestPayload.transactionId === transactionId
    )

    if (tasksTotal === data.total && taskIndex !== data.index) {
      yield put(
        fetchProjectStatsTasksSuccess({
          ...data,
          data: [...(!isEmpty(tasks) ? tasks : []), ...data.data],
        })
      )
    } else {
      yield put(fetchProjectStatsTasksSuccess(data))
    }
  } catch (err) {
    yield put(fetchProjectStatsTasksFailure(err))
  }
}

export function* watchFetchProjectUsers() {
  yield takeLatest(FETCH_PROJECT_USERS, fetchProjectUsersSaga)
}

export function* fetchProjectUsersSaga({ payload }) {
  try {
    const transactionId = 'projectUsers'
    const { projectId } = payload
    const url = yield call(resolveApiUrl, 'REACT_APP_PROJECT_USERS_ROUTE', { projectId })

    yield put(request(url, null, transactionId))
    const {
      payload: { responseBody: data },
    } = yield take(
      ({ type, payload: requestPayload }) => type === REQUEST_SUCCESS && requestPayload.transactionId === transactionId
    )
    yield put(fetchProjectUsersSuccess(data))
  } catch (err) {
    yield put(fetchProjectUsersFailure(err))
  }
}

export function* watchFetchAnnotationItemTags() {
  yield takeLatest(FETCH_PROJECT_ITEMS_TAGS, fetchProjectItemsTagsSaga)
}

export function* fetchProjectItemsTagsSaga({ payload }) {
  try {
    const transactionId = 'items_tags'
    const { projectId } = payload

    const url = yield call(resolveApiUrl, 'REACT_APP_PROJECT_ITEMS_TAGS_ROUTE', { projectId })

    yield put(request(url, null, transactionId))

    const {
      payload: { responseBody },
    } = yield take(
      ({ type, payload: requestPayload }) => type === REQUEST_SUCCESS && requestPayload.transactionId === transactionId
    )

    yield put(fetchProjectItemsTagsSuccess(responseBody))
  } catch (err) {
    yield put(fetchProjectItemsTagsFailure(err))
  }
}

export function* watchPutProject() {
  yield takeLatest(PUT_PROJECT, putProjectSaga)
}

export function* putProjectSaga({ payload }) {
  try {
    const transactionId = 'project'
    const projectId = yield select(selectProjectId)
    const currentHighlights = yield select(selectProjectHighlights)

    const url = yield call(resolveApiUrl, 'REACT_APP_PROJECT_ROUTE', { projectId })

    const options = { method: 'PUT', body: payload }

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

    if (payload.highlights?.length !== currentHighlights?.length) {
      const items = yield select(selectAnnotationItems)
      const currentItem = yield select(selectCurrentItem)
      yield put(fetchAnnotationItem(currentItem._id, projectId))
      const {
        payload: {
          item: { highlights },
        },
      } = yield take(FETCH_ANNOTATION_ITEM_SUCCESS)

      yield put(updateCurrentAnnotationItem({ ...currentItem, highlights }, items))
      yield take(UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS)
    }

    if (success) {
      yield put(putProjectSuccess(payload))
    } else {
      yield put(putProjectFailure(failure.payload.error))
    }
  } catch (err) {
    yield put(putProjectFailure(err))
  }
}

export function* watchNavigateToItem() {
  yield takeLatest(NAVIGATE_TO_ITEM, navigateToItemSaga)
}

export function* navigateToItemSaga({ payload }) {
  try {
    const { itemId, projectId } = payload

    if (itemId && projectId) {
      yield put(navigateToItemSuccess())
    } else {
      yield put(navigateToItemFailure(new Error(`${itemId ? 'projectId' : 'itemId'} does not exist !`)))
    }
  } catch (err) {
    yield put(navigateToItemFailure(err))
  }
}

export function* watchFetchRequiredProjectData() {
  yield takeLatest(FETCH_PROJECT_ITEMS_AND_LOGS, fetchProjectItemsAndLogsSaga)
}

export function* fetchProjectItemsAndLogsSaga({ payload }) {
  try {
    const { projectId } = payload
    yield put(fetchProjectItems(projectId, 0, PROJECT_ITEMS_SIZE))
    yield take(FETCH_PROJECT_ITEMS_SUCCESS)

    yield put(fetchProjectLogs(projectId, 0, PROJECT_LOGS_SIZE))
    yield take(FETCH_PROJECT_LOGS_SUCCESS)

    yield put(fetchProjectItemsAndLogsSuccess())
  } catch (err) {
    yield put(fetchProjectItemsAndLogsFailure(err))
  }
}

export function* watchFetchProjectLogsSaga() {
  yield takeLatest(FETCH_PROJECT_LOGS, fetchProjectLogsSaga)
}

export function* fetchProjectLogsSaga({ payload }) {
  try {
    const transactionId = 'project_logs'
    const { projectId, index, limit, type } = payload
    const params = { index, limit, type }

    yield put(fetchLogs(projectId, params, transactionId))
    const {
      payload: { logs },
    } = yield take(FETCH_LOGS_SUCCESS)

    let dataLogs = yield call(mapAndSortLogsService, logs.data)

    const oldLogs = yield select(selectProjectLogs)

    if (index && !isEmpty(oldLogs)) {
      dataLogs = yield call(filterDuplicateLogEntries, oldLogs.data, dataLogs)
      yield put(fetchProjectLogsSuccess({ ...oldLogs, ...logs, data: [...oldLogs.data, ...dataLogs] }))
    } else {
      yield put(fetchProjectLogsSuccess({ ...logs, data: dataLogs }))
    }
  } catch (err) {
    yield put(fetchProjectLogsFailure(err))
  }
}

export function* watchPostProjectComment() {
  yield takeLatest(POST_PROJECT_COMMENT, postProjectCommentSaga)
}

export function* postProjectCommentSaga({ payload }) {
  try {
    const transactionId = 'project_comment'
    const { comment } = payload

    const projectId = yield select(selectProjectId)

    const postCommentBody = {
      comment,
    }

    yield put(postComment(postCommentBody, projectId, transactionId))
    const {
      payload: { logs },
    } = yield take(POST_COMMENT_SUCCESS)

    const lastLogs = yield call(mapPostCommentResponseService, logs.data[0])

    yield put(postProjectCommentSuccess(lastLogs))
  } catch (err) {
    yield put(postProjectCommentFailure(err))
  }
}

export function* watchDeleteProject() {
  yield takeLatest(DELETE_PROJECT, deleteProjectSaga)
}

export function* deleteProjectSaga({ payload }) {
  try {
    const transactionId = 'delete_project'

    const { projectId } = payload

    const url = yield call(resolveApiUrl, 'REACT_APP_PROJECT_ROUTE', { projectId })
    const options = { method: 'DELETE' }

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
      yield put(deleteProjectSuccess())
      yield navigate('/', { replace: true })
    } else {
      yield put(deleteProjectFailure(failure.payload.error))
    }

    yield put(deleteProjectSuccess())
  } catch (err) {
    yield put(deleteProjectFailure(err))
  }
}

export default function* projectSagas() {
  yield fork(watchStartup)
  yield fork(watchMountAnnotationPage)
  yield fork(watchFetchCurrentItem)
  yield fork(watchUpdateCurrentAnnotationItem)
  yield fork(watchFetchAnnotationItemTags)
  yield fork(watchFetchProjectLogsSaga)
  yield fork(watchFetchProjectStatsTasks)
  yield fork(watchFetchProjectUsers)
  yield fork(watchFetchItemLogsSaga)
  yield fork(watchPostItemCommentSaga)
  yield fork(watchPutItemTags)
  yield fork(watchPutProject)
  yield fork(watchResetAnnotationItems)
  yield fork(watchNavigateToItem)
  yield fork(watchPostProjectComment)
  yield fork(watchFetchAnnotationItem)
  yield fork(watchFetchProjectItems)
  yield fork(watchFetchProjectFilter)
  yield fork(watchFetchProjectFilterOperators)
  yield fork(watchPostProjectFilter)
  yield fork(watchNavigateToNextItem)
  yield fork(watchNavigateToPrevItem)
  yield fork(watchSetCurrentItem)
  yield fork(watchSaveAnnotationsItem)
  yield fork(watchDeleteProject)
  yield fork(watchFetchRequiredProjectData)
}
