import { call, put, race, select, take, takeLatest } from 'redux-saga/effects'
import { globalHistory, navigate } from '@reach/router'
import { noop } from 'lodash'

import { sagaNextN } from 'setupTests'

import { PROJECT_ITEMS_SIZE, PROJECT_LOGS_SIZE, PROJECT_STATS_TASKS_SIZE } from 'shared/enums/paginationTypes'

import { resolveApiUrl } from 'shared/utils/urlUtils'

import {
  DELETE_PROJECT,
  deleteProjectFailure,
  deleteProjectSuccess,
  FETCH_PROJECT_ITEMS_AND_LOGS,
  FETCH_PROJECT_ITEMS_SUCCESS,
  FETCH_PROJECT_ITEMS_TAGS_SUCCESS,
  FETCH_PROJECT_LOGS,
  FETCH_PROJECT_LOGS_SUCCESS,
  FETCH_PROJECT_STATS_TASKS_SUCCESS,
  FETCH_PROJECT_USERS,
  FETCH_PROJECT_USERS_SUCCESS,
  fetchProjectItems,
  fetchProjectItemsAndLogsSuccess,
  fetchProjectItemsFailure,
  fetchProjectItemsSuccess,
  fetchProjectItemsTags,
  fetchProjectLogs,
  fetchProjectLogsFailure,
  fetchProjectLogsSuccess,
  fetchProjectStatsTasks,
  fetchProjectStatsTasksFailure,
  fetchProjectStatsTasksSuccess,
  fetchProjectUsers,
  fetchProjectUsersFailure,
  fetchProjectUsersSuccess,
  NAVIGATE_TO_ITEM,
  navigateToItemFailure,
  navigateToItemSuccess,
  POST_PROJECT_COMMENT,
  postProjectCommentFailure,
  postProjectCommentSuccess,
  PUT_PROJECT,
  putProjectFailure,
  putProjectSuccess,
  startupSuccess,
} from 'modules/project/actions/projectActions'
import {
  FETCH_ANNOTATION_ITEM_SUCCESS,
  fetchAnnotationItem,
  MOUNT_ANNOTATION_PAGE_SUCCESS,
  mountAnnotationPage,
  UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS,
  updateCurrentAnnotationItem,
} from 'modules/project/actions/annotationActions'
import { FETCH_LOGS_SUCCESS, fetchLogs, POST_COMMENT_SUCCESS, postComment } from 'shared/actions/logsActions'
import {
  FETCH_PROJECT_FILTER_OPERATORS_SUCCESS,
  FETCH_PROJECT_FILTER_SUCCESS,
  fetchProjectFilter,
  fetchProjectFilterOperators,
} from 'modules/project/actions/filterActions'
import { request } from 'shared/actions/apiActions'
import { fetchBundle } from 'shared/actions/i18nActions'
import { fetchProject } from 'modules/root/actions/rootActions'

import {
  deleteProjectSaga,
  fetchProjectItemsAndLogsSaga,
  fetchProjectItemsSaga,
  fetchProjectLogsSaga,
  fetchProjectStatsTasksSaga,
  fetchProjectUsersSaga,
  navigateToItemSaga,
  postProjectCommentSaga,
  putProjectSaga,
  startupSaga,
  watchDeleteProject,
  watchFetchProjectLogsSaga,
  watchFetchProjectUsers,
  watchFetchRequiredProjectData,
  watchNavigateToItem,
  watchPostProjectComment,
  watchPutProject,
} from 'modules/project/sagas/projectSagas'
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

describe('projectSagas', () => {
  describe('startupSaga', () => {
    const namespace = 'project'
    const projectId = 'foo'
    globalHistory.location.pathname = `/project/${projectId}`

    it('puts bundle fetching', () => {
      const saga = startupSaga()
      expect(saga.next().value).toEqual(put(fetchBundle(namespace)))
    })

    it('takes bundle fetching result', () => {
      const saga = startupSaga()
      sagaNextN(saga, 1)
      expect(saga.next().value).toMatchObject({ type: 'TAKE' })
    })

    it('puts fetchProject', () => {
      const saga = startupSaga()
      sagaNextN(saga, 2)
      expect(saga.next().value).toEqual(put(fetchProject(projectId)))
    })

    describe('success', () => {
      const data = { success: { payload: { responseBody: 'foo' } } }

      it('puts fetchProjectItemsTags', () => {
        const saga = startupSaga()
        sagaNextN(saga, 4)
        expect(saga.next(data).value).toEqual(put(fetchProjectItemsTags(projectId)))
      })

      it('takes FETCH_PROJECT_ITEMS_TAGS_SUCCESS', () => {
        const saga = startupSaga()
        sagaNextN(saga, 4)
        saga.next(data)
        expect(saga.next().value).toEqual(take(FETCH_PROJECT_ITEMS_TAGS_SUCCESS))
      })

      it('puts fetchProjectFilterOperators', () => {
        const saga = startupSaga()
        sagaNextN(saga, 4)
        saga.next(data)
        sagaNextN(saga, 1)
        expect(saga.next().value).toEqual(put(fetchProjectFilterOperators(projectId)))
      })

      it('takes FETCH_PROJECT_FILTER_OPERATORS_SUCCESS', () => {
        const saga = startupSaga()
        sagaNextN(saga, 4)
        saga.next(data)
        sagaNextN(saga, 2)
        expect(saga.next().value).toEqual(take(FETCH_PROJECT_FILTER_OPERATORS_SUCCESS))
      })

      it('puts fetchProjectFilter', () => {
        const saga = startupSaga()
        sagaNextN(saga, 4)
        saga.next(data)
        sagaNextN(saga, 3)
        expect(saga.next().value).toEqual(put(fetchProjectFilter(projectId)))
      })

      it('takes FETCH_PROJECT_FILTER_SUCCESS', () => {
        const saga = startupSaga()
        sagaNextN(saga, 4)
        saga.next(data)
        sagaNextN(saga, 4)
        expect(saga.next().value).toEqual(take(FETCH_PROJECT_FILTER_SUCCESS))
      })

      it('puts fetchProjectStatsTasks', () => {
        const saga = startupSaga()
        sagaNextN(saga, 4)
        saga.next(data)
        sagaNextN(saga, 5)
        expect(saga.next(data).value).toEqual(put(fetchProjectStatsTasks(projectId, 0, PROJECT_STATS_TASKS_SIZE)))
      })

      it('takes FETCH_PROJECT_STATS_TASKS_SUCCESS', () => {
        const saga = startupSaga()
        sagaNextN(saga, 4)
        saga.next(data)
        sagaNextN(saga, 6)
        expect(saga.next().value).toEqual(take(FETCH_PROJECT_STATS_TASKS_SUCCESS))
      })

      it('puts fetchProjectUsers', () => {
        const saga = startupSaga()
        sagaNextN(saga, 4)
        saga.next(data)
        sagaNextN(saga, 7)
        expect(saga.next(data).value).toEqual(put(fetchProjectUsers(projectId)))
      })

      it('takes FETCH_PROJECT_USERS_SUCCESS', () => {
        const saga = startupSaga()
        sagaNextN(saga, 4)
        saga.next(data)
        sagaNextN(saga, 8)
        expect(saga.next().value).toEqual(take(FETCH_PROJECT_USERS_SUCCESS))
      })

      describe('if url does not match /project/:projectId/annotation/*itemId', () => {
        it('puts startupSuccess', () => {
          const saga = startupSaga()
          sagaNextN(saga, 4)
          saga.next(data)
          sagaNextN(saga, 9)
          expect(saga.next().value).toEqual(put(startupSuccess()))
        })
      })

      describe('if url match /project/:projectId/annotation/*itemId', () => {
        const itemId = 'bar'
        beforeEach(() => {
          globalHistory.location.pathname = `/project/${projectId}/annotation/${itemId}`
        })

        it('puts mountAnnotationPage', () => {
          const saga = startupSaga()
          sagaNextN(saga, 4)
          saga.next(data)
          sagaNextN(saga, 9)
          expect(saga.next().value).toEqual(put(mountAnnotationPage()))
        })

        it('takes MOUNT_ANNOTATION_PAGE_SUCCESS', () => {
          const saga = startupSaga()
          sagaNextN(saga, 4)
          saga.next(data)
          sagaNextN(saga, 10)
          expect(saga.next().value).toEqual(take(MOUNT_ANNOTATION_PAGE_SUCCESS))
        })

        it('puts startupSuccess', () => {
          const saga = startupSaga()
          sagaNextN(saga, 4)
          saga.next(data)
          sagaNextN(saga, 11)
          expect(saga.next(data).value).toEqual(put(startupSuccess()))
        })
      })
    })
  })

  describe('fetchProjectItemsSaga', () => {
    const projectId = 'foo'
    const payload = { index: 0, limit: PROJECT_ITEMS_SIZE, projectId }
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
    const transactionId = 'items'
    const url = resolveApiUrl('REACT_APP_PROJECT_STATS_ITEMS_ROUTE', { projectId })

    it('calls resolveApiUrl', () => {
      const saga = fetchProjectItemsSaga({ payload })
      expect(saga.next().value).toEqual(
        call(resolveApiUrl, 'REACT_APP_PROJECT_STATS_ITEMS_ROUTE', { projectId: projectId })
      )
    })

    it('select selectProjectFilterId', () => {
      const saga = fetchProjectItemsSaga({ payload })
      sagaNextN(saga, 1)
      expect(saga.next().value).toEqual(select(selectProjectFilterId))
    })

    it('select selectProjectItems', () => {
      const saga = fetchProjectItemsSaga({ payload })
      sagaNextN(saga, 2)
      expect(saga.next().value).toEqual(select(selectProjectItems))
    })

    it('select selectProjectItemsIndex', () => {
      const saga = fetchProjectItemsSaga({ payload })
      sagaNextN(saga, 3)
      expect(saga.next().value).toEqual(select(selectProjectItemsIndex))
    })

    it('select selectProjectItemsTotal', () => {
      const saga = fetchProjectItemsSaga({ payload })
      sagaNextN(saga, 4)
      expect(saga.next().value).toEqual(select(selectProjectItemsTotal))
    })

    it('puts request', () => {
      const filterId = 1
      const options = {
        query: {
          index: payload.index,
          limit: payload.limit,
          filterId,
        },
      }

      const saga = fetchProjectItemsSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(url)
      saga.next(filterId)
      sagaNextN(saga, 2)
      expect(saga.next().value).toEqual(put(request(url, options, transactionId)))
    })

    it('takes items fetching result', () => {
      const saga = fetchProjectItemsSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(url)
      sagaNextN(saga, 4)
      expect(JSON.stringify(saga.next().value)).toEqual(JSON.stringify(take(noop)))
    })

    it('puts fetchFilteredItemsSuccess', () => {
      const saga = fetchProjectItemsSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(url)
      sagaNextN(saga, 5)
      expect(saga.next({ payload: { responseBody } }).value).toEqual(put(fetchProjectItemsSuccess(responseBody)))
    })

    it('puts fetchFilteredItemsFailure', () => {
      const saga = fetchProjectItemsSaga({ payload })
      sagaNextN(saga, 1)
      const err = new Error('error')
      expect(saga.throw(err).value).toEqual(put(fetchProjectItemsFailure(err)))
    })
  })

  describe('fetchProjectStatsTasksSaga', () => {
    const projectId = 'foo'
    const payload = { index: 0, limit: PROJECT_ITEMS_SIZE, projectId }
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
    const transactionId = 'stats_tasks'
    const url = resolveApiUrl('REACT_APP_PROJECT_STATS_ITEMS_ROUTE', { projectId })

    it('calls resolveApiUrl', () => {
      const saga = fetchProjectStatsTasksSaga({ payload })
      expect(saga.next().value).toEqual(
        call(resolveApiUrl, 'REACT_APP_PROJECT_STATS_TASKS_ROUTE', { projectId: projectId })
      )
    })

    it('select selectProjectStatsTasks', () => {
      const saga = fetchProjectStatsTasksSaga({ payload })
      sagaNextN(saga, 1)
      expect(saga.next().value).toEqual(select(selectProjectStatsTasks))
    })

    it('select selectProjectStatsTasksIndex', () => {
      const saga = fetchProjectStatsTasksSaga({ payload })
      sagaNextN(saga, 2)
      expect(saga.next().value).toEqual(select(selectProjectStatsTasksIndex))
    })

    it('select selectProjectStatsTasksTotal', () => {
      const saga = fetchProjectStatsTasksSaga({ payload })
      sagaNextN(saga, 3)
      expect(saga.next().value).toEqual(select(selectProjectStatsTasksTotal))
    })

    it('puts request', () => {
      const options = {
        query: {
          index: payload.index,
          limit: payload.limit,
        },
      }

      const saga = fetchProjectStatsTasksSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(url)
      sagaNextN(saga, 2)
      expect(saga.next().value).toEqual(put(request(url, options, transactionId)))
    })

    it('takes items fetching result', () => {
      const saga = fetchProjectStatsTasksSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(url)
      sagaNextN(saga, 3)
      expect(JSON.stringify(saga.next().value)).toEqual(JSON.stringify(take(noop)))
    })

    it('puts fetchFilteredItemsSuccess', () => {
      const saga = fetchProjectStatsTasksSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(url)
      sagaNextN(saga, 4)
      expect(saga.next({ payload: { responseBody } }).value).toEqual(put(fetchProjectStatsTasksSuccess(responseBody)))
    })

    it('puts fetchFilteredItemsFailure', () => {
      const saga = fetchProjectStatsTasksSaga({ payload })
      sagaNextN(saga, 1)
      const err = new Error('error')
      expect(saga.throw(err).value).toEqual(put(fetchProjectStatsTasksFailure(err)))
    })
  })

  describe('watchFetchProjectUsers', () => {
    it('links to fetchProjectUsersSaga', () => {
      const saga = watchFetchProjectUsers()
      expect(saga.next().value).toEqual(takeLatest(FETCH_PROJECT_USERS, fetchProjectUsersSaga))
    })
  })

  describe('fetchProjectUsersSage', () => {
    const projectId = 'foo'
    const payload = { projectId }
    const transactionId = 'projectUsers'
    const url = resolveApiUrl('REACT_APP_PROJECT_USERS_ROUTE', { projectId })
    const responseBody = [
      { email: 'foo@bar.com', firstName: 'foo', lastName: 'bar' },
      { email: 'foo2@bar.com', firstName: 'foo2', lastName: 'bar' },
    ]

    it('calls resolveApiUrl', () => {
      const saga = fetchProjectUsersSaga({ payload })
      expect(saga.next().value).toEqual(call(resolveApiUrl, 'REACT_APP_PROJECT_USERS_ROUTE', { projectId: projectId }))
    })

    it('puts request', () => {
      const saga = fetchProjectUsersSaga({ payload })
      saga.next()
      expect(saga.next(url).value).toEqual(put(request(url, null, transactionId)))
    })

    it('takes users fetching result', () => {
      const saga = fetchProjectUsersSaga({ payload })
      saga.next(url)
      sagaNextN(saga, 1)
      expect(JSON.stringify(saga.next().value)).toEqual(JSON.stringify(take(noop)))
    })

    it('puts fetchProjectUsersSuccess', () => {
      const saga = fetchProjectUsersSaga({ payload })
      saga.next(url)
      sagaNextN(saga, 2)
      expect(saga.next({ payload: { responseBody } }).value).toEqual(put(fetchProjectUsersSuccess(responseBody)))
    })

    it('puts fetchProjectUsersFailure', () => {
      const saga = fetchProjectUsersSaga({ payload })
      sagaNextN(saga, 1)
      const err = new Error('error')
      expect(saga.throw(err).value).toEqual(put(fetchProjectUsersFailure(err)))
    })
  })

  describe('watchFetchProjectLogsSaga', () => {
    it('links to fetchProjectLogsSaga', () => {
      const saga = watchFetchProjectLogsSaga()
      expect(saga.next().value).toEqual(takeLatest(FETCH_PROJECT_LOGS, fetchProjectLogsSaga))
    })
  })

  describe('fetchProjectLogsSaga', () => {
    const projectId = 'foo'
    const index = 1
    const limit = 10
    const type = 'foo'
    const params = { index, limit, type }
    const payload = { projectId, index, limit, type }
    const transactionId = 'project_logs'
    const logs = { data: ['foo'] }
    const oldLogs = { index: 0, data: ['bar'] }

    it('puts fetchLogs', () => {
      const saga = fetchProjectLogsSaga({ payload })
      expect(saga.next().value).toEqual(put(fetchLogs(projectId, params, transactionId)))
    })

    it('takes project logs fetching result', () => {
      const saga = fetchProjectLogsSaga({ payload })
      sagaNextN(saga, 1)
      expect(saga.next().value).toEqual(take(FETCH_LOGS_SUCCESS))
    })

    it('calls mapAndSortLogsService', () => {
      const saga = fetchProjectLogsSaga({ payload })
      sagaNextN(saga, 2)
      expect(saga.next({ payload: { logs } }).value).toEqual(call(mapAndSortLogsService, logs.data))
    })

    it('selects selectProjectLogs', () => {
      const saga = fetchProjectLogsSaga({ payload })
      sagaNextN(saga, 2)
      saga.next({ payload: { logs } })
      expect(saga.next(logs.data).value).toEqual(select(selectProjectLogs))
    })

    const putSuccessCases = [
      {
        title: 'puts fetchProjectLogsSuccess if index equal 0 ',
        payload: { ...payload, index: 0 },
        oldLogs: ['foo'],
      },
      {
        title: 'puts fetchProjectLogsSuccess if index is undefined',
        payload: { ...payload, index: undefined },
        oldLogs: ['foo'],
      },
      {
        title: 'puts fetchProjectLogsSuccess if index is null ',
        payload: { ...payload, index: null },
        oldLogs: ['foo'],
      },
      {
        title: 'puts fetchProjectLogsSuccess if oldLogs equal to en empty array',
        payload,
        oldLogs: [],
      },
      {
        title: 'puts fetchProjectLogsSuccess if oldLogs equal to null',
        payload,
        oldLogs: null,
      },
      {
        title: 'puts fetchProjectLogsSuccess if oldLogs is undefined',
        payload,
        oldLogs: undefined,
      },
      {
        title: 'puts fetchProjectLogsSuccess if oldLogs equal to en empty array',
        payload,
        oldLogs: [],
      },
    ]

    putSuccessCases.forEach(({ title, payload, oldLogs }) => {
      it(title, () => {
        const saga = fetchProjectLogsSaga({ payload })
        sagaNextN(saga, 2)
        saga.next({ payload: { logs } })
        saga.next(logs.data)
        expect(saga.next(oldLogs).value).toEqual(put(fetchProjectLogsSuccess({ ...logs, data: logs.data })))
      })
    })

    describe('if index && oldLogs is not an empty array', () => {
      it('calls filterDuplicateLogEntries', () => {
        const saga = fetchProjectLogsSaga({ payload })
        sagaNextN(saga, 2)
        saga.next({ payload: { logs } })
        saga.next(logs.data)
        expect(saga.next(oldLogs).value).toEqual(call(filterDuplicateLogEntries, oldLogs.data, logs.data))
      })

      it('puts fetchProjectLogsSuccess', () => {
        const saga = fetchProjectLogsSaga({ payload })
        sagaNextN(saga, 2)
        saga.next({ payload: { logs } })
        saga.next(logs.data)
        saga.next(oldLogs)
        expect(saga.next(logs.data).value).toEqual(
          put(fetchProjectLogsSuccess({ ...oldLogs, ...logs, data: [...oldLogs.data, ...logs.data] }))
        )
      })
    })

    it('puts fetchProjectLogsFailure', () => {
      const saga = fetchProjectLogsSaga({ payload })
      sagaNextN(saga, 1)
      const err = new Error('error')
      expect(saga.throw(err).value).toEqual(put(fetchProjectLogsFailure(err)))
    })
  })

  describe('watchPutProject', () => {
    it('links to putItemTagsSaga', () => {
      const saga = watchPutProject()
      expect(saga.next().value).toEqual(takeLatest(PUT_PROJECT, putProjectSaga))
    })
  })

  describe('watchFetchRequiredProjectData', () => {
    it('links to fetchProjectItemsAndLogsSaga', () => {
      const saga = watchFetchRequiredProjectData()
      expect(saga.next().value).toEqual(takeLatest(FETCH_PROJECT_ITEMS_AND_LOGS, fetchProjectItemsAndLogsSaga))
    })
  })

  describe('fetchProjectItemsAndLogsSaga', () => {
    const projectId = 'foo'
    const payload = { projectId }

    it('puts fetchProjectItems', () => {
      const saga = fetchProjectItemsAndLogsSaga({ payload })
      expect(saga.next().value).toEqual(put(fetchProjectItems(projectId, 0, PROJECT_ITEMS_SIZE)))
    })

    it('takes project items fetching result', () => {
      const saga = fetchProjectItemsAndLogsSaga({ payload })
      sagaNextN(saga, 1)
      expect(saga.next().value).toEqual(take(FETCH_PROJECT_ITEMS_SUCCESS))
    })

    it('puts fetchProjectLogs', () => {
      const saga = fetchProjectItemsAndLogsSaga({ payload })
      sagaNextN(saga, 2)
      expect(saga.next().value).toEqual(put(fetchProjectLogs(projectId, 0, PROJECT_LOGS_SIZE)))
    })

    it('takes project logs fetching result', () => {
      const saga = fetchProjectItemsAndLogsSaga({ payload })
      sagaNextN(saga, 3)
      expect(saga.next().value).toEqual(take(FETCH_PROJECT_LOGS_SUCCESS))
    })

    it('takes project logs fetching result', () => {
      const saga = fetchProjectItemsAndLogsSaga({ payload })
      sagaNextN(saga, 4)
      expect(saga.next().value).toEqual(put(fetchProjectItemsAndLogsSuccess()))
    })
  })

  describe('putProjectSaga', () => {
    const payload = { guidelines: 'foo' }
    const projectId = 1
    const transactionId = 'project'

    it('select selectProjectId', () => {
      const saga = putProjectSaga({ payload })
      expect(saga.next().value).toEqual(select(selectProjectId))
    })

    it('select selectProjectHighlights', () => {
      const saga = putProjectSaga({ payload })
      sagaNextN(saga, 1)
      expect(saga.next().value).toEqual(select(selectProjectHighlights))
    })

    it('calls resolveApiUrl', () => {
      const saga = putProjectSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(projectId)
      expect(saga.next().value).toEqual(call(resolveApiUrl, 'REACT_APP_PROJECT_ROUTE', { projectId }))
    })

    it('puts request', () => {
      const options = { method: 'PUT', body: payload }
      const saga = putProjectSaga({ payload })
      sagaNextN(saga, 3)
      expect(saga.next('url').value).toEqual(put(request('url', options, transactionId)))
    })

    it('races put project result', () => {
      const saga = putProjectSaga({ payload })
      sagaNextN(saga, 4)
      expect(saga.next().value).toEqual(
        race({
          success: expect.anything(),
          failure: expect.anything(),
        })
      )
    })

    describe('Success put', () => {
      it('returns result', () => {
        const saga = putProjectSaga({ payload })
        sagaNextN(saga, 5)
        const data = { success: { payload: 'foo' } }
        expect(saga.next(data).value).toEqual(put(putProjectSuccess(payload)))
      })
    })

    describe('Failure put', () => {
      it('returns result', () => {
        const saga = putProjectSaga({ payload })
        sagaNextN(saga, 5)
        const data = { failure: { payload: { error: 'foo' } } }
        expect(saga.next(data).value).toEqual(put(putProjectFailure('foo')))
      })
    })

    describe('if length of highlights in payload is different than length currentHighlights', () => {
      const payload = { highlights: ['foo'] }
      const currentHighlights = ['foo', 'bar']
      const data = { success: { payload: 'foo' } }
      const item = { _id: 'foo', highlights: ['foo'] }
      const items = [item]

      it('selects AnnotationItems', () => {
        const saga = putProjectSaga({ payload })
        sagaNextN(saga, 1)
        saga.next(projectId)
        saga.next(currentHighlights)
        sagaNextN(saga, 2)
        expect(saga.next(data).value).toEqual(select(selectAnnotationItems))
      })

      it('selects CurrentItem', () => {
        const saga = putProjectSaga({ payload })
        sagaNextN(saga, 1)
        saga.next(projectId)
        saga.next(currentHighlights)
        sagaNextN(saga, 2)
        saga.next(data)
        expect(saga.next(items).value).toEqual(select(selectCurrentItem))
      })

      it('puts fetchAnnotationItem', () => {
        const saga = putProjectSaga({ payload })
        sagaNextN(saga, 1)
        saga.next(projectId)
        saga.next(currentHighlights)
        sagaNextN(saga, 2)
        saga.next(data)
        saga.next(items)
        expect(saga.next(item).value).toEqual(put(fetchAnnotationItem(item._id, projectId)))
      })

      it('takes FETCH_ANNOTATION_ITEM_SUCCESS', () => {
        const saga = putProjectSaga({ payload })
        sagaNextN(saga, 1)
        saga.next(projectId)
        saga.next(currentHighlights)
        sagaNextN(saga, 2)
        saga.next(data)
        saga.next(items)
        saga.next(item)
        expect(saga.next().value).toEqual(take(FETCH_ANNOTATION_ITEM_SUCCESS))
      })

      it('puts updateCurrentAnnotationItem', () => {
        const saga = putProjectSaga({ payload })
        sagaNextN(saga, 1)
        saga.next(projectId)
        saga.next(currentHighlights)
        sagaNextN(saga, 2)
        saga.next(data)
        saga.next(items)
        saga.next(item)
        saga.next()
        expect(saga.next({ payload: { item: { highlights: currentHighlights } } }).value).toEqual(
          put(updateCurrentAnnotationItem({ ...item, highlights: currentHighlights }, items))
        )
      })

      it('takes UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS', () => {
        const saga = putProjectSaga({ payload })
        sagaNextN(saga, 1)
        saga.next(projectId)
        saga.next(currentHighlights)
        sagaNextN(saga, 2)
        saga.next(data)
        saga.next(items)
        saga.next(item)
        sagaNextN(saga, 1)
        saga.next({ payload: { item: { highlights: currentHighlights } } })
        expect(saga.next().value).toEqual(take(UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS))
      })

      it('puts putProjectSuccess', () => {
        const saga = putProjectSaga({ payload })
        sagaNextN(saga, 1)
        saga.next(projectId)
        saga.next(currentHighlights)
        sagaNextN(saga, 2)
        saga.next(data)
        saga.next(items)
        saga.next(item)
        sagaNextN(saga, 1)
        saga.next({ payload: { item: { highlights: currentHighlights } } })
        sagaNextN(saga, 1)
        expect(saga.next().value).toEqual(put(putProjectSuccess(payload)))
      })
    })
  })

  describe('watchPostProjectComment', () => {
    it('links to postProjectCommentSaga', () => {
      const saga = watchPostProjectComment()
      expect(saga.next().value).toEqual(takeLatest(POST_PROJECT_COMMENT, postProjectCommentSaga))
    })
  })

  describe('postProjectCommentSaga', () => {
    const comment = 'foo'
    const payload = { comment }
    const projectId = 'bar'
    const transactionId = 'project_comment'
    const postCommentBody = { comment }
    const logs = { data: [{ _id: 'foo' }, { _id: 'bar' }] }

    it('select selectProjectId', () => {
      const saga = postProjectCommentSaga({ payload })
      expect(saga.next().value).toEqual(select(selectProjectId))
    })

    it('puts postComment', () => {
      const saga = postProjectCommentSaga({ payload })
      sagaNextN(saga, 1)
      expect(saga.next(projectId).value).toEqual(put(postComment(postCommentBody, projectId, transactionId)))
    })

    it('takes POST_COMMENT_SUCCESS', () => {
      const saga = postProjectCommentSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(projectId)
      expect(saga.next().value).toEqual(take(POST_COMMENT_SUCCESS))
    })

    it('calls mapPostCommentResponseService', () => {
      const saga = postProjectCommentSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(projectId)
      sagaNextN(saga, 1)
      expect(saga.next({ payload: { logs } }).value).toEqual(call(mapPostCommentResponseService, logs.data[0]))
    })

    it('puts postProjectCommentSuccess', () => {
      const saga = postProjectCommentSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(projectId)
      sagaNextN(saga, 1)
      saga.next({ payload: { logs } })
      expect(saga.next(logs.data[0]).value).toEqual(put(postProjectCommentSuccess(logs.data[0])))
    })

    it('puts postProjectCommentFailure', () => {
      const saga = postProjectCommentSaga({ payload })
      sagaNextN(saga, 1)
      const err = new Error('error')
      expect(saga.throw(err).value).toEqual(put(postProjectCommentFailure(err)))
    })
  })

  describe('watchDeleteProject', () => {
    it('links to deleteProjectSaga', () => {
      const saga = watchDeleteProject()
      expect(saga.next().value).toEqual(takeLatest(DELETE_PROJECT, deleteProjectSaga))
    })
  })

  describe('deleteProjectSaga', () => {
    const projectId = 'foo'
    const payload = { projectId }
    const options = { method: 'DELETE' }
    const transactionId = 'delete_project'
    const url = 'bar'

    it('calls resolveApiUrl', () => {
      const saga = deleteProjectSaga({ payload })
      expect(saga.next().value).toEqual(call(resolveApiUrl, 'REACT_APP_PROJECT_ROUTE', { projectId }))
    })

    it('puts request', () => {
      const saga = deleteProjectSaga({ payload })
      sagaNextN(saga, 1)
      expect(saga.next(url).value).toEqual(put(request(url, options, transactionId)))
    })

    it('races put project result', () => {
      const saga = deleteProjectSaga({ payload })
      sagaNextN(saga, 2)
      expect(saga.next().value).toEqual(
        race({
          success: expect.anything(),
          failure: expect.anything(),
        })
      )
    })

    describe('Success put', () => {
      it('returns result', () => {
        const saga = deleteProjectSaga({ payload })
        sagaNextN(saga, 3)
        const data = { success: { payload: 'foo' } }
        expect(saga.next(data).value).toEqual(put(deleteProjectSuccess()))
      })

      it('navigates to /', () => {
        const saga = deleteProjectSaga({ payload })
        sagaNextN(saga, 3)
        const data = { success: { payload: 'foo' } }
        saga.next(data)
        expect(saga.next().value).toEqual(navigate('/'))
      })
    })

    describe('Failure put', () => {
      it('returns result', () => {
        const saga = deleteProjectSaga({ payload })
        sagaNextN(saga, 3)
        const data = { failure: { payload: { error: 'foo' } } }
        expect(saga.next(data).value).toEqual(put(deleteProjectFailure('foo')))
      })
    })

    it('puts deleteProjectFailure', () => {
      const saga = deleteProjectSaga({ payload })
      sagaNextN(saga, 1)
      const err = new Error('error')
      expect(saga.throw(err).value).toEqual(put(deleteProjectFailure(err)))
    })
  })

  describe('watchNavigateToItem', () => {
    it('links to putItemTagsSaga', () => {
      const saga = watchNavigateToItem()
      expect(saga.next().value).toEqual(takeLatest(NAVIGATE_TO_ITEM, navigateToItemSaga))
    })
  })

  describe('navigateToItemSaga', () => {
    const projectId = 'foo'
    const itemId = 'bar'
    const payload = { projectId, itemId }

    it('puts navigateToItemSuccess', () => {
      const saga = navigateToItemSaga({ payload })
      expect(saga.next().value).toEqual(put(navigateToItemSuccess()))
    })

    it('puts navigateToItemFailure if no projectId', () => {
      const saga = navigateToItemSaga({ payload: { itemId } })
      sagaNextN(saga, 1)
      const err = new Error('projectId does not exist !')
      expect(saga.throw(err).value).toEqual(put(navigateToItemFailure(err)))
    })

    it('puts navigateToItemFailure if no itemId', () => {
      const saga = navigateToItemSaga({ payload: { projectId } })
      sagaNextN(saga, 1)
      const err = new Error('itemId does not exist !')
      expect(saga.throw(err).value).toEqual(put(navigateToItemFailure(err)))
    })

    it('puts navigateToItemFailure', () => {
      const saga = navigateToItemSaga({ payload })
      sagaNextN(saga, 1)
      const err = new Error('error')
      expect(saga.throw(err).value).toEqual(put(navigateToItemFailure(err)))
    })
  })
})
