import { call, put, race, select, take, takeLatest } from 'redux-saga/effects'
import { globalHistory, navigate } from '@reach/router'
import { isNil, isObject, pickBy } from 'lodash'

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
	SAVE_ANNOTATIONS_ITEM,
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
	saveAnnotationsItemFailure,
	saveAnnotationsItemSuccess,
	setCurrentItem,
	setCurrentItemFailure,
	setCurrentItemSuccess,
	updateCurrentAnnotationItem,
	updateCurrentAnnotationItemFailure,
	updateCurrentAnnotationItemSuccess,
} from 'modules/project/actions/annotationActions'
import { FETCH_PROJECT_ITEMS_TAGS_SUCCESS, fetchProjectItemsTags } from 'modules/project/actions/projectActions'
import { REQUEST_FAILURE, REQUEST_SUCCESS, request } from 'shared/actions/apiActions'

import {
	selectAnnotationItems,
	selectCurrentItem,
	selectCurrentItemId,
} from 'modules/project/selectors/annotationSelectors'
import { selectProjectFilterId, selectProjectId } from 'modules/project/selectors/projectSelectors'

import {
	addLogsToItemService,
	filterAndAddAnnotationsToItemService,
	filterAndAddItemService,
	mapAnnotationItemResponseService,
	mapAnnotationsRequestService,
	updateItemsService,
} from 'modules/project/services/annotationServices'
import { mapAndSortLogsService } from 'modules/project/services/projectServices'

import { initialState } from 'modules/project/reducers/projectReducer'

import { FETCH_LOGS_SUCCESS, POST_COMMENT_SUCCESS, fetchLogs, postComment } from 'shared/actions/logsActions'

import { resolveApiUrl } from 'shared/utils/urlUtils'

export function* watchMountAnnotationPage() {
	yield takeLatest(MOUNT_ANNOTATION_PAGE, mountAnnotationPageSaga)
}

export function* mountAnnotationPageSaga() {
	try {
		const projectId = globalHistory.location.pathname.split('/')[2]

		if (!projectId) throw new Error(`projectId does not exist !`)

		const items = []

		yield put(resetAnnotationItems())
		yield take(RESET_ANNOTATION_ITEMS_SUCCESS)

		const itemId = globalHistory.location.pathname.split('/')[4]

		if (itemId) {
			yield put(fetchAnnotationItem(itemId, projectId))
			const {
				payload: { item },
			} = yield take(FETCH_ANNOTATION_ITEM_SUCCESS)

			yield put(fetchCurrentItemAnnotations(item, projectId))
			const {
				payload: { item: updatedItem },
			} = yield take(FETCH_CURRENT_ITEM_ANNOTATIONS_SUCCESS)

			yield put(setCurrentItem(item._id))
			yield take(SET_CURRENT_ITEM_SUCCESS)

			yield put(updateCurrentAnnotationItem(updatedItem, items))
			yield take(UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS)
		} else {
			yield put(navigateToNextItem())
			yield take(NAVIGATE_TO_NEXT_ITEM_SUCCESS)
		}

		yield put(mountAnnotationPageSuccess(true))
	} catch (err) {
		yield put(mountAnnotationPageFailure(err))
	}
}

export function* watchFetchAnnotationItem() {
	yield takeLatest(FETCH_ANNOTATION_ITEM, fetchAnnotationItemSaga)
}

export function* fetchAnnotationItemSaga({ payload }) {
	try {
		const { itemId, projectId } = payload

		const transactionId = 'project_item'
		const url = yield call(resolveApiUrl, 'REACT_APP_PROJECT_ITEM_ROUTE', { projectId, itemId })

		yield put(request(url, null, transactionId))
		const { success, failure } = yield race({
			success: take(({ type, payload }) => type === REQUEST_SUCCESS && payload.transactionId === transactionId),
			failure: take(({ type, payload }) => type === REQUEST_FAILURE && payload.transactionId === transactionId),
		})

		if (success) {
			const data = yield call(mapAnnotationItemResponseService, success.payload.responseBody)
			yield put(fetchAnnotationItemSuccess(data))
		} else {
			yield put(fetchAnnotationItemFailure(failure.payload.error))
		}
	} catch (err) {
		yield put(fetchAnnotationItemFailure(err))
	}
}

export function* watchFetchCurrentItem() {
	yield takeLatest(FETCH_CURRENT_ITEM_ANNOTATIONS, fetchCurrentItemAnnotationsSaga)
}

export function* fetchCurrentItemAnnotationsSaga({ payload }) {
	try {
		const { item, projectId } = payload
		const transactionId = 'item_annotation'

		const url = yield call(resolveApiUrl, 'REACT_APP_PROJECT_ITEM_ANNOTATIONS_ROUTE', { projectId, itemId: item._id })

		yield put(request(url, null, transactionId))

		const {
			payload: { responseBody },
		} = yield take(({ type, payload }) => type === REQUEST_SUCCESS && payload.transactionId === transactionId)

		let updatedItem = yield call(filterAndAddAnnotationsToItemService, responseBody, item)

		yield put(fetchItemLogs(item._id))
		const {
			payload: { logs },
		} = yield take(FETCH_ITEM_LOGS_SUCCESS)

		const dataLogs = yield call(mapAndSortLogsService, logs.data)
		updatedItem = yield call(mapAnnotationItemResponseService, updatedItem)
		updatedItem = yield call(addLogsToItemService, { ...logs, data: dataLogs }, updatedItem)

		yield put(fetchCurrentItemAnnotationsSuccess(updatedItem))
	} catch (err) {
		yield put(fetchCurrentItemAnnotationsFailure(err))
	}
}

export function* watchResetAnnotationItems() {
	yield takeLatest(RESET_ANNOTATION_ITEMS, resetAnnotationItemsSaga)
}

export function* resetAnnotationItemsSaga() {
	try {
		yield put(resetAnnotationItemsSuccess(initialState.annotation.items))
	} catch (err) {
		yield put(resetAnnotationItemsFailure(err))
	}
}

export function* watchSetCurrentItem() {
	yield takeLatest(SET_CURRENT_ITEM, setCurrentItemSaga)
}

export function* setCurrentItemSaga({ payload }) {
	try {
		let { itemId } = payload

		yield put(setCurrentItemSuccess(itemId))
	} catch (err) {
		yield put(setCurrentItemFailure(err))
	}
}

export function* watchUpdateCurrentAnnotationItem() {
	yield takeLatest(UPDATE_CURRENT_ANNOTATION_ITEM, updateCurrentAnnotationItemSagas)
}

export function* updateCurrentAnnotationItemSagas({ payload }) {
	try {
		const { item, items } = payload
		const updatedItems = yield call(updateItemsService, items, item)

		yield put(updateCurrentAnnotationItemSuccess(updatedItems))
	} catch (err) {
		yield put(updateCurrentAnnotationItemFailure(err))
	}
}

export function* watchNavigateToNextItem() {
	yield takeLatest(NAVIGATE_TO_NEXT_ITEM, navigateToNextItemSagas)
}

export function* navigateToNextItemSagas() {
	try {
		const transactionId = 'item'
		const projectId = yield select(selectProjectId)
		const filterId = yield select(selectProjectFilterId)
		const currentItemId = yield select(selectCurrentItemId)
		let items = yield select(selectAnnotationItems)
		let item = null

		const currentItemIndex = items?.findIndex(({ _id }) => _id === currentItemId)

		if (currentItemIndex === items.length - 1 || !currentItemId) {
			const url = yield call(resolveApiUrl, 'REACT_APP_PROJECT_ITEM_NEXT_ROUTE', { projectId })
			const options = {
				query: {
					filterId,
				},
			}
			yield put(request(url, options, transactionId))

			const {
				payload: { responseBody },
			} = yield take(({ type, payload }) => type === REQUEST_SUCCESS && payload.transactionId === transactionId)
			item = responseBody
			items = yield call(filterAndAddItemService, items, item)

			yield put(updateCurrentAnnotationItem(item, items))
			yield take(UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS)
		} else {
			item = items?.[currentItemIndex + 1]
		}

		if (!!item && isObject(item)) {
			yield put(fetchAnnotationItem(item._id, projectId))
			const {
				payload: { item: updatedItem },
			} = yield take(FETCH_ANNOTATION_ITEM_SUCCESS)

			yield put(setCurrentItem(item._id))
			yield take(SET_CURRENT_ITEM_SUCCESS)

			yield call(navigate, `/project/${projectId}/annotation/${item._id}`)

			yield put(navigateToNextItemSuccess())

			yield put(fetchCurrentItemAnnotations(updatedItem, projectId))
			const {
				payload: { item: updatedItemWithAnnotations },
			} = yield take(FETCH_CURRENT_ITEM_ANNOTATIONS_SUCCESS)

			yield put(updateCurrentAnnotationItem(updatedItemWithAnnotations, items))
			yield take(UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS)
		} else {
			yield put(setCurrentItem(null))
			yield take(SET_CURRENT_ITEM_SUCCESS)

			yield call(navigate, `/project/${projectId}/annotation`)

			yield put(navigateToNextItemSuccess())
		}
	} catch (err) {
		yield put(navigateToNextItemFailure(err))
	}
}

export function* watchNavigateToPrevItem() {
	yield takeLatest(NAVIGATE_TO_PREV_ITEM, navigateToPrevItemSagas)
}

export function* navigateToPrevItemSagas() {
	try {
		const items = yield select(selectAnnotationItems)
		const currentItemId = yield select(selectCurrentItemId)
		const projectId = yield select(selectProjectId)
		let currentItemIndex = 0

		if (currentItemId) {
			currentItemIndex = items?.findIndex(({ _id }) => _id === currentItemId)
		} else {
			currentItemIndex = items.length
		}

		if (currentItemIndex > 0) {
			const newItemIndex = currentItemIndex - 1
			const item = items?.[newItemIndex]

			yield put(fetchAnnotationItem(item._id, projectId))
			const {
				payload: { item: updatedItem },
			} = yield take(FETCH_ANNOTATION_ITEM_SUCCESS)

			yield put(setCurrentItem(item._id))
			yield take(SET_CURRENT_ITEM_SUCCESS)

			yield call(navigate, `/project/${projectId}/annotation/${item._id}`)

			yield put(fetchCurrentItemAnnotations(updatedItem, projectId))

			const {
				payload: { item: updatedItemWithAnnotations },
			} = yield take(FETCH_CURRENT_ITEM_ANNOTATIONS_SUCCESS)

			yield put(updateCurrentAnnotationItem(updatedItemWithAnnotations, items))
			yield take(UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS)

			yield put(navigateToPrevItemSuccess())
		} else {
			throw new Error('No previous item available')
		}
	} catch (err) {
		yield put(navigateToPrevItemFailure(err))
	}
}

export function* watchSaveAnnotationsItem() {
	yield takeLatest(SAVE_ANNOTATIONS_ITEM, saveAnnotationsItemSagas)
}

export function* saveAnnotationsItemSagas({ payload }) {
	try {
		const { annotations, entitiesRelations, projectId, itemId } = payload

		const transactionId = 'annotation'

		const url = yield call(resolveApiUrl, 'REACT_APP_PROJECT_ITEM_ANNOTATE_ROUTE', { projectId, itemId })

		const mappedAnnotations = yield call(mapAnnotationsRequestService, annotations)

		const options = {
			method: 'POST',
			body: pickBy({ annotations: mappedAnnotations, entitiesRelations }, (value) => !isNil(value)),
		}

		yield put(request(url, options, transactionId))

		const { success, failure } = yield race({
			success: take(({ type, payload }) => type === REQUEST_SUCCESS && payload.transactionId === transactionId),
			failure: take(({ type, payload }) => type === REQUEST_FAILURE && payload.transactionId === transactionId),
		})

		if (success) {
			yield put(saveAnnotationsItemSuccess(success.payload))
			yield put(navigateToNextItem())
		} else {
			yield put(saveAnnotationsItemFailure(failure.payload.error))
		}
	} catch (err) {
		yield put(saveAnnotationsItemFailure(err))
	}
}

export function* watchPutItemTags() {
	yield takeLatest(PUT_ITEM_TAGS, putItemTagsSaga)
}

export function* putItemTagsSaga({ payload }) {
	try {
		const transactionId = 'items_tags'
		const { itemId, projectId, tags } = payload

		const url = yield call(resolveApiUrl, 'REACT_APP_PROJECT_ITEM_ROUTE', { projectId, itemId })
		const options = {
			method: 'PUT',
			body: { tags },
		}

		yield put(request(url, options, transactionId))

		const {
			payload: { responseBody },
		} = yield take(({ type, payload }) => type === REQUEST_SUCCESS && payload.transactionId === transactionId)

		const currentItem = yield select(selectCurrentItem)

		const filteredItems = yield select(selectAnnotationItems)

		yield put(fetchItemLogs(itemId))
		const {
			payload: { logs },
		} = yield take(FETCH_ITEM_LOGS_SUCCESS)

		const dataLogs = yield call(mapAndSortLogsService, logs.data)

		yield put(
			updateCurrentAnnotationItem(
				{ ...currentItem, tags: responseBody.tags, logs: { ...logs, data: dataLogs } },
				filteredItems
			)
		)
		yield take(UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS)

		yield put(fetchProjectItemsTags(projectId))
		yield take(FETCH_PROJECT_ITEMS_TAGS_SUCCESS)

		yield put(putItemTagsSuccess())
	} catch (err) {
		yield put(putItemTagsFailure(err))
	}
}

export function* watchFetchItemLogsSaga() {
	yield takeLatest(FETCH_ITEM_LOGS, fetchItemLogsSaga)
}

export function* fetchItemLogsSaga({ payload }) {
	try {
		const transactionId = 'item_logs'
		const { itemId } = payload
		const projectId = yield select(selectProjectId)

		yield put(fetchLogs(projectId, { itemId }, transactionId))
		const { payload: logs } = yield take(FETCH_LOGS_SUCCESS)

		yield put(fetchItemLogsSuccess(logs))
	} catch (err) {
		yield put(fetchItemLogsFailure(err))
	}
}

export function* watchPostItemCommentSaga() {
	yield takeLatest(POST_ITEM_COMMENT, postItemCommentSaga)
}

export function* postItemCommentSaga({ payload }) {
	try {
		const transactionId = 'item_comment'
		const { comment } = payload

		const item = yield select(selectCurrentItem)
		const projectId = yield select(selectProjectId)
		const items = yield select(selectAnnotationItems)

		const postCommentBody = {
			comment,
			item: item._id,
		}

		yield put(postComment(postCommentBody, projectId, transactionId))
		yield take(POST_COMMENT_SUCCESS)

		yield put(fetchItemLogs(item._id))
		const {
			payload: { logs },
		} = yield take(FETCH_ITEM_LOGS_SUCCESS)

		const dataLogs = yield call(mapAndSortLogsService, logs.data)
		const mappedLogs = { ...logs, data: dataLogs }

		yield put(updateCurrentAnnotationItem({ ...item, logs: mappedLogs }, items))
		yield take(UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS)

		yield put(postItemCommentSuccess(logs))
	} catch (err) {
		yield put(postItemCommentFailure(err))
	}
}
