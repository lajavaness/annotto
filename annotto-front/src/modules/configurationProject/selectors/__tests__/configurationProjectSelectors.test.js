import { ADMIN, DATASCIENTIST, USER } from 'shared/enums/rolesTypes'
import {
  selectConfig,
  selectConfigAnnotations,
  selectConfigItems,
  selectConfigPredictions,
  selectConfigProject,
  selectConfigProjectAdmins,
  selectConfigProjectDatascientists,
  selectConfigProjectName,
  selectConfigProjectUsers,
  selectConfigProjectUsersByRole,
  selectInitialConfig,
  selectInitialConfigDefaultTag,
  selectIsPosting,
  selectIsReady,
  selectIsSuccessPosted,
  selectIsSuccessUpdated,
} from 'modules/configurationProject/selectors/configurationProjectSelectors'

describe('configurationProjectSelectors', () => {
  describe('selectIsReady', () => {
    it('returns default value', () => {
      const result = selectIsReady()
      expect(result).toBeFalsy()
    })

    it('returns state value', () => {
      const state = {
        configuration: {
          isReady: true,
        },
      }
      const result = selectIsReady(state)
      expect(result).toBeTruthy()
    })
  })

  describe('selectIsSuccessPosted', () => {
    it('returns default value', () => {
      const result = selectIsSuccessPosted()
      expect(result).toBeFalsy()
    })

    it('returns state value', () => {
      const state = {
        configuration: { isSuccessPosted: true },
      }
      const result = selectIsSuccessPosted(state)
      expect(result).toBeTruthy()
    })
  })

  describe('selectIsSuccessUpdated', () => {
    it('returns default value', () => {
      const result = selectIsSuccessUpdated()
      expect(result).toBeFalsy()
    })

    it('returns state value', () => {
      const state = {
        configuration: { isSuccessUpdated: true },
      }
      const result = selectIsSuccessUpdated(state)
      expect(result).toBeTruthy()
    })
  })

  describe('selectIsPosting', () => {
    it('returns default value', () => {
      const result = selectIsPosting()
      expect(result).toBeFalsy()
    })

    it('returns state value', () => {
      const state = {
        configuration: { isPosting: true },
      }
      const result = selectIsPosting(state)
      expect(result).toBeTruthy()
    })
  })

  describe('selectConfig', () => {
    it('returns default value', () => {
      const result = selectConfig()
      expect(result).toBeNull()
    })

    it('returns state value', () => {
      const state = {
        configuration: { config: 'foo' },
      }
      const result = selectConfig(state)
      expect(result).toEqual('foo')
    })
  })

  describe('selectInitialConfig', () => {
    it('returns default value', () => {
      const result = selectInitialConfig()
      expect(result).toBeNull()
    })

    it('returns state value', () => {
      const state = {
        configuration: { initialConfig: 'foo' },
      }
      const result = selectInitialConfig(state)
      expect(result).toEqual('foo')
    })
  })

  describe('selectInitialConfigDefaultTag', () => {
    it('returns default value', () => {
      const result = selectInitialConfigDefaultTag()
      expect(result).toBeNull()
    })

    it('returns state value', () => {
      const state = {
        configuration: { initialConfig: { project: { defaultTags: 'foo' } } },
      }
      const result = selectInitialConfigDefaultTag(state)
      expect(result).toEqual('foo')
    })
  })

  describe('selectConfigProject', () => {
    it('returns default value', () => {
      const result = selectConfigProject()
      expect(result).toBeNull()
    })

    it('returns state value', () => {
      const state = {
        configuration: { config: { project: 'foo' } },
      }
      const result = selectConfigProject(state)
      expect(result).toEqual('foo')
    })
  })

  describe('selectConfigProjectName', () => {
    it('returns default value', () => {
      const result = selectConfigProjectName()
      expect(result).toBeNull()
    })

    it('returns state value', () => {
      const state = {
        configuration: { config: { project: { name: 'foo' } } },
      }
      const result = selectConfigProjectName(state)
      expect(result).toEqual('foo')
    })
  })

  describe('selectConfigProjectUsers', () => {
    it('returns default value', () => {
      const result = selectConfigProjectUsers()
      expect(result).toBeNull()
    })

    it('returns state value', () => {
      const state = {
        configuration: { config: { project: { users: 'foo' } } },
      }
      const result = selectConfigProjectUsers(state)
      expect(result).toEqual('foo')
    })
  })

  describe('selectConfigProjectDatascientists', () => {
    it('returns default value', () => {
      const result = selectConfigProjectDatascientists()
      expect(result).toBeNull()
    })

    it('returns state value', () => {
      const state = {
        configuration: { config: { project: { dataScientists: 'foo' } } },
      }
      const result = selectConfigProjectDatascientists(state)
      expect(result).toEqual('foo')
    })
  })

  describe('selectConfigProjectAdmins', () => {
    it('returns default value', () => {
      const result = selectConfigProjectAdmins()
      expect(result).toBeNull()
    })

    it('returns state value', () => {
      const state = {
        configuration: { config: { project: { admins: 'foo' } } },
      }
      const result = selectConfigProjectAdmins(state)
      expect(result).toEqual('foo')
    })
  })

  describe('selectConfigItems', () => {
    it('returns default value', () => {
      const result = selectConfigItems()
      expect(result).toBeNull()
    })

    it('returns state value', () => {
      const state = {
        configuration: { config: { items: 'foo' } },
      }
      const result = selectConfigItems(state)
      expect(result).toEqual('foo')
    })
  })

  describe('selectConfigPredictions', () => {
    it('returns default value', () => {
      const result = selectConfigPredictions()
      expect(result).toBeNull()
    })

    it('returns state value', () => {
      const state = {
        configuration: { config: { predictions: 'foo' } },
      }
      const result = selectConfigPredictions(state)
      expect(result).toEqual('foo')
    })
  })

  describe('selectConfigAnnotations', () => {
    it('returns default value', () => {
      const result = selectConfigAnnotations()
      expect(result).toBeNull()
    })

    it('returns state value', () => {
      const state = {
        configuration: { config: { annotations: 'foo' } },
      }
      const result = selectConfigAnnotations(state)
      expect(result).toEqual('foo')
    })
  })

  describe('selectConfigProjectUsersByRole', () => {
    it('returns default value', () => {
      const result = selectConfigProjectUsersByRole({})
      expect(result).toEqual({ [ADMIN]: null, [DATASCIENTIST]: null, [USER]: null })
    })

    it('returns state value', () => {
      const state = {
        configuration: { config: { project: { users: ['foo'], admins: ['foo'], dataScientists: ['foo'] } } },
      }
      const result = selectConfigProjectUsersByRole(state)
      expect(result).toEqual({ [ADMIN]: ['foo'], [DATASCIENTIST]: ['foo'], [USER]: ['foo'] })
    })
  })
})
