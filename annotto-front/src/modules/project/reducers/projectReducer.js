import produce from 'immer'

import {
  CLOSE_FILTER_MODAL,
  CLOSE_GUIDE_MODAL,
  DELETE_PROJECT,
  DELETE_PROJECT_FAILURE,
  DELETE_PROJECT_SUCCESS,
  FETCH_PROJECT_ITEMS_SUCCESS,
  FETCH_PROJECT_ITEMS_TAGS_SUCCESS,
  FETCH_PROJECT_LOGS_SUCCESS,
  FETCH_PROJECT_STATS_TASKS_SUCCESS,
  FETCH_PROJECT_USERS_SUCCESS,
  NAVIGATE_TO_ITEM_SUCCESS,
  OPEN_FILTER_MODAL,
  OPEN_GUIDE_MODAL,
  POST_PROJECT_COMMENT_SUCCESS,
  PUT_PROJECT_SUCCESS,
  STARTUP_SUCCESS,
} from 'modules/project/actions/projectActions'
import {
  FETCH_PROJECT_FILTER_OPERATORS_SUCCESS,
  FETCH_PROJECT_FILTER_SUCCESS,
  POST_PROJECT_FILTER,
  POST_PROJECT_FILTER_SUCCESS,
} from 'modules/project/actions/filterActions'
import { FETCH_PROJECT_SUCCESS } from 'modules/root/actions/rootActions'
import {
  MOUNT_ANNOTATION_PAGE_SUCCESS,
  NAVIGATE_TO_NEXT_ITEM_SUCCESS,
  RESET_ANNOTATION_ITEMS_SUCCESS,
  SAVE_ANNOTATIONS_ITEM_SUCCESS,
  SET_CURRENT_ITEM_SUCCESS,
  UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS,
} from 'modules/project/actions/annotationActions'

export const itemsState = {
  data: [],
  total: 0,
  index: 0,
  limit: 0,
  pageCount: 0,
}

export const tasksState = {
  data: [],
  total: 0,
  index: 0,
  limit: 0,
  pageCount: 0,
}

export const initialState = {
  isReady: false,
  isSuccessPosted: false,
  isDeletePosted: false,
  isFilterModalOpen: false,
  isGuideModalOpen: false,
  items: itemsState,
  tasks: tasksState,
  data: {},
  annotation: {
    isAnnotationPosted: false,
    currentItemId: null,
    isReady: false,
    isFetching: false,
    items: [],
  },
}

export default (state, action) => {
  return produce(state || initialState, (draft) => {
    switch (action.type) {
      case STARTUP_SUCCESS: {
        draft.isReady = true
        break
      }
      case FETCH_PROJECT_SUCCESS: {
        draft.data = { ...draft.data, ...action.payload.project }
        break
      }
      case DELETE_PROJECT: {
        draft.isDeletePosted = true
        break
      }
      case DELETE_PROJECT_FAILURE:
      case DELETE_PROJECT_SUCCESS: {
        draft.isDeletePosted = false
        break
      }
      case PUT_PROJECT_SUCCESS: {
        draft.data = { ...draft.data, ...action.payload }
        break
      }
      case POST_PROJECT_FILTER: {
        draft.isSuccessPosted = false
        break
      }
      case POST_PROJECT_FILTER_SUCCESS: {
        draft.isSuccessPosted = true
        draft.data.filter = action.payload.filter
        break
      }
      case FETCH_PROJECT_ITEMS_TAGS_SUCCESS: {
        draft.data.tags = action.payload.tags
        break
      }
      case FETCH_PROJECT_FILTER_OPERATORS_SUCCESS: {
        draft.data.operators = action.payload.operators.operators
        draft.data.fields = action.payload.operators.fields
        break
      }
      case FETCH_PROJECT_FILTER_SUCCESS: {
        draft.data.filter = action.payload.filter
        break
      }
      case FETCH_PROJECT_LOGS_SUCCESS: {
        draft.data.logs = action.payload.logs
        break
      }
      case POST_PROJECT_COMMENT_SUCCESS: {
        draft.data.logs.data = [...state.data.logs.data, action.payload.comment]
        break
      }
      case FETCH_PROJECT_ITEMS_SUCCESS: {
        draft.items = action.payload.items
        break
      }
      case FETCH_PROJECT_STATS_TASKS_SUCCESS: {
        draft.tasks = action.payload.tasks
        break
      }
      case FETCH_PROJECT_USERS_SUCCESS: {
        draft.annotators = action.payload.users
        break
      }
      case RESET_ANNOTATION_ITEMS_SUCCESS:
      case UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS: {
        draft.annotation.items = action.payload.items
        break
      }
      case MOUNT_ANNOTATION_PAGE_SUCCESS: {
        draft.annotation.isReady = action.payload.isReady
        break
      }
      case SAVE_ANNOTATIONS_ITEM_SUCCESS: {
        draft.annotation.isAnnotationPosted = true
        break
      }
      case NAVIGATE_TO_NEXT_ITEM_SUCCESS: {
        draft.annotation.isReady = true
        draft.annotation.isAnnotationPosted = false
        break
      }
      case NAVIGATE_TO_ITEM_SUCCESS: {
        draft.annotation.isReady = false
        break
      }
      case SET_CURRENT_ITEM_SUCCESS: {
        draft.annotation.currentItemId = action.payload.itemId
        break
      }
      case OPEN_FILTER_MODAL: {
        draft.isFilterModalOpen = true
        break
      }
      case CLOSE_FILTER_MODAL: {
        draft.isFilterModalOpen = false
        break
      }
      case OPEN_GUIDE_MODAL: {
        draft.isGuideModalOpen = true
        break
      }
      case CLOSE_GUIDE_MODAL: {
        draft.isGuideModalOpen = false
        break
      }
      default: {
        // do nothing
      }
    }
  })
}
