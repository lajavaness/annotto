import { ITEMS } from 'shared/enums/configurationsProjectPropertiesTypes'

import {
  EXPORT_CONFIG,
  EXPORT_CONFIG_FAILURE,
  EXPORT_CONFIG_SUCCESS,
  EXPORT_CURRENT_CONFIG,
  EXPORT_CURRENT_CONFIG_FAILURE,
  EXPORT_CURRENT_CONFIG_SUCCESS,
  POST_FILE,
  POST_FILE_FAILURE,
  POST_FILE_SUCCESS,
  POST_PROJECT,
  POST_PROJECT_FAILURE,
  POST_PROJECT_SUCCESS,
  PUT_CONFIG_PROJECT,
  PUT_CONFIG_PROJECT_FAILURE,
  PUT_CONFIG_PROJECT_SUCCESS,
  RESET_CONFIG,
  STARTUP,
  STARTUP_FAILURE,
  STARTUP_SUCCESS,
  UPDATE_CONFIG_PROJECT,
  UPDATE_CONFIG_PROJECT_FAILURE,
  UPDATE_CONFIG_PROJECT_SUCCESS,
  UPLOAD_ANNOTATIONS,
  UPLOAD_ITEMS,
  UPLOAD_PREDICTIONS,
  exportConfig,
  exportConfigFailure,
  exportConfigSuccess,
  exportCurrentConfig,
  exportCurrentConfigFailure,
  exportCurrentConfigSuccess,
  postFile,
  postFileFailure,
  postFileSuccess,
  postProject,
  postProjectFailure,
  postProjectSuccess,
  putConfigProject,
  putConfigProjectFailure,
  putConfigProjectSuccess,
  resetConfig,
  startup,
  startupFailure,
  startupSuccess,
  updateConfigProject,
  updateConfigProjectFailure,
  updateConfigProjectSuccess,
  uploadAnnotations,
  uploadItems,
  uploadPredictions,
} from 'modules/configurationProject/actions/configurationProjectActions'

describe('configurationProjectActions', () => {
  describe('startup', () => {
    it('returns type', () => {
      const { type } = startup()
      expect(type).toBe(STARTUP)
    })
  })

  describe('startupSuccess', () => {
    it('returns type', () => {
      const { type } = startupSuccess()
      expect(type).toBe(STARTUP_SUCCESS)
    })

    it('returns payload', () => {
      const project = 'foo'
      const { payload } = startupSuccess(project)
      expect(payload).toEqual({ project })
    })
  })

  describe('startupFailure', () => {
    it('returns type', () => {
      const { type } = startupFailure()
      expect(type).toBe(STARTUP_FAILURE)
    })

    it('returns payload', () => {
      const err = new Error('project')
      const { payload } = startupFailure(err)
      expect(payload).toEqual({ error: err, errorString: err && err.toString() })
    })
  })

  describe('postProject', () => {
    it('returns type', () => {
      const { type } = postProject()
      expect(type).toBe(POST_PROJECT)
    })
  })

  describe('postProjectSuccess', () => {
    it('returns type', () => {
      const { type } = postProjectSuccess()
      expect(type).toBe(POST_PROJECT_SUCCESS)
    })
  })

  describe('postProjectFailure', () => {
    it('returns type', () => {
      const { type } = postProjectFailure()
      expect(type).toBe(POST_PROJECT_FAILURE)
    })

    it('returns payload', () => {
      const error = new Error('foo')
      const { payload } = postProjectFailure(error)
      expect(payload).toEqual({ error, errorString: error.toString() })
    })
  })

  describe('putConfigProject', () => {
    it('returns type', () => {
      const { type } = putConfigProject()
      expect(type).toBe(PUT_CONFIG_PROJECT)
    })
  })

  describe('putConfigProjectSuccess', () => {
    it('returns type', () => {
      const { type } = putConfigProjectSuccess()
      expect(type).toBe(PUT_CONFIG_PROJECT_SUCCESS)
    })
  })

  describe('putConfigProjectFailure', () => {
    it('returns type', () => {
      const { type } = putConfigProjectFailure()
      expect(type).toBe(PUT_CONFIG_PROJECT_FAILURE)
    })

    it('returns payload', () => {
      const error = new Error('foo')
      const { payload } = putConfigProjectFailure(error)
      expect(payload).toEqual({ error, errorString: error.toString() })
    })
  })

  describe('updateConfigProject', () => {
    it('returns type', () => {
      const { type } = updateConfigProject()
      expect(type).toBe(UPDATE_CONFIG_PROJECT)
    })

    it('returns payload', () => {
      const config = 'foo'
      const key = 'bar'
      const { payload } = updateConfigProject(key, config)
      expect(payload).toEqual({ key, config })
    })
  })

  describe('updateConfigProjectSuccess', () => {
    it('returns type', () => {
      const { type } = updateConfigProjectSuccess()
      expect(type).toBe(UPDATE_CONFIG_PROJECT_SUCCESS)
    })

    it('returns payload', () => {
      const config = ['Foo']
      const { payload } = updateConfigProjectSuccess(config)
      expect(payload).toEqual({ config })
    })
  })

  describe('updateConfigProjectFailure', () => {
    it('returns type', () => {
      const { type } = updateConfigProjectFailure()
      expect(type).toBe(UPDATE_CONFIG_PROJECT_FAILURE)
    })

    it('returns payload', () => {
      const error = new Error('foo')
      const { payload } = updateConfigProjectFailure(error)
      expect(payload).toEqual({ error, errorString: error.toString() })
    })
  })

  describe('exportCurrentConfig', () => {
    it('returns type', () => {
      const { type } = exportCurrentConfig()
      expect(type).toBe(EXPORT_CURRENT_CONFIG)
    })
  })

  describe('exportCurrentConfigSuccess', () => {
    it('returns type', () => {
      const { type } = exportCurrentConfigSuccess()
      expect(type).toBe(EXPORT_CURRENT_CONFIG_SUCCESS)
    })
  })

  describe('exportCurrentConfigFailure', () => {
    it('returns type', () => {
      const { type } = exportCurrentConfigFailure()
      expect(type).toBe(EXPORT_CURRENT_CONFIG_FAILURE)
    })

    it('returns payload', () => {
      const error = new Error('foo')
      const { payload } = exportCurrentConfigFailure(error)
      expect(payload).toEqual({ error, errorString: error.toString() })
    })
  })

  describe('resetConfig', () => {
    it('returns type', () => {
      const { type } = resetConfig()
      expect(type).toBe(RESET_CONFIG)
    })
  })

  describe('exportConfig', () => {
    it('returns type', () => {
      const { type } = exportConfig()
      expect(type).toBe(EXPORT_CONFIG)
    })

    it('returns payload', () => {
      const types = 'foo'
      const { payload } = exportConfig(types)
      expect(payload).toEqual({ types })
    })
  })

  describe('exportConfigSuccess', () => {
    it('returns type', () => {
      const { type } = exportConfigSuccess()
      expect(type).toBe(EXPORT_CONFIG_SUCCESS)
    })
  })

  describe('exportConfigFailure', () => {
    it('returns type', () => {
      const { type } = exportConfigFailure()
      expect(type).toBe(EXPORT_CONFIG_FAILURE)
    })

    it('returns payload', () => {
      const error = new Error('foo')
      const { payload } = exportConfigFailure(error)
      expect(payload).toEqual({ error, errorString: error.toString() })
    })
  })

  describe('uploadItems', () => {
    it('returns type', () => {
      const { type } = uploadItems()
      expect(type).toBe(UPLOAD_ITEMS)
    })

    it('returns payload', () => {
      const file = 'foo'
      const isUpdate = false
      const { payload } = uploadItems(file, isUpdate)
      expect(payload).toEqual({ file, isUpdate })
    })
  })

  describe('uploadAnnotations', () => {
    it('returns type', () => {
      const { type } = uploadAnnotations()
      expect(type).toBe(UPLOAD_ANNOTATIONS)
    })

    it('returns payload', () => {
      const file = 'foo'
      const { payload } = uploadAnnotations(file)
      expect(payload).toEqual({ file })
    })
  })

  describe('uploadPredictions', () => {
    it('returns type', () => {
      const { type } = uploadPredictions()
      expect(type).toBe(UPLOAD_PREDICTIONS)
    })

    it('returns payload', () => {
      const file = 'foo'
      const { payload } = uploadPredictions(file)
      expect(payload).toEqual({ file })
    })
  })

  describe('postFile', () => {
    it('returns type', () => {
      const { type } = postFile()
      expect(type).toBe(POST_FILE)
    })

    it('returns payload', () => {
      const file = 'foo'
      const isUpdate = false
      const projectId = 'bar'
      const route = 'zog'
      const type = ITEMS
      const transactionId = 'foo'
      const { payload } = postFile(projectId, route, type, file, isUpdate, transactionId)
      expect(payload).toEqual({ projectId, route, type, file, isUpdate, transactionId })
    })
  })

  describe('postFileSuccess', () => {
    it('returns type', () => {
      const { type } = postFileSuccess()
      expect(type).toBe(POST_FILE_SUCCESS)
    })
  })

  describe('postFileFailure', () => {
    it('returns type', () => {
      const { type } = postFileFailure()
      expect(type).toBe(POST_FILE_FAILURE)
    })

    it('returns payload', () => {
      const error = new Error('foo')
      const { payload } = postFileFailure(error)
      expect(payload).toEqual({ error, errorString: error.toString() })
    })
  })
})
