import {
  selectExpirationDate,
  selectHttpError,
  selectIsAppReady,
  selectIsHighlightAllowed,
  selectIsSimilarityAllowed,
  selectProjectClients,
  selectUsers,
} from 'modules/root/selectors/rootSelectors'

describe('rootSelectors', () => {
  describe('selectIsReady', () => {
    it('returns default value', () => {
      const result = selectIsAppReady()
      expect(result).toBeFalsy()
    })

    it('returns state value', () => {
      const state = {
        root: {
          isReady: true,
        },
      }
      const result = selectIsAppReady(state)
      expect(result).toBeTruthy()
    })
  })

  describe('selectExpirationDate', () => {
    it('returns default value', () => {
      const result = selectExpirationDate()
      expect(result).toBeNull()
    })

    it('returns state value', () => {
      const state = {
        root: {
          expirationDate: 'foo',
        },
      }
      const result = selectExpirationDate(state)
      expect(result).toBe('foo')
    })
  })

  describe('selectUsers', () => {
    it('returns default value', () => {
      const result = selectUsers()
      expect(result).toStrictEqual([])
    })

    it('returns state value', () => {
      const state = {
        root: {
          users: 'foo',
        },
      }
      const result = selectUsers(state)
      expect(result).toBe('foo')
    })
  })

  describe('selectHttpError', () => {
    it('returns default value', () => {
      const result = selectHttpError()
      expect(result).toBeNull()
    })

    it('returns state value', () => {
      const state = {
        root: {
          httpError: 'foo',
        },
      }
      const result = selectHttpError(state)
      expect(result).toBe('foo')
    })
  })

  describe('selectIsHighlightAllowed', () => {
    it('returns default value', () => {
      const result = selectIsHighlightAllowed()
      expect(result).toBeFalsy()
    })

    it('returns state value', () => {
      const state = {
        root: {
          isHighlightAllowed: true,
        },
      }
      const result = selectIsHighlightAllowed(state)
      expect(result).toBeTruthy()
    })
  })

  describe('selectIsSimilarityAllowed', () => {
    it('returns default value', () => {
      const result = selectIsSimilarityAllowed()
      expect(result).toBeFalsy()
    })

    it('returns state value', () => {
      const state = {
        root: {
          isSimilarityAllowed: true,
        },
      }
      const result = selectIsSimilarityAllowed(state)
      expect(result).toBeTruthy()
    })
  })

  describe('selectProjectClients', () => {
    it('returns default value', () => {
      const result = selectProjectClients()
      expect(result).toBeNull()
    })

    it('returns state value', () => {
      const state = {
        root: { clients: 'foo' },
      }
      const result = selectProjectClients(state)
      expect(result).toBeTruthy()
    })
  })
})
