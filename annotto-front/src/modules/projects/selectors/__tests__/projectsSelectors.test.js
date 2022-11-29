import {
  selectIndexProjects,
  selectIsReady,
  selectLimitProjects,
  selectProjects,
  selectTotalProjects,
} from 'modules/projects/selectors/projectsSelectors'

import { PROJECTS_SIZE } from 'shared/enums/projectsTypes'

describe('projectsSelectors', () => {
  describe('selectIsReady', () => {
    it('returns default value', () => {
      const result = selectIsReady()
      expect(result).toBeFalsy()
    })

    it('returns state value', () => {
      const state = {
        projects: {
          isReady: true,
        },
      }
      const result = selectIsReady(state)
      expect(result).toBeTruthy()
    })
  })

  describe('selectProjects', () => {
    it('returns default value', () => {
      const result = selectProjects()
      expect(result).toBeNull()
    })

    it('returns state value', () => {
      const state = {
        projects: {
          data: ['FOO'],
        },
      }
      const result = selectProjects(state)
      expect(result).toEqual(['FOO'])
    })
  })

  describe('selectTotalProjects', () => {
    it('returns default value', () => {
      const result = selectTotalProjects()
      expect(result).toEqual(0)
    })

    it('returns state value', () => {
      const state = {
        projects: {
          total: PROJECTS_SIZE,
        },
      }
      const result = selectTotalProjects(state)
      expect(result).toEqual(PROJECTS_SIZE)
    })
  })

  describe('selectLimitProjects', () => {
    it('returns default value', () => {
      const result = selectLimitProjects()
      expect(result).toEqual(PROJECTS_SIZE)
    })

    it('returns state value', () => {
      const state = {
        projects: {
          limit: PROJECTS_SIZE,
        },
      }
      const result = selectLimitProjects(state)
      expect(result).toEqual(PROJECTS_SIZE)
    })
  })

  describe('selectIndexProjects', () => {
    it('returns default value', () => {
      const result = selectIndexProjects()
      expect(result).toEqual(0)
    })

    it('returns state value', () => {
      const state = {
        projects: {
          index: 1,
        },
      }
      const result = selectIndexProjects(state)
      expect(result).toEqual(1)
    })
  })
})
