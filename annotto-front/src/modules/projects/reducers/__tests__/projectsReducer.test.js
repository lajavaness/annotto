import reduce, { initialState } from 'modules/projects/reducers/projectsReducer'

import { FETCH_PROJECTS_SUCCESS, STARTUP_SUCCESS } from 'modules/projects/actions/projectsActions'

describe('projectsReducer', () => {
  describe('Uncaught action', () => {
    it('returns state', () => {
      const state = reduce(initialState, { type: 'PROJECTS' })
      expect(state).toEqual(initialState)
    })
  })

  describe('STARTUP_SUCCESS', () => {
    it('updates state', () => {
      const newState = {
        ...initialState,
        isReady: true,
      }
      const state = reduce(initialState, {
        type: STARTUP_SUCCESS,
      })
      expect(state).toEqual(newState)
    })
  })

  describe('FETCH_PROJECTS_SUCCESS', () => {
    it('updates state', () => {
      const newState = {
        ...initialState,
        data: ['Foo'],
        index: 1,
        limit: 10,
        pageCount: 1,
        total: 2,
      }

      const state = reduce(initialState, {
        type: FETCH_PROJECTS_SUCCESS,
        payload: {
          projects: {
            data: ['Foo'],
            index: 1,
            limit: 10,
            pageCount: 1,
            total: 2,
          },
        },
      })
      expect(state).toEqual(newState)
    })
  })
})
