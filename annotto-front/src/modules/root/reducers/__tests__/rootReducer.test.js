import {
  FETCH_CLIENTS_SUCCESS,
  FETCH_USERS_SUCCESS,
  FETCH_USER_SUCCESS,
  LOGOUT_SUCCESS,
  SET_EXPIRATION_DATE_SUCCESS,
  STARTUP_FAILURE,
  STARTUP_SUCCESS,
} from 'modules/root/actions/rootActions'
import { REQUEST_FAILURE, REQUEST_SUCCESS } from 'shared/actions/apiActions'

import reduce from 'modules/root/reducers/rootReducer'

describe('rootReducer', () => {
  const initialState = {
    isReady: false,
  }

  describe('Uncaught action', () => {
    it('returns state', () => {
      const state = reduce(initialState, { type: 'ROOT' })
      expect(state).toEqual(initialState)
    })
  })

  describe('STARTUP_SUCCESS', () => {
    it('updates state', () => {
      const newState = {
        isReady: true,
      }
      const state = reduce(initialState, {
        type: STARTUP_SUCCESS,
      })
      expect(state).toEqual(newState)
    })
  })

  describe('STARTUP_FAILURE', () => {
    it('updates state', () => {
      const newState = {
        isReady: true,
      }
      const state = reduce(initialState, {
        type: STARTUP_FAILURE,
      })
      expect(state).toEqual(newState)
    })
  })

  describe('SET_EXPIRATION_DATE_SUCCESS', () => {
    it('updates state', () => {
      const expectedState = {
        ...initialState,
        expirationDate: 'foo',
      }
      const state = reduce(initialState, {
        type: SET_EXPIRATION_DATE_SUCCESS,
        payload: { expirationDate: 'foo' },
      })
      expect(state).toEqual(expectedState)
    })
  })

  describe('LOGOUT_SUCCESS', () => {
    it('updates state', () => {
      const expectedState = {
        ...initialState,
        user: null,
        expirationDate: null,
      }
      const state = reduce(initialState, {
        type: LOGOUT_SUCCESS,
      })
      expect(state).toEqual(expectedState)
    })
  })

  describe('FETCH_USERs_SUCCESS', () => {
    it('updates state', () => {
      const expectedState = {
        ...initialState,
        user: 'foo',
      }
      const state = reduce(initialState, {
        type: FETCH_USER_SUCCESS,
        payload: { user: 'foo' },
      })
      expect(state).toEqual(expectedState)
    })
  })

  describe('FETCH_USERS_SUCCESS', () => {
    it('updates state', () => {
      const expectedState = {
        ...initialState,
        users: [{ id: 'foo' }],
      }
      const state = reduce(initialState, {
        type: FETCH_USERS_SUCCESS,
        payload: { users: [{ id: 'foo' }] },
      })
      expect(state).toEqual(expectedState)
    })
  })

  describe('FETCH_CLIENTS_SUCCESS', () => {
    it('updates state', () => {
      const newState = {
        ...initialState,
        clients: 'foo',
      }
      const state = reduce(initialState, {
        type: FETCH_CLIENTS_SUCCESS,
        payload: {
          clients: 'foo',
        },
      })

      expect(state).toEqual(newState)
    })
  })

  describe('REQUEST_FAILURE', () => {
    it('updates state', () => {
      const expectedState = {
        ...initialState,
        httpError: 'foo',
      }
      const state = reduce(initialState, {
        type: REQUEST_FAILURE,
        payload: { error: 'foo' },
      })
      expect(state).toEqual(expectedState)
    })
  })

  describe('REQUEST_SUCCESS', () => {
    it('updates state', () => {
      const expectedState = {
        ...initialState,
        httpError: null,
      }
      const state = reduce(initialState, {
        type: REQUEST_SUCCESS,
      })
      expect(state).toEqual(expectedState)
    })
  })
})
