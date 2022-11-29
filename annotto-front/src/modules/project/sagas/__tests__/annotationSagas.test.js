import { call, put, race, select, take, takeLatest } from 'redux-saga/effects'
import { globalHistory, navigate } from '@reach/router'
import { isNil, noop, pickBy } from 'lodash'

import { sagaNextN } from 'setupTests'

import {
  FETCH_ANNOTATION_ITEM,
  FETCH_ANNOTATION_ITEM_SUCCESS,
  FETCH_CURRENT_ITEM_ANNOTATIONS,
  FETCH_CURRENT_ITEM_ANNOTATIONS_SUCCESS,
  FETCH_ITEM_LOGS,
  FETCH_ITEM_LOGS_SUCCESS,
  MOUNT_ANNOTATION_PAGE,
  NAVIGATE_TO_NEXT_ITEM,
  NAVIGATE_TO_NEXT_ITEM_SUCCESS,
  NAVIGATE_TO_PREV_ITEM,
  POST_ITEM_COMMENT,
  PUT_ITEM_TAGS,
  RESET_ANNOTATION_ITEMS,
  RESET_ANNOTATION_ITEMS_SUCCESS,
  SET_CURRENT_ITEM,
  SET_CURRENT_ITEM_SUCCESS,
  UPDATE_CURRENT_ANNOTATION_ITEM,
  UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS,
  fetchAnnotationItem,
  fetchAnnotationItemFailure,
  fetchAnnotationItemSuccess,
  fetchCurrentItemAnnotations,
  fetchCurrentItemAnnotationsFailure,
  fetchCurrentItemAnnotationsSuccess,
  fetchItemLogs,
  fetchItemLogsFailure,
  fetchItemLogsSuccess,
  mountAnnotationPageFailure,
  mountAnnotationPageSuccess,
  navigateToNextItem,
  navigateToNextItemFailure,
  navigateToNextItemSuccess,
  navigateToPrevItemFailure,
  navigateToPrevItemSuccess,
  postItemCommentFailure,
  postItemCommentSuccess,
  putItemTagsFailure,
  putItemTagsSuccess,
  resetAnnotationItems,
  resetAnnotationItemsFailure,
  resetAnnotationItemsSuccess,
  setCurrentItem,
  setCurrentItemFailure,
  setCurrentItemSuccess,
  updateCurrentAnnotationItem,
  updateCurrentAnnotationItemFailure,
  updateCurrentAnnotationItemSuccess,
  SAVE_ANNOTATIONS_ITEM,
  saveAnnotationsItemFailure,
  saveAnnotationsItemSuccess,
} from 'modules/project/actions/annotationActions'
import { FETCH_LOGS_SUCCESS, POST_COMMENT_SUCCESS, fetchLogs, postComment } from 'shared/actions/logsActions'
import { FETCH_PROJECT_ITEMS_TAGS_SUCCESS, fetchProjectItemsTags } from 'modules/project/actions/projectActions'
import { request } from 'shared/actions/apiActions'

import {
  selectAnnotationItems,
  selectCurrentItem,
  selectCurrentItemId,
} from 'modules/project/selectors/annotationSelectors'
import { selectProjectFilterId, selectProjectId } from 'modules/project/selectors/projectSelectors'

import {
  fetchAnnotationItemSaga,
  fetchCurrentItemAnnotationsSaga,
  fetchItemLogsSaga,
  mountAnnotationPageSaga,
  navigateToNextItemSagas,
  navigateToPrevItemSagas,
  postItemCommentSaga,
  putItemTagsSaga,
  resetAnnotationItemsSaga,
  saveAnnotationsItemSagas,
  setCurrentItemSaga,
  updateCurrentAnnotationItemSagas,
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
  addLogsToItemService,
  filterAndAddAnnotationsToItemService,
  filterAndAddItemService,
  mapAnnotationItemResponseService,
  mapAnnotationsRequestService,
  updateItemsService,
} from 'modules/project/services/annotationServices'
import { mapAndSortLogsService } from 'modules/project/services/projectServices'

import { resolveApiUrl } from 'shared/utils/urlUtils'

import { initialState } from 'modules/project/reducers/projectReducer'

describe('annotationSagas', () => {
  describe('watchMountAnnotationPage', () => {
    it('links to mountAnnotationPageSaga', () => {
      const saga = watchMountAnnotationPage()
      expect(saga.next().value).toEqual(takeLatest(MOUNT_ANNOTATION_PAGE, mountAnnotationPageSaga))
    })
  })

  describe('mountAnnotationPageSaga', () => {
    const projectId = 'fooId'
    const itemId = 'barId'
    const item = { _id: 'foo' }
    const updatedItem = { _id: 'bar' }
    const items = []

    it('puts mountAnnotationPageFailure if no projectID', () => {
      const err = new Error(`projectId does not exist !`)
      const saga = mountAnnotationPageSaga()
      expect(saga.next().value).toEqual(put(mountAnnotationPageFailure(err)))
    })

    describe('mount annotation page with projectID', () => {
      beforeEach(() => {
        globalHistory.location.pathname = `/project/${projectId}/annotation`
      })

      it('puts resetAnnotationItems', () => {
        const saga = mountAnnotationPageSaga()
        expect(saga.next().value).toEqual(put(resetAnnotationItems()))
      })

      it('takes RESET_ANNOTATION_ITEMS_SUCCESS', () => {
        const saga = mountAnnotationPageSaga()
        sagaNextN(saga, 1)
        expect(saga.next().value).toEqual(take(RESET_ANNOTATION_ITEMS_SUCCESS))
      })

      describe('if no itemId', () => {
        it('puts navigateToNextItem', () => {
          const saga = mountAnnotationPageSaga()
          sagaNextN(saga, 2)
          expect(saga.next().value).toEqual(put(navigateToNextItem()))
        })

        it('takes NAVIGATE_TO_NEXT_ITEM_SUCCESS', () => {
          const saga = mountAnnotationPageSaga()
          sagaNextN(saga, 3)
          expect(saga.next().value).toEqual(take(NAVIGATE_TO_NEXT_ITEM_SUCCESS))
        })

        it('puts mountAnnotationPageSuccess', () => {
          const saga = mountAnnotationPageSaga()
          sagaNextN(saga, 4)
          expect(saga.next().value).toEqual(put(mountAnnotationPageSuccess(true)))
        })
      })

      describe('if itemId', () => {
        beforeEach(() => {
          globalHistory.location.pathname = `/project/${projectId}/annotation/${itemId}`
        })

        it('puts fetchAnnotationItem', () => {
          const saga = mountAnnotationPageSaga()
          sagaNextN(saga, 2)
          expect(saga.next().value).toEqual(put(fetchAnnotationItem(itemId, projectId)))
        })

        it('takes FETCH_ANNOTATION_ITEM_SUCCESS', () => {
          const saga = mountAnnotationPageSaga()
          sagaNextN(saga, 3)
          expect(saga.next().value).toEqual(take(FETCH_ANNOTATION_ITEM_SUCCESS))
        })

        it('puts fetchCurrentItemAnnotations', () => {
          const saga = mountAnnotationPageSaga()
          sagaNextN(saga, 4)
          expect(saga.next({ payload: { item } }).value).toEqual(put(fetchCurrentItemAnnotations(item, projectId)))
        })

        it('takes FETCH_CURRENT_ITEM_ANNOTATIONS_SUCCESS', () => {
          const saga = mountAnnotationPageSaga()
          sagaNextN(saga, 4)
          saga.next({ payload: { item } })
          expect(saga.next().value).toEqual(take(FETCH_CURRENT_ITEM_ANNOTATIONS_SUCCESS))
        })

        it('puts setCurrentItem', () => {
          const saga = mountAnnotationPageSaga()
          sagaNextN(saga, 4)
          saga.next({ payload: { item } })
          sagaNextN(saga, 1)
          expect(saga.next({ payload: { updatedItem } }).value).toEqual(put(setCurrentItem(item._id)))
        })

        it('takes SET_CURRENT_ITEM_SUCCESS', () => {
          const saga = mountAnnotationPageSaga()
          sagaNextN(saga, 4)
          saga.next({ payload: { item } })
          sagaNextN(saga, 1)
          saga.next({ payload: { item: updatedItem } })
          expect(saga.next().value).toEqual(take(SET_CURRENT_ITEM_SUCCESS))
        })

        it('puts updateCurrentAnnotationItem', () => {
          const saga = mountAnnotationPageSaga()
          sagaNextN(saga, 4)
          saga.next({ payload: { item } })
          sagaNextN(saga, 1)
          saga.next({ payload: { item: updatedItem } })
          sagaNextN(saga, 1)
          expect(saga.next().value).toEqual(put(updateCurrentAnnotationItem(updatedItem, items)))
        })

        it('takes UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS', () => {
          const saga = mountAnnotationPageSaga()
          sagaNextN(saga, 4)
          saga.next({ payload: { item } })
          sagaNextN(saga, 1)
          saga.next({ payload: { item: updatedItem } })
          sagaNextN(saga, 2)
          expect(saga.next().value).toEqual(take(UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS))
        })
      })
    })

    it('puts mountAnnotationPageFailure', () => {
      const saga = mountAnnotationPageSaga()
      sagaNextN(saga, 1)
      const err = new Error('error')
      expect(saga.throw(err).value).toEqual(put(mountAnnotationPageFailure(err)))
    })
  })

  describe('watchFetchAnnotationItem', () => {
    it('links to fetchAnnotationItemSaga', () => {
      const saga = watchFetchAnnotationItem()
      expect(saga.next().value).toEqual(takeLatest(FETCH_ANNOTATION_ITEM, fetchAnnotationItemSaga))
    })
  })

  describe('fetchAnnotationItemSaga', () => {
    const projectId = 'bar'
    const itemId = 'foo'
    const payload = { itemId, projectId }

    const transactionId = 'project_item'
    const url = resolveApiUrl('REACT_APP_PROJECT_ITEM_ROUTE', { projectId, itemId })

    it('calls resolveApiUrl', () => {
      const saga = fetchAnnotationItemSaga({ payload })
      expect(saga.next().value).toEqual(call(resolveApiUrl, 'REACT_APP_PROJECT_ITEM_ROUTE', { projectId, itemId }))
    })

    it('puts request', () => {
      const saga = fetchAnnotationItemSaga({ payload })
      sagaNextN(saga, 1)
      expect(saga.next(url).value).toEqual(put(request(url, null, transactionId)))
    })

    it('takes item fetching result', () => {
      const saga = fetchAnnotationItemSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(url)
      expect(saga.next().value).toEqual(
        race({
          success: expect.anything(),
          failure: expect.anything(),
        })
      )
    })

    describe('Success fetch annotationItem', () => {
      const success = { payload: { responseBody: 'bar' } }
      const data = success.payload.responseBody

      it('calls mapAnnotationItemResponseService', () => {
        const saga = fetchAnnotationItemSaga({ payload })
        sagaNextN(saga, 1)
        saga.next(url)
        sagaNextN(saga, 1)
        expect(saga.next({ success }).value).toEqual(
          call(mapAnnotationItemResponseService, success.payload.responseBody)
        )
      })

      it('puts fetchAnnotationItemSuccess', () => {
        const saga = fetchAnnotationItemSaga({ payload })
        sagaNextN(saga, 1)
        saga.next(url)
        sagaNextN(saga, 1)
        saga.next({ success })
        expect(saga.next(data).value).toEqual(put(fetchAnnotationItemSuccess(data)))
      })
    })

    describe('Failure fetch annotationItem', () => {
      const failure = { payload: { error: 'foo' } }
      it('returns fetchAnnotationItemFailure', () => {
        const saga = fetchAnnotationItemSaga({ payload })
        sagaNextN(saga, 1)
        saga.next(url)
        sagaNextN(saga, 1)
        expect(saga.next({ failure }).value).toEqual(put(fetchAnnotationItemFailure(failure.payload.error)))
      })
    })

    it('puts fetchAnnotationItemFailure', () => {
      const saga = fetchAnnotationItemSaga({ payload })
      sagaNextN(saga, 1)
      const err = new Error('error')
      expect(saga.throw(err).value).toEqual(put(fetchAnnotationItemFailure(err)))
    })
  })

  describe('watchFetchCurrentItem', () => {
    it('links to fetchCurrentItemAnnotationsSaga', () => {
      const saga = watchFetchCurrentItem()
      expect(saga.next().value).toEqual(takeLatest(FETCH_CURRENT_ITEM_ANNOTATIONS, fetchCurrentItemAnnotationsSaga))
    })
  })

  describe('fetchCurrentItemAnnotationsSaga', () => {
    const item = { _id: 'foo', value: 'foo' }
    const projectId = 'bar'
    const payload = { item, projectId }
    const logs = { data: ['foo'] }
    const updatedItem = { _id: 'foo', value: 'bar' }
    const dataLogs = logs.data

    const transactionId = 'item_annotation'
    const url = resolveApiUrl('REACT_APP_PROJECT_ITEM_ANNOTATIONS_ROUTE', { projectId, itemId: item._id })

    it('calls resolveApiUrl', () => {
      const saga = fetchCurrentItemAnnotationsSaga({ payload })
      expect(saga.next().value).toEqual(
        call(resolveApiUrl, 'REACT_APP_PROJECT_ITEM_ANNOTATIONS_ROUTE', { projectId, itemId: item._id })
      )
    })

    it('puts request', () => {
      const saga = fetchCurrentItemAnnotationsSaga({ payload })
      sagaNextN(saga, 1)
      expect(saga.next(url).value).toEqual(put(request(url, null, transactionId)))
    })

    it('takes current item fetching result', () => {
      const saga = fetchCurrentItemAnnotationsSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(url)
      expect(JSON.stringify(saga.next().value)).toEqual(JSON.stringify(take(noop)))
    })

    it('calls filterAndAddAnnotationsToItemService', () => {
      const saga = fetchCurrentItemAnnotationsSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(url)
      sagaNextN(saga, 1)
      expect(saga.next({ payload }).value).toEqual(
        call(filterAndAddAnnotationsToItemService, payload.responseBody, item)
      )
    })

    it('puts fetchItemLogs', () => {
      const saga = fetchCurrentItemAnnotationsSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(url)
      sagaNextN(saga, 1)
      saga.next({ payload })
      expect(saga.next(updatedItem).value).toEqual(put(fetchItemLogs(item._id)))
    })

    it('takes FETCH_ITEM_LOGS_SUCCESS', () => {
      const saga = fetchCurrentItemAnnotationsSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(url)
      sagaNextN(saga, 1)
      saga.next({ payload })
      saga.next(updatedItem)
      expect(saga.next().value).toEqual(take(FETCH_ITEM_LOGS_SUCCESS))
    })

    it('calls mapAndSortLogsService', () => {
      const saga = fetchCurrentItemAnnotationsSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(url)
      sagaNextN(saga, 1)
      saga.next({ payload })
      saga.next(updatedItem)
      sagaNextN(saga, 1)
      expect(saga.next({ payload: { logs } }).value).toEqual(call(mapAndSortLogsService, logs.data))
    })

    it('calls mapAnnotationItemResponseService', () => {
      const saga = fetchCurrentItemAnnotationsSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(url)
      sagaNextN(saga, 1)
      saga.next({ payload })
      saga.next(updatedItem)
      sagaNextN(saga, 1)
      saga.next({ payload: { logs } })
      expect(saga.next(dataLogs).value).toEqual(call(mapAnnotationItemResponseService, updatedItem))
    })

    it('calls addLogsToItemService', () => {
      const saga = fetchCurrentItemAnnotationsSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(url)
      sagaNextN(saga, 1)
      saga.next({ payload })
      saga.next(updatedItem)
      sagaNextN(saga, 1)
      saga.next({ payload: { logs } })
      saga.next(dataLogs)
      expect(saga.next(updatedItem).value).toEqual(call(addLogsToItemService, { ...logs, data: dataLogs }, updatedItem))
    })

    it('puts fetchCurrentItemAnnotationsSuccess', () => {
      const saga = fetchCurrentItemAnnotationsSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(url)
      sagaNextN(saga, 1)
      saga.next({ payload })
      saga.next(updatedItem)
      sagaNextN(saga, 1)
      saga.next({ payload: { logs } })
      saga.next(dataLogs)
      saga.next(updatedItem)
      expect(saga.next(updatedItem).value).toEqual(put(fetchCurrentItemAnnotationsSuccess(updatedItem)))
    })

    it('puts fetchCurrentItemAnnotationsFailure', () => {
      const saga = fetchCurrentItemAnnotationsSaga({ payload })
      sagaNextN(saga, 1)
      const err = new Error('error')
      expect(saga.throw(err).value).toEqual(put(fetchCurrentItemAnnotationsFailure(err)))
    })
  })

  describe('watchResetAnnotationItems', () => {
    it('links to resetAnnotationItemsSaga', () => {
      const saga = watchResetAnnotationItems()
      expect(saga.next().value).toEqual(takeLatest(RESET_ANNOTATION_ITEMS, resetAnnotationItemsSaga))
    })
  })

  describe('resetAnnotationItemsSaga', () => {
    it('puts resetAnnotationItemsSuccess', () => {
      const saga = resetAnnotationItemsSaga()
      expect(saga.next().value).toEqual(put(resetAnnotationItemsSuccess(initialState.annotation.items)))
    })

    it('puts resetAnnotationItemsFailure', () => {
      const saga = resetAnnotationItemsSaga()
      sagaNextN(saga, 1)
      const err = new Error('error')
      expect(saga.throw(err).value).toEqual(put(resetAnnotationItemsFailure(err)))
    })
  })

  describe('watchSetCurrentItem', () => {
    it('links to setCurrentItemSaga', () => {
      const saga = watchSetCurrentItem()
      expect(saga.next().value).toEqual(takeLatest(SET_CURRENT_ITEM, setCurrentItemSaga))
    })
  })

  describe('setCurrentItemSaga', () => {
    const payload = { itemId: 'foo' }
    it('puts setCurrentItemSuccess', () => {
      const saga = setCurrentItemSaga({ payload })
      expect(saga.next().value).toEqual(put(setCurrentItemSuccess(payload.itemId)))
    })

    it('puts setCurrentItemFailure', () => {
      const saga = setCurrentItemSaga({ payload })
      sagaNextN(saga, 1)
      const err = new Error('error')
      expect(saga.throw(err).value).toEqual(put(setCurrentItemFailure(err)))
    })
  })

  describe('watchUpdateCurrentAnnotationItem', () => {
    it('links to updateCurrentAnnotationItemSagas', () => {
      const saga = watchUpdateCurrentAnnotationItem()
      expect(saga.next().value).toEqual(takeLatest(UPDATE_CURRENT_ANNOTATION_ITEM, updateCurrentAnnotationItemSagas))
    })
  })

  describe('updateCurrentAnnotationItemSagas', () => {
    const item = { _id: 'foo', value: 'foo' }
    const items = [{ _id: 'foo', value: 'bar' }]
    const payload = { item, items }
    const updatedItems = [{ _id: 'foo', value: 'foo' }]

    it('calls updateItemsService', () => {
      const saga = updateCurrentAnnotationItemSagas({ payload })
      expect(saga.next().value).toEqual(call(updateItemsService, items, item))
    })

    it('puts updateCurrentAnnotationItemSuccess', () => {
      const saga = updateCurrentAnnotationItemSagas({ payload })
      sagaNextN(saga, 1)
      expect(saga.next(updatedItems).value).toEqual(put(updateCurrentAnnotationItemSuccess(updatedItems)))
    })

    it('puts updateCurrentAnnotationItemFailure', () => {
      const saga = updateCurrentAnnotationItemSagas({ payload })
      sagaNextN(saga, 1)
      const err = new Error('error')
      expect(saga.throw(err).value).toEqual(put(updateCurrentAnnotationItemFailure(err)))
    })
  })

  describe('watchNavigateToNextItem', () => {
    it('links to navigateToNextItemSagas', () => {
      const saga = watchNavigateToNextItem()
      expect(saga.next().value).toEqual(takeLatest(NAVIGATE_TO_NEXT_ITEM, navigateToNextItemSagas))
    })
  })

  describe('navigateToNextItemSagas', () => {
    const transactionId = 'item'
    const projectId = 'projectId'
    const filterId = 'filterId'

    const items = [
      { _id: 'bar', value: 'foo' },
      { _id: 'foo', value: 'foo' },
    ]
    let currentItemId = items[1]._id
    const item = [{ _id: 'bar', value: 'bar' }]
    const updatedItem = { ...item, bar: 'bar' }
    const updatedItemWithAnnotations = { ...updatedItem, annotations: ['foo'] }
    const options = {
      query: {
        filterId,
      },
    }
    const url = resolveApiUrl('REACT_APP_PROJECT_ITEM_NEXT_ROUTE', { projectId })

    it('selects selectProjectId', () => {
      const saga = navigateToNextItemSagas()
      expect(saga.next().value).toEqual(select(selectProjectId))
    })

    it('selects filterId', () => {
      const saga = navigateToNextItemSagas()
      saga.next()
      expect(saga.next(projectId).value).toEqual(select(selectProjectFilterId))
    })

    it('selects currentItemId', () => {
      const saga = navigateToNextItemSagas()
      saga.next()
      saga.next(projectId)
      expect(saga.next(filterId).value).toEqual(select(selectCurrentItemId))
    })

    it('selects selectAnnotationItems', () => {
      const saga = navigateToNextItemSagas()
      saga.next()
      saga.next(projectId)
      saga.next(filterId)
      expect(saga.next(currentItemId).value).toEqual(select(selectAnnotationItems))
    })

    describe('if currentItem is the last item in the items list or if no currentItem', () => {
      const cases = [
        { currentItemId, title: 'if currentItemIndex === items.length - 1' },
        { currentItemId: null, title: '!currentItemId' },
      ]

      cases.forEach(({ currentItemId: itemId, title }) => {
        describe(title, () => {
          it('calls resolveApiUrl', () => {
            const saga = navigateToNextItemSagas()
            saga.next()
            saga.next(projectId)
            saga.next(filterId)
            saga.next(itemId)
            expect(saga.next(items).value).toEqual(
              call(resolveApiUrl, 'REACT_APP_PROJECT_ITEM_NEXT_ROUTE', { projectId })
            )
          })

          it('puts request', () => {
            const saga = navigateToNextItemSagas()
            saga.next()
            saga.next(projectId)
            saga.next(filterId)
            saga.next(itemId)
            saga.next(items)
            expect(saga.next(url).value).toEqual(put(request(url, options, transactionId)))
          })

          it('takes item fetching result', () => {
            const saga = navigateToNextItemSagas()
            saga.next()
            saga.next(projectId)
            saga.next(filterId)
            saga.next(itemId)
            saga.next(items)
            saga.next(url)
            expect(JSON.stringify(saga.next().value)).toEqual(JSON.stringify(take(noop)))
          })

          it('calls filterAndAddItemService', () => {
            const saga = navigateToNextItemSagas()
            saga.next()
            saga.next(projectId)
            saga.next(filterId)
            saga.next(itemId)
            saga.next(items)
            saga.next(url)
            saga.next()
            expect(saga.next({ payload: { responseBody: item } }).value).toEqual(
              call(filterAndAddItemService, items, item)
            )
          })

          it('puts updateCurrentAnnotationItem', () => {
            const saga = navigateToNextItemSagas()
            saga.next()
            saga.next(projectId)
            saga.next(filterId)
            saga.next(itemId)
            saga.next(items)
            saga.next(url)
            saga.next()
            saga.next({ payload: { responseBody: item } })
            expect(saga.next(items).value).toEqual(put(updateCurrentAnnotationItem(item, items)))
          })

          it('takes UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS', () => {
            const saga = navigateToNextItemSagas()
            saga.next()
            saga.next(projectId)
            saga.next(filterId)
            saga.next(itemId)
            saga.next(items)
            saga.next(url)
            saga.next()
            saga.next({ payload: { responseBody: item } })
            saga.next(items)
            expect(saga.next().value).toEqual(take(UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS))
          })

          describe('if item and item is an object', () => {
            it('puts fetchAnnotationItem', () => {
              const saga = navigateToNextItemSagas()
              saga.next()
              saga.next(projectId)
              saga.next(filterId)
              saga.next(itemId)
              saga.next(items)
              saga.next(url)
              saga.next()
              saga.next({ payload: { responseBody: item } })
              saga.next(items)
              saga.next()
              expect(saga.next().value).toEqual(put(fetchAnnotationItem(item._id, projectId)))
            })

            it('takes FETCH_ANNOTATION_ITEM_SUCCESS', () => {
              const saga = navigateToNextItemSagas()
              saga.next()
              saga.next(projectId)
              saga.next(filterId)
              saga.next(itemId)
              saga.next(items)
              saga.next(url)
              saga.next()
              saga.next({ payload: { responseBody: item } })
              saga.next(items)
              sagaNextN(saga, 2)
              expect(saga.next().value).toEqual(take(FETCH_ANNOTATION_ITEM_SUCCESS))
            })

            it('puts setCurrentItem', () => {
              const saga = navigateToNextItemSagas()
              saga.next()
              saga.next(projectId)
              saga.next(filterId)
              saga.next(itemId)
              saga.next(items)
              saga.next(url)
              saga.next()
              saga.next({ payload: { responseBody: item } })
              saga.next(items)
              sagaNextN(saga, 3)
              expect(
                saga.next({
                  payload: { item: updatedItem },
                }).value
              ).toEqual(put(setCurrentItem(item._id)))
            })

            it('takes SET_CURRENT_ITEM_SUCCESS', () => {
              const saga = navigateToNextItemSagas()
              saga.next()
              saga.next(projectId)
              saga.next(filterId)
              saga.next(itemId)
              saga.next(items)
              saga.next(url)
              saga.next()
              saga.next({ payload: { responseBody: item } })
              saga.next(items)
              sagaNextN(saga, 3)
              saga.next({ payload: { item: updatedItem } })
              expect(saga.next().value).toEqual(take(SET_CURRENT_ITEM_SUCCESS))
            })

            it('calls navigate', () => {
              const saga = navigateToNextItemSagas()
              saga.next()
              saga.next(projectId)
              saga.next(filterId)
              saga.next(itemId)
              saga.next(items)
              saga.next(url)
              saga.next()
              saga.next({ payload: { responseBody: item } })
              saga.next(items)
              sagaNextN(saga, 3)
              saga.next({ payload: { item: updatedItem } })
              sagaNextN(saga, 1)
              expect(saga.next().value).toEqual(call(navigate, `/project/${projectId}/annotation/${item._id}`))
            })

            it('puts navigateToNextItemSuccess', () => {
              const saga = navigateToNextItemSagas()
              saga.next()
              saga.next(projectId)
              saga.next(filterId)
              saga.next(itemId)
              saga.next(items)
              saga.next(url)
              saga.next()
              saga.next({ payload: { responseBody: item } })
              saga.next(items)
              sagaNextN(saga, 3)
              saga.next({ payload: { item: updatedItem } })
              sagaNextN(saga, 2)
              expect(saga.next().value).toEqual(put(navigateToNextItemSuccess()))
            })

            it('puts fetchCurrentItemAnnotations', () => {
              const saga = navigateToNextItemSagas()
              saga.next()
              saga.next(projectId)
              saga.next(filterId)
              saga.next(itemId)
              saga.next(items)
              saga.next(url)
              saga.next()
              saga.next({ payload: { responseBody: item } })
              saga.next(items)
              sagaNextN(saga, 3)
              saga.next({ payload: { item: updatedItem } })
              sagaNextN(saga, 3)
              expect(saga.next().value).toEqual(put(fetchCurrentItemAnnotations(updatedItem, projectId)))
            })

            it('takes FETCH_CURRENT_ITEM_ANNOTATIONS_SUCCESS', () => {
              const saga = navigateToNextItemSagas()
              saga.next()
              saga.next(projectId)
              saga.next(filterId)
              saga.next(itemId)
              saga.next(items)
              saga.next(url)
              saga.next()
              saga.next({ payload: { responseBody: item } })
              saga.next(items)
              sagaNextN(saga, 3)
              saga.next({ payload: { item: updatedItem } })
              sagaNextN(saga, 4)
              expect(saga.next().value).toEqual(take(FETCH_CURRENT_ITEM_ANNOTATIONS_SUCCESS))
            })

            it('puts updateCurrentAnnotationItem', () => {
              const saga = navigateToNextItemSagas()
              saga.next()
              saga.next(projectId)
              saga.next(filterId)
              saga.next(itemId)
              saga.next(items)
              saga.next(url)
              saga.next()
              saga.next({ payload: { responseBody: item } })
              saga.next(items)
              sagaNextN(saga, 3)
              saga.next({ payload: { item: updatedItem } })
              sagaNextN(saga, 5)
              expect(saga.next({ payload: { item: updatedItemWithAnnotations } }).value).toEqual(
                put(updateCurrentAnnotationItem(updatedItemWithAnnotations, items))
              )
            })

            it('takes UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS', () => {
              const saga = navigateToNextItemSagas()
              saga.next()
              saga.next(projectId)
              saga.next(filterId)
              saga.next(itemId)
              saga.next(items)
              saga.next(url)
              saga.next()
              saga.next({ payload: { responseBody: item } })
              saga.next(items)
              sagaNextN(saga, 3)
              saga.next({ payload: { item: updatedItem } })
              sagaNextN(saga, 5)
              saga.next({ payload: { item: updatedItemWithAnnotations } })
              expect(saga.next().value).toEqual(take(UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS))
            })
          })

          const notItemCases = [
            {
              title: 'if !item',
              responseBody: null,
            },
            {
              title: 'if item but item is not an object',
              responseBody: 'foo',
            },
          ]

          notItemCases.forEach((notItemCase) => {
            describe(notItemCase.title, () => {
              it('puts setCurrentItem', () => {
                const saga = navigateToNextItemSagas()
                saga.next()
                saga.next(projectId)
                saga.next(filterId)
                saga.next(itemId)
                saga.next(items)
                saga.next(url)
                saga.next()
                saga.next({ payload: { responseBody: notItemCase.responseBody } })
                saga.next(items)
                saga.next()
                expect(saga.next().value).toEqual(put(setCurrentItem(null)))
              })

              it('takes SET_CURRENT_ITEM_SUCCESS', () => {
                const saga = navigateToNextItemSagas()
                saga.next()
                saga.next(projectId)
                saga.next(filterId)
                saga.next(itemId)
                saga.next(items)
                saga.next(url)
                saga.next()
                saga.next({ payload: { responseBody: notItemCase.responseBody } })
                saga.next(items)
                sagaNextN(saga, 2)
                expect(saga.next().value).toEqual(take(SET_CURRENT_ITEM_SUCCESS))
              })

              it('calls navigate', () => {
                const saga = navigateToNextItemSagas()
                saga.next()
                saga.next(projectId)
                saga.next(filterId)
                saga.next(itemId)
                saga.next(items)
                saga.next(url)
                saga.next()
                saga.next({ payload: { responseBody: notItemCase.responseBody } })
                saga.next(items)
                sagaNextN(saga, 3)
                expect(saga.next().value).toEqual(call(navigate, `/project/${projectId}/annotation`))
              })

              it('puts navigateToNextItemSuccess', () => {
                const saga = navigateToNextItemSagas()
                saga.next()
                saga.next(projectId)
                saga.next(filterId)
                saga.next(itemId)
                saga.next(items)
                saga.next(url)
                saga.next()
                saga.next({ payload: { responseBody: notItemCase.responseBody } })
                saga.next(items)
                sagaNextN(saga, 4)
                expect(saga.next().value).toEqual(put(navigateToNextItemSuccess()))
              })
            })
          })
        })
      })
    })

    describe('if currentItem is not the last item of the list', () => {
      currentItemId = items[0]._id
      const secondItem = items[1]

      it('puts fetchAnnotationItem', () => {
        const saga = navigateToNextItemSagas()
        saga.next()
        saga.next(projectId)
        saga.next(filterId)
        saga.next(currentItemId)
        expect(saga.next(items).value).toEqual(put(fetchAnnotationItem(secondItem._id, projectId)))
      })

      it('takes FETCH_ANNOTATION_ITEM_SUCCESS', () => {
        const saga = navigateToNextItemSagas()
        saga.next()
        saga.next(projectId)
        saga.next(filterId)
        saga.next(currentItemId)
        saga.next(items)
        expect(saga.next().value).toEqual(take(FETCH_ANNOTATION_ITEM_SUCCESS))
      })

      it('puts setCurrentItem', () => {
        const saga = navigateToNextItemSagas()
        saga.next()
        saga.next(projectId)
        saga.next(filterId)
        saga.next(currentItemId)
        saga.next(items)
        sagaNextN(saga, 1)
        expect(
          saga.next({
            payload: { item: updatedItem },
          }).value
        ).toEqual(put(setCurrentItem(secondItem._id)))
      })

      it('takes SET_CURRENT_ITEM_SUCCESS', () => {
        const saga = navigateToNextItemSagas()
        saga.next()
        saga.next(projectId)
        saga.next(filterId)
        saga.next(currentItemId)
        saga.next(items)
        sagaNextN(saga, 1)
        saga.next({ payload: { item: updatedItem } })
        expect(saga.next().value).toEqual(take(SET_CURRENT_ITEM_SUCCESS))
      })

      it('calls navigate', () => {
        const saga = navigateToNextItemSagas()
        saga.next()
        saga.next(projectId)
        saga.next(filterId)
        saga.next(currentItemId)
        saga.next(items)
        sagaNextN(saga, 1)
        saga.next({ payload: { item: updatedItem } })
        sagaNextN(saga, 1)
        expect(saga.next().value).toEqual(call(navigate, `/project/${projectId}/annotation/${secondItem._id}`))
      })

      it('puts navigateToNextItemSuccess', () => {
        const saga = navigateToNextItemSagas()
        saga.next()
        saga.next(projectId)
        saga.next(filterId)
        saga.next(currentItemId)
        saga.next(items)
        sagaNextN(saga, 1)
        saga.next({ payload: { item: updatedItem } })
        sagaNextN(saga, 2)
        expect(saga.next().value).toEqual(put(navigateToNextItemSuccess()))
      })

      it('puts fetchCurrentItemAnnotations', () => {
        const saga = navigateToNextItemSagas()
        saga.next()
        saga.next(projectId)
        saga.next(filterId)
        saga.next(currentItemId)
        saga.next(items)
        sagaNextN(saga, 1)
        saga.next({ payload: { item: updatedItem } })
        sagaNextN(saga, 3)
        expect(saga.next().value).toEqual(put(fetchCurrentItemAnnotations(updatedItem, projectId)))
      })

      it('takes FETCH_CURRENT_ITEM_ANNOTATIONS_SUCCESS', () => {
        const saga = navigateToNextItemSagas()
        saga.next()
        saga.next(projectId)
        saga.next(filterId)
        saga.next(currentItemId)
        saga.next(items)
        sagaNextN(saga, 1)
        saga.next({ payload: { item: updatedItem } })
        sagaNextN(saga, 4)
        expect(saga.next().value).toEqual(take(FETCH_CURRENT_ITEM_ANNOTATIONS_SUCCESS))
      })

      it('puts updateCurrentAnnotationItem', () => {
        const saga = navigateToNextItemSagas()
        saga.next()
        saga.next(projectId)
        saga.next(filterId)
        saga.next(currentItemId)
        saga.next(items)
        sagaNextN(saga, 1)
        saga.next({ payload: { item: updatedItem } })
        sagaNextN(saga, 5)
        expect(saga.next({ payload: { item: updatedItemWithAnnotations } }).value).toEqual(
          put(updateCurrentAnnotationItem(updatedItemWithAnnotations, items))
        )
      })

      it('takes UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS', () => {
        const saga = navigateToNextItemSagas()
        saga.next()
        saga.next(projectId)
        saga.next(filterId)
        saga.next(currentItemId)
        saga.next(items)
        sagaNextN(saga, 1)
        saga.next({ payload: { item: updatedItem } })
        sagaNextN(saga, 5)
        saga.next({ payload: { item: updatedItemWithAnnotations } })
        expect(saga.next().value).toEqual(take(UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS))
      })
    })

    it('puts navigateToNextItemFailure', () => {
      const saga = navigateToNextItemSagas()
      sagaNextN(saga, 1)
      const err = new Error('error')
      expect(saga.throw(err).value).toEqual(put(navigateToNextItemFailure(err)))
    })
  })

  describe('watchNavigateToPrevItem', () => {
    it('links to navigateToPrevItemSagas', () => {
      const saga = watchNavigateToPrevItem()
      expect(saga.next().value).toEqual(takeLatest(NAVIGATE_TO_PREV_ITEM, navigateToPrevItemSagas))
    })
  })

  describe('navigateToPrevItemSagas', () => {
    const projectId = 'projectId'
    const currentItemId = 'foo'
    const item = { _id: currentItemId, value: 'foo' }
    const items = [{ _id: 'bar', value: 'foo' }, item]
    const updatedItem = { ...item, bar: 'bar' }
    const updatedItemWithAnnotations = { ...updatedItem, annotations: ['foo'] }

    it('selects annotationItems', () => {
      const saga = navigateToPrevItemSagas()
      expect(saga.next().value).toEqual(select(selectAnnotationItems))
    })

    it('selects currentItemId', () => {
      const saga = navigateToPrevItemSagas()
      sagaNextN(saga, 1)
      expect(saga.next(items).value).toEqual(select(selectCurrentItemId))
    })

    it('selects projectId', () => {
      const saga = navigateToPrevItemSagas()
      sagaNextN(saga, 1)
      saga.next(items)
      expect(saga.next(currentItemId).value).toEqual(select(selectProjectId))
    })

    describe('if a previous item exist in the array of items', () => {
      const cases = [
        { currentItemId, title: 'currentItemId is defined', previousItem: items[0] },
        { currentItemId: null, title: 'currentItemId is not defined', previousItem: items[items.length - 1] },
      ]

      cases.forEach(({ currentItemId: newCurrentItemId, previousItem, title }) => {
        describe(title, () => {
          it('puts fetchAnnotationItem', () => {
            const saga = navigateToPrevItemSagas()
            sagaNextN(saga, 1)
            saga.next(items)
            saga.next(newCurrentItemId)
            expect(saga.next(projectId).value).toEqual(put(fetchAnnotationItem(previousItem._id, projectId)))
          })

          it('takes FETCH_ANNOTATION_ITEM_SUCCESS', () => {
            const saga = navigateToPrevItemSagas()
            sagaNextN(saga, 1)
            saga.next(items)
            saga.next(newCurrentItemId)
            saga.next(projectId)
            expect(saga.next().value).toEqual(take(FETCH_ANNOTATION_ITEM_SUCCESS))
          })

          it('puts setCurrentItem', () => {
            const saga = navigateToPrevItemSagas()
            sagaNextN(saga, 1)
            saga.next(items)
            saga.next(newCurrentItemId)
            saga.next(projectId)
            sagaNextN(saga, 1)
            expect(saga.next({ payload: { item: updatedItem } }).value).toEqual(put(setCurrentItem(previousItem._id)))
          })

          it('takes SET_CURRENT_ITEM_SUCCESS', () => {
            const saga = navigateToPrevItemSagas()
            sagaNextN(saga, 1)
            saga.next(items)
            saga.next(newCurrentItemId)
            saga.next(projectId)
            sagaNextN(saga, 1)
            saga.next({ payload: { item: updatedItem } })
            expect(saga.next().value).toEqual(take(SET_CURRENT_ITEM_SUCCESS))
          })

          it('calls navigate', () => {
            const saga = navigateToPrevItemSagas()
            sagaNextN(saga, 1)
            saga.next(items)
            saga.next(newCurrentItemId)
            saga.next(projectId)
            sagaNextN(saga, 1)
            saga.next({ payload: { item: updatedItem } })
            sagaNextN(saga, 1)
            expect(saga.next().value).toEqual(call(navigate, `/project/${projectId}/annotation/${previousItem._id}`))
          })

          it('puts fetchCurrentItemAnnotations', () => {
            const saga = navigateToPrevItemSagas()
            sagaNextN(saga, 1)
            saga.next(items)
            saga.next(newCurrentItemId)
            saga.next(projectId)
            sagaNextN(saga, 1)
            saga.next({ payload: { item: updatedItem } })
            sagaNextN(saga, 2)
            expect(saga.next().value).toEqual(put(fetchCurrentItemAnnotations(updatedItem, projectId)))
          })

          it('takes FETCH_CURRENT_ITEM_ANNOTATIONS_SUCCESS', () => {
            const saga = navigateToPrevItemSagas()
            sagaNextN(saga, 1)
            saga.next(items)
            saga.next(newCurrentItemId)
            saga.next(projectId)
            sagaNextN(saga, 1)
            saga.next({ payload: { item: updatedItem } })
            sagaNextN(saga, 3)
            expect(saga.next().value).toEqual(take(FETCH_CURRENT_ITEM_ANNOTATIONS_SUCCESS))
          })

          it('puts updateCurrentAnnotationItem', () => {
            const saga = navigateToPrevItemSagas()
            sagaNextN(saga, 1)
            saga.next(items)
            saga.next(newCurrentItemId)
            saga.next(projectId)
            sagaNextN(saga, 1)
            saga.next({ payload: { item: updatedItem } })
            sagaNextN(saga, 4)
            expect(saga.next({ payload: { item: updatedItemWithAnnotations } }).value).toEqual(
              put(updateCurrentAnnotationItem(updatedItemWithAnnotations, items))
            )
          })

          it('take UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS', () => {
            const saga = navigateToPrevItemSagas()
            sagaNextN(saga, 1)
            saga.next(items)
            saga.next(newCurrentItemId)
            saga.next(projectId)
            sagaNextN(saga, 1)
            saga.next({ payload: { item: updatedItem } })
            sagaNextN(saga, 4)
            saga.next({ payload: { item: updatedItemWithAnnotations } })
            expect(saga.next().value).toEqual(take(UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS))
          })

          it('puts navigateToPrevItemSuccess', () => {
            const saga = navigateToPrevItemSagas()
            sagaNextN(saga, 1)
            saga.next(items)
            saga.next(newCurrentItemId)
            saga.next(projectId)
            sagaNextN(saga, 1)
            saga.next({ payload: { item: updatedItem } })
            sagaNextN(saga, 4)
            saga.next({ payload: { item: updatedItemWithAnnotations } })
            saga.next()
            expect(saga.next().value).toEqual(put(navigateToPrevItemSuccess()))
          })
        })
      })
    })

    describe('if no previous item in the array of items', () => {
      it('puts navigateToPrevItemFailure', () => {
        const error = new Error('No previous item available')
        const saga = navigateToPrevItemSagas()
        sagaNextN(saga, 1)
        saga.next(items)
        saga.next(items[0]._id)
        expect(saga.next(projectId).value).toEqual(put(navigateToPrevItemFailure(error)))
      })
    })

    it('puts navigateToPrevItemFailure', () => {
      const saga = navigateToPrevItemSagas()
      sagaNextN(saga, 1)
      const err = new Error('error')
      expect(saga.throw(err).value).toEqual(put(navigateToPrevItemFailure(err)))
    })
  })

  describe('watchSaveAnnotationsItem', () => {
    it('links to saveAnnotationsItemSagas', () => {
      const saga = watchSaveAnnotationsItem()
      expect(saga.next().value).toEqual(takeLatest(SAVE_ANNOTATIONS_ITEM, saveAnnotationsItemSagas))
    })
  })

  describe('saveAnnotationsItemSagas', () => {
    const transactionId = 'annotation'
    const projectId = 'foo'
    const itemId = 'bar'
    const annotations = ['foo']
    const entitiesRelations = ['bar']
    const payload = { itemId, projectId, annotations, entitiesRelations }
    const url = resolveApiUrl('REACT_APP_PROJECT_ITEM_ANNOTATE_ROUTE', { projectId, itemId })
    const success = { payload: { responseBody: 'bar' } }
    const failure = { payload: { error: 'foo' } }

    it('calls resolveApiUrl', () => {
      const saga = saveAnnotationsItemSagas({ payload })
      expect(saga.next().value).toEqual(
        call(resolveApiUrl, 'REACT_APP_PROJECT_ITEM_ANNOTATE_ROUTE', { projectId, itemId })
      )
    })

    it('calls mapAnnotationsRequestService', () => {
      const saga = saveAnnotationsItemSagas({ payload })
      sagaNextN(saga, 1)
      expect(saga.next(url).value).toEqual(call(mapAnnotationsRequestService, annotations))
    })

    it('puts request', () => {
      const options = {
        method: 'POST',
        body: pickBy({ annotations, entitiesRelations }, (value) => !isNil(value)),
      }

      const saga = saveAnnotationsItemSagas({ payload })
      sagaNextN(saga, 1)
      saga.next(url)
      expect(saga.next(annotations).value).toEqual(put(request(url, options, transactionId)))
    })

    it('takes item posting result', () => {
      const saga = saveAnnotationsItemSagas({ payload })
      sagaNextN(saga, 1)
      saga.next(url)
      saga.next(annotations)
      expect(saga.next().value).toEqual(
        race({
          success: expect.anything(),
          failure: expect.anything(),
        })
      )
    })

    describe('Success post annotate', () => {
      it('puts saveAnnotationsItemSuccess', () => {
        const saga = saveAnnotationsItemSagas({ payload })
        sagaNextN(saga, 1)
        saga.next(url)
        saga.next(annotations)
        sagaNextN(saga, 1)
        expect(saga.next({ success }).value).toEqual(put(saveAnnotationsItemSuccess(success.payload)))
      })

      it('puts navigateToNextItem', () => {
        const saga = saveAnnotationsItemSagas({ payload })
        sagaNextN(saga, 1)
        saga.next(url)
        saga.next(annotations)
        sagaNextN(saga, 1)
        saga.next({ success })
        expect(saga.next().value).toEqual(put(navigateToNextItem()))
      })
    })

    describe('Failure post annotate', () => {
      it('puts saveAnnotationsItemFailure', () => {
        const saga = saveAnnotationsItemSagas({ payload })
        sagaNextN(saga, 1)
        saga.next(url)
        saga.next(annotations)
        sagaNextN(saga, 1)
        expect(saga.next({ failure }).value).toEqual(put(saveAnnotationsItemFailure(failure.payload.error)))
      })
    })

    it('puts saveAnnotationsItemFailure', () => {
      const saga = saveAnnotationsItemSagas({ payload })
      sagaNextN(saga, 1)
      const err = new Error('error')
      expect(saga.throw(err).value).toEqual(put(saveAnnotationsItemFailure(err)))
    })
  })

  describe('watchPutItemTags', () => {
    it('links to putItemTagsSaga', () => {
      const saga = watchPutItemTags()
      expect(saga.next().value).toEqual(takeLatest(PUT_ITEM_TAGS, putItemTagsSaga))
    })
  })

  describe('putItemTagsSaga', () => {
    const payload = { itemId: '5f3f932e71162f53ca620274', projectId: '5f3d330e71162f53ca61f485', tags: ['foo', 'bar'] }
    const responseBody = {
      type: 'text',
      status: 'todo',
      annotated: true,
      tags: ['tyler', 'durden', 'marla', 'singer'],
      _id: '5f3f932e71162f53ca620274',
      project: '5f3d330e71162f53ca61f485',
    }
    const filteredItems = [{ id: 'foo' }, { id: 'bar' }]
    const currentItem = { id: 'foo' }
    const items = [{ id: 'foo', tags: responseBody.tags }, { id: 'bar' }]
    const logs = { data: ['foo'] }

    const transactionId = 'items_tags'
    const url = resolveApiUrl('REACT_APP_PROJECT_ITEM_ROUTE', { projectId: payload.projectId, itemId: payload.itemId })

    it('calls resolveApiUrl', () => {
      const saga = putItemTagsSaga({ payload })
      expect(saga.next().value).toEqual(
        call(resolveApiUrl, 'REACT_APP_PROJECT_ITEM_ROUTE', { projectId: payload.projectId, itemId: payload.itemId })
      )
    })

    it('puts request', () => {
      const options = {
        method: 'PUT',
        body: { tags: payload.tags },
      }

      const saga = putItemTagsSaga({ payload })
      sagaNextN(saga, 1)
      expect(saga.next(url).value).toEqual(put(request(url, options, transactionId)))
    })

    it('takes item fetching result', () => {
      const saga = putItemTagsSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(url)
      expect(JSON.stringify(saga.next().value)).toEqual(JSON.stringify(take(noop)))
    })

    it('selects selectCurrentItem', () => {
      const saga = putItemTagsSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(url)
      sagaNextN(saga, 1)
      expect(saga.next({ payload: { responseBody } }).value).toEqual(select(selectCurrentItem))
    })

    it('puts fetchItemLogs', () => {
      const saga = putItemTagsSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(url)
      sagaNextN(saga, 1)
      saga.next({ payload: { responseBody } })
      saga.next(currentItem)
      expect(saga.next(filteredItems).value).toEqual(put(fetchItemLogs(payload.itemId)))
    })

    it('takes FETCH_ITEM_LOGS_SUCCESS', () => {
      const saga = putItemTagsSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(url)
      sagaNextN(saga, 1)
      saga.next({ payload: { responseBody } })
      saga.next(currentItem)
      saga.next(filteredItems)
      expect(saga.next().value).toEqual(take(FETCH_ITEM_LOGS_SUCCESS))
    })

    it('calls mapAndSortLogsService', () => {
      const saga = putItemTagsSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(url)
      sagaNextN(saga, 1)
      saga.next({ payload: { responseBody } })
      saga.next(currentItem)
      saga.next(filteredItems)
      sagaNextN(saga, 1)
      expect(saga.next({ payload: { logs } }).value).toEqual(call(mapAndSortLogsService, logs.data))
    })

    it('puts updateCurrentAnnotationItem', () => {
      const saga = putItemTagsSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(url)
      sagaNextN(saga, 1)
      saga.next({ payload: { responseBody } })
      saga.next(currentItem)
      saga.next(filteredItems)
      sagaNextN(saga, 1)
      saga.next({ payload: { logs } })
      expect(saga.next(logs.data).value).toEqual(
        put(
          updateCurrentAnnotationItem(
            { ...currentItem, tags: responseBody.tags, logs: { ...logs, data: logs.data } },
            filteredItems
          )
        )
      )
    })

    it('takes UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS', () => {
      const saga = putItemTagsSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(url)
      sagaNextN(saga, 1)
      saga.next({ payload: { responseBody } })
      saga.next(currentItem)
      saga.next(filteredItems)
      sagaNextN(saga, 1)
      saga.next({ payload: { logs } })
      sagaNextN(saga, 1)
      expect(saga.next(logs.data).value).toEqual(take(UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS))
    })

    it('puts fetchProjectItemsTags', () => {
      const saga = putItemTagsSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(url)
      sagaNextN(saga, 1)
      saga.next({ payload: { responseBody } })
      saga.next(currentItem)
      saga.next(filteredItems)
      sagaNextN(saga, 1)
      saga.next({ payload: { logs } })
      sagaNextN(saga, 1)
      saga.next(logs.data)
      expect(saga.next().value).toEqual(put(fetchProjectItemsTags(payload.projectId)))
    })

    it('take FETCH_PROJECT_ITEMS_TAGS_SUCCESS', () => {
      const saga = putItemTagsSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(url)
      sagaNextN(saga, 1)
      saga.next({ payload: { responseBody } })
      saga.next(currentItem)
      saga.next(filteredItems)
      sagaNextN(saga, 1)
      saga.next({ payload: { logs } })
      sagaNextN(saga, 1)
      saga.next(logs.data)
      sagaNextN(saga, 1)
      expect(saga.next().value).toEqual(take(FETCH_PROJECT_ITEMS_TAGS_SUCCESS))
    })

    it('puts putItemTagsSuccess', () => {
      const saga = putItemTagsSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(url)
      sagaNextN(saga, 1)
      saga.next({ payload: { responseBody } })
      saga.next(currentItem)
      saga.next(filteredItems)
      sagaNextN(saga, 1)
      saga.next({ payload: { logs } })
      sagaNextN(saga, 1)
      saga.next(logs.data)
      sagaNextN(saga, 2)
      expect(saga.next().value).toEqual(put(putItemTagsSuccess(items)))
    })

    it('puts putItemTagsFailure', () => {
      const saga = putItemTagsSaga({ payload })
      sagaNextN(saga, 1)
      const err = new Error('error')
      expect(saga.throw(err).value).toEqual(put(putItemTagsFailure(err)))
    })
  })

  describe('watchFetchItemLogsSaga', () => {
    it('links to fetchItemLogsSaga', () => {
      const saga = watchFetchItemLogsSaga()
      expect(saga.next().value).toEqual(takeLatest(FETCH_ITEM_LOGS, fetchItemLogsSaga))
    })
  })

  describe('fetchItemLogsSaga', () => {
    const itemId = 'foo'
    const payload = { itemId }
    const projectId = 1
    const transactionId = 'item_logs'

    it('select selectProjectId', () => {
      const saga = fetchItemLogsSaga({ payload })
      expect(saga.next().value).toEqual(select(selectProjectId))
    })

    it('puts fetchLogs', () => {
      const saga = fetchItemLogsSaga({ payload })
      sagaNextN(saga, 1)
      expect(saga.next(projectId).value).toEqual(put(fetchLogs(projectId, { itemId }, transactionId)))
    })

    it('takes project logs fetching result', () => {
      const saga = fetchItemLogsSaga({ payload })
      sagaNextN(saga, 2)
      expect(saga.next().value).toEqual(take(FETCH_LOGS_SUCCESS))
    })

    it('puts fetchProjectLogsSuccess', () => {
      const logs = 'foo'
      const saga = fetchItemLogsSaga({ payload })
      sagaNextN(saga, 3)
      expect(saga.next({ payload: logs }).value).toEqual(put(fetchItemLogsSuccess(logs)))
    })

    it('puts fetchProjectLogsFailure', () => {
      const saga = fetchItemLogsSaga({ payload })
      sagaNextN(saga, 1)
      const err = new Error('error')
      expect(saga.throw(err).value).toEqual(put(fetchItemLogsFailure(err)))
    })
  })

  describe('watchPostItemCommentSaga', () => {
    it('links to updateCurrentAnnotationItemSagas', () => {
      const saga = watchPostItemCommentSaga()
      expect(saga.next().value).toEqual(takeLatest(POST_ITEM_COMMENT, postItemCommentSaga))
    })
  })

  describe('postItemCommentSaga', () => {
    const item = 'foo'
    const items = { data: ['bar'] }
    const comment = 'foo'
    const payload = { comment }
    const projectId = 'bar'
    const postCommentBody = {
      comment,
      item: item._id,
    }
    const transactionId = 'item_comment'
    const logs = { data: ['foo'] }
    const dataLogs = logs.data
    const mappedLogs = { ...logs, data: dataLogs }

    it('selects selectCurrentItem', () => {
      const saga = postItemCommentSaga({ payload })
      expect(saga.next().value).toEqual(select(selectCurrentItem))
    })

    it('selects selectProjectId', () => {
      const saga = postItemCommentSaga({ payload })
      sagaNextN(saga, 1)
      expect(saga.next(item).value).toEqual(select(selectProjectId))
    })

    it('selects selectAnnotationItems', () => {
      const saga = postItemCommentSaga({ payload })
      sagaNextN(saga, 2)
      expect(saga.next(item).value).toEqual(select(selectAnnotationItems))
    })

    it('puts postComment', () => {
      const saga = postItemCommentSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(item)
      saga.next(projectId)
      expect(saga.next(items).value).toEqual(put(postComment(postCommentBody, projectId, transactionId)))
    })

    it('takes POST_COMMENT_SUCCESS', () => {
      const saga = postItemCommentSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(item)
      saga.next(projectId)
      saga.next(items)
      expect(saga.next().value).toEqual(take(POST_COMMENT_SUCCESS))
    })

    it('put fetchItemLogs', () => {
      const saga = postItemCommentSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(item)
      saga.next(projectId)
      saga.next(items)
      sagaNextN(saga, 1)
      expect(saga.next().value).toEqual(put(fetchItemLogs(item._id)))
    })

    it('takes FETCH_ITEM_LOGS_SUCCESS', () => {
      const saga = postItemCommentSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(item)
      saga.next(projectId)
      saga.next(items)
      sagaNextN(saga, 2)
      expect(saga.next().value).toEqual(take(FETCH_ITEM_LOGS_SUCCESS))
    })

    it('calls mapAndSortLogsService', () => {
      const saga = postItemCommentSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(item)
      saga.next(projectId)
      saga.next(items)
      sagaNextN(saga, 3)
      expect(saga.next({ payload: { logs } }).value).toEqual(call(mapAndSortLogsService, logs.data))
    })

    it('puts updateCurrentAnnotationItem', () => {
      const saga = postItemCommentSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(item)
      saga.next(projectId)
      saga.next(items)
      sagaNextN(saga, 3)
      saga.next({ payload: { logs } })
      expect(saga.next(dataLogs).value).toEqual(put(updateCurrentAnnotationItem({ ...item, logs: mappedLogs }, items)))
    })

    it('takes UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS', () => {
      const saga = postItemCommentSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(item)
      saga.next(projectId)
      saga.next(items)
      sagaNextN(saga, 3)
      saga.next({ payload: { logs } })
      saga.next(dataLogs)
      expect(saga.next().value).toEqual(take(UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS))
    })

    it('puts postItemCommentSuccess', () => {
      const saga = postItemCommentSaga({ payload })
      sagaNextN(saga, 1)
      saga.next(item)
      saga.next(projectId)
      saga.next(items)
      sagaNextN(saga, 3)
      saga.next({ payload: { logs } })
      saga.next(dataLogs)
      sagaNextN(saga, 1)
      expect(saga.next().value).toEqual(put(postItemCommentSuccess(logs)))
    })

    it('puts postItemCommentFailure', () => {
      const saga = postItemCommentSaga({ payload })
      sagaNextN(saga, 1)
      const err = new Error('error')
      expect(saga.throw(err).value).toEqual(put(postItemCommentFailure(err)))
    })
  })
})
