import reduce, { initialState } from 'modules/configurationProject/reducers/configurationProjectReducer'

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

describe('configurationProjectReducer', () => {
  describe('Uncaught action', () => {
    it('returns state', () => {
      const state = reduce(initialState, { type: 'FOO' })
      expect(state).toEqual(initialState)
    })
  })

  describe('STARTUP_SUCCESS', () => {
    it('updates state', () => {
      const newState = {
        ...initialState,
        isReady: true,
        config: {
          ...initialState.config,
          project: 'foo',
        },
        initialConfig: {
          ...initialState.initialConfig,
          project: 'foo',
        },
      }
      const state = reduce(initialState, {
        type: STARTUP_SUCCESS,
        payload: {
          project: 'foo',
        },
      })
      expect(state).toEqual(newState)
    })
  })

  describe('RESET_CONFIG', () => {
    it('updates state', () => {
      const newState = {
        ...initialState,
        config: initialState.initialConfig,
      }
      const state = reduce(initialState, {
        type: RESET_CONFIG,
      })
      expect(state).toEqual(newState)
    })
  })

  describe('POST_PROJECT', () => {
    it('updates state', () => {
      const newState = {
        ...initialState,
        isSuccessPosted: false,
        isPosting: true,
      }
      const state = reduce(initialState, {
        type: POST_PROJECT,
      })
      expect(state).toEqual(newState)
    })
  })

  describe('PUT_CONFIG_PROJECT', () => {
    it('updates state', () => {
      const newState = {
        ...initialState,
        isSuccessUpdated: false,
        isPosting: true,
      }
      const state = reduce(initialState, {
        type: PUT_CONFIG_PROJECT,
      })
      expect(state).toEqual(newState)
    })
  })

  describe('POST_PROJECT_SUCCESS', () => {
    it('updates state', () => {
      const newState = {
        ...initialState,
        isSuccessPosted: true,
        isPosting: false,
      }
      const state = reduce(initialState, {
        type: POST_PROJECT_SUCCESS,
      })
      expect(state).toEqual(newState)
    })
  })

  describe('PUT_CONFIG_PROJECT_SUCCESS', () => {
    it('updates state', () => {
      const newState = {
        ...initialState,
        isSuccessUpdated: true,
        isPosting: false,
        initialConfig: initialState.config,
      }
      const state = reduce(initialState, {
        type: PUT_CONFIG_PROJECT_SUCCESS,
      })
      expect(state).toEqual(newState)
    })
  })

  describe('POST_PROJECT_FAILURE', () => {
    it('updates state', () => {
      const newState = {
        ...initialState,
        isSuccessPosted: false,
        isPosting: false,
      }
      const state = reduce(initialState, {
        type: POST_PROJECT_FAILURE,
      })
      expect(state).toEqual(newState)
    })
  })

  describe('POST_FILE_FAILURE', () => {
    it('updates state', () => {
      const newState = {
        ...initialState,
        isSuccessPosted: false,
        isPosting: false,
      }
      const state = reduce(initialState, {
        type: POST_FILE_FAILURE,
      })
      expect(state).toEqual(newState)
    })
  })

  describe('PUT_PROJECT_FAILURE', () => {
    it('updates state', () => {
      const newState = {
        ...initialState,
        isSuccessPosted: false,
        isPosting: false,
      }
      const state = reduce(initialState, {
        type: PUT_CONFIG_PROJECT_FAILURE,
      })
      expect(state).toEqual(newState)
    })
  })

  describe('UPDATE_CONFIG_PROJECT_SUCCESS', () => {
    it('updates state', () => {
      const newState = {
        ...initialState,
        config: { ...initialState.config, project: 'foo' },
      }
      const state = reduce(initialState, {
        type: UPDATE_CONFIG_PROJECT_SUCCESS,
        payload: {
          config: 'foo',
        },
      })

      expect(state).toEqual(newState)
    })
  })

  describe('UPLOAD_ITEMS', () => {
    it('updates state', () => {
      const newState = {
        ...initialState,
        config: { ...initialState.config, items: { file: 'foo', isUpdate: true } },
      }
      const state = reduce(initialState, {
        type: UPLOAD_ITEMS,
        payload: {
          file: 'foo',
          isUpdate: true,
        },
      })

      expect(state).toEqual(newState)
    })
  })

  describe('UPLOAD_PREDICTIONS', () => {
    it('updates state', () => {
      const newState = {
        ...initialState,
        config: { ...initialState.config, predictions: 'foo' },
      }
      const state = reduce(initialState, {
        type: UPLOAD_PREDICTIONS,
        payload: {
          file: 'foo',
        },
      })

      expect(state).toEqual(newState)
    })
  })

  describe('UPLOAD_ANNOTATIONS', () => {
    it('updates state', () => {
      const newState = {
        ...initialState,
        config: { ...initialState.config, annotations: 'foo' },
      }
      const state = reduce(initialState, {
        type: UPLOAD_ANNOTATIONS,
        payload: {
          file: 'foo',
        },
      })

      expect(state).toEqual(newState)
    })
  })
})
