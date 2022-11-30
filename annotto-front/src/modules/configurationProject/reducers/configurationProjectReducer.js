import produce from 'immer'

import {
  POST_FILE_FAILURE,
  POST_PROJECT,
  POST_PROJECT_FAILURE,
  POST_PROJECT_SUCCESS,
  PUT_CONFIG_PROJECT,
  PUT_CONFIG_PROJECT_FAILURE,
  PUT_CONFIG_PROJECT_SUCCESS,
  RESET_CONFIG,
  STARTUP_SUCCESS,
  UPDATE_CONFIG_PROJECT_SUCCESS,
  UPLOAD_ANNOTATIONS,
  UPLOAD_ITEMS,
  UPLOAD_PREDICTIONS,
} from 'modules/configurationProject/actions/configurationProjectActions'

const initialConfig = {
  project: null,
  items: {
    file: null,
    isUpdate: false,
  },
  predictions: null,
  annotations: null,
}

export const initialState = {
  isReady: false,
  isPosting: false,
  isSuccessPosted: false,
  isSuccessUpdated: false,
  config: initialConfig,
  initialConfig,
}

export default (state, action) => {
  return produce(state || initialState, (draft) => {
    switch (action.type) {
      case STARTUP_SUCCESS: {
        draft.isReady = true
        draft.config.project = action.payload.project
        draft.initialConfig.project = action.payload.project
        break
      }
      case RESET_CONFIG: {
        draft.config = draft.initialConfig
        break
      }
      case POST_PROJECT: {
        draft.isPosting = true
        draft.isSuccessPosted = false
        break
      }
      case PUT_CONFIG_PROJECT: {
        draft.isPosting = true
        draft.isSuccessUpdated = false
        break
      }
      case POST_PROJECT_SUCCESS: {
        draft.isPosting = false
        draft.isSuccessPosted = true
        break
      }
      case PUT_CONFIG_PROJECT_SUCCESS: {
        draft.isPosting = false
        draft.isSuccessUpdated = true
        draft.initialConfig = draft.config
        break
      }
      case POST_FILE_FAILURE:
      case PUT_CONFIG_PROJECT_FAILURE:
      case POST_PROJECT_FAILURE: {
        draft.isPosting = false
        draft.isSuccessPosted = false
        break
      }
      case UPDATE_CONFIG_PROJECT_SUCCESS: {
        draft.config.project = action.payload.config
        break
      }
      case UPLOAD_ITEMS: {
        draft.config.items.file = action.payload.file
        draft.config.items.isUpdate = action.payload.isUpdate
        break
      }
      case UPLOAD_PREDICTIONS: {
        draft.config.predictions = action.payload.file
        break
      }
      case UPLOAD_ANNOTATIONS: {
        draft.config.annotations = action.payload.file
        break
      }

      default: {
        // do nothing
      }
    }
  })
}
