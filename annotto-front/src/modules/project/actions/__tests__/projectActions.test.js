import {
  CLOSE_FILTER_MODAL,
  CLOSE_GUIDE_MODAL,
  DELETE_PROJECT,
  DELETE_PROJECT_FAILURE,
  DELETE_PROJECT_SUCCESS,
  FETCH_PROJECT_ITEMS,
  FETCH_PROJECT_ITEMS_AND_LOGS,
  FETCH_PROJECT_ITEMS_AND_LOGS_FAILURE,
  FETCH_PROJECT_ITEMS_AND_LOGS_SUCCESS,
  FETCH_PROJECT_ITEMS_FAILURE,
  FETCH_PROJECT_ITEMS_SUCCESS,
  FETCH_PROJECT_ITEMS_TAGS,
  FETCH_PROJECT_ITEMS_TAGS_FAILURE,
  FETCH_PROJECT_ITEMS_TAGS_SUCCESS,
  FETCH_PROJECT_LOGS,
  FETCH_PROJECT_LOGS_FAILURE,
  FETCH_PROJECT_LOGS_SUCCESS,
  FETCH_PROJECT_STATS_TASKS,
  FETCH_PROJECT_STATS_TASKS_FAILURE,
  FETCH_PROJECT_STATS_TASKS_SUCCESS,
  NAVIGATE_TO_ITEM,
  NAVIGATE_TO_ITEM_FAILURE,
  NAVIGATE_TO_ITEM_SUCCESS,
  OPEN_FILTER_MODAL,
  OPEN_GUIDE_MODAL,
  POST_PROJECT_COMMENT,
  POST_PROJECT_COMMENT_FAILURE,
  POST_PROJECT_COMMENT_SUCCESS,
  PUT_PROJECT,
  PUT_PROJECT_FAILURE,
  PUT_PROJECT_SUCCESS,
  STARTUP,
  STARTUP_FAILURE,
  STARTUP_SUCCESS,
  closeFilterModal,
  closeGuideModal,
  deleteProject,
  deleteProjectFailure,
  deleteProjectSuccess,
  fetchProjectItems,
  fetchProjectItemsAndLogs,
  fetchProjectItemsAndLogsFailure,
  fetchProjectItemsAndLogsSuccess,
  fetchProjectItemsFailure,
  fetchProjectItemsSuccess,
  fetchProjectItemsTags,
  fetchProjectItemsTagsFailure,
  fetchProjectItemsTagsSuccess,
  fetchProjectLogs,
  fetchProjectLogsFailure,
  fetchProjectLogsSuccess,
  fetchProjectStatsTasks,
  fetchProjectStatsTasksFailure,
  fetchProjectStatsTasksSuccess,
  navigateToItem,
  navigateToItemFailure,
  navigateToItemSuccess,
  openFilterModal,
  openGuideModal,
  postProjectComment,
  postProjectCommentFailure,
  postProjectCommentSuccess,
  putProject,
  putProjectFailure,
  putProjectSuccess,
  startup,
  startupFailure,
  startupSuccess,
} from 'modules/project/actions/projectActions'

describe('projectActions', () => {
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

  describe('fetchProjectItems', () => {
    it('returns type', () => {
      const { type } = fetchProjectItems()
      expect(type).toBe(FETCH_PROJECT_ITEMS)
    })

    it('returns payload', () => {
      const projectId = 1
      const index = 1
      const limit = 10
      const { payload } = fetchProjectItems(projectId, index, limit)
      expect(payload).toEqual({ index, limit, projectId })
    })
  })

  describe('fetchProjectItemsSuccess', () => {
    it('returns type', () => {
      const { type } = fetchProjectItemsSuccess()
      expect(type).toBe(FETCH_PROJECT_ITEMS_SUCCESS)
    })

    it('returns payload', () => {
      const items = ['Foo']
      const { payload } = fetchProjectItemsSuccess(items)
      expect(payload).toEqual({ items })
    })
  })

  describe('fetchProjectItemsFailure', () => {
    it('returns type', () => {
      const { type } = fetchProjectItemsFailure()
      expect(type).toBe(FETCH_PROJECT_ITEMS_FAILURE)
    })

    it('returns payload', () => {
      const error = new Error('foo')
      const { payload } = fetchProjectItemsFailure(error)
      expect(payload).toEqual({ error, errorString: error.toString() })
    })
  })

  describe('fetchProjectItemsAndLogs', () => {
    it('returns type', () => {
      const { type } = fetchProjectItemsAndLogs()
      expect(type).toBe(FETCH_PROJECT_ITEMS_AND_LOGS)
    })

    it('returns payload', () => {
      const projectId = 1
      const { payload } = fetchProjectItemsAndLogs(projectId)
      expect(payload).toEqual({ projectId })
    })
  })

  describe('fetchProjectItemsAndLogsSuccess', () => {
    it('returns type', () => {
      const { type } = fetchProjectItemsAndLogsSuccess()
      expect(type).toBe(FETCH_PROJECT_ITEMS_AND_LOGS_SUCCESS)
    })
  })

  describe('fetchProjectItemsAndLogsFailure', () => {
    it('returns type', () => {
      const { type } = fetchProjectItemsAndLogsFailure()
      expect(type).toBe(FETCH_PROJECT_ITEMS_AND_LOGS_FAILURE)
    })

    it('returns payload', () => {
      const error = new Error('foo')
      const { payload } = fetchProjectItemsAndLogsFailure(error)
      expect(payload).toEqual({ error, errorString: error.toString() })
    })
  })

  describe('fetchProjectStatsTasks', () => {
    it('returns type', () => {
      const { type } = fetchProjectStatsTasks()
      expect(type).toBe(FETCH_PROJECT_STATS_TASKS)
    })

    it('returns payload', () => {
      const projectId = 1
      const index = 1
      const limit = 10
      const { payload } = fetchProjectStatsTasks(projectId, index, limit)
      expect(payload).toEqual({ index, limit, projectId })
    })
  })

  describe('fetchProjectStatsTasksSuccess', () => {
    it('returns type', () => {
      const { type } = fetchProjectStatsTasksSuccess()
      expect(type).toBe(FETCH_PROJECT_STATS_TASKS_SUCCESS)
    })

    it('returns payload', () => {
      const tasks = ['Foo']
      const { payload } = fetchProjectStatsTasksSuccess(tasks)
      expect(payload).toEqual({ tasks })
    })
  })

  describe('fetchProjectStatsTasksFailure', () => {
    it('returns type', () => {
      const { type } = fetchProjectStatsTasksFailure()
      expect(type).toBe(FETCH_PROJECT_STATS_TASKS_FAILURE)
    })

    it('returns payload', () => {
      const error = new Error('foo')
      const { payload } = fetchProjectStatsTasksFailure(error)
      expect(payload).toEqual({ error, errorString: error.toString() })
    })
  })

  describe('putProject', () => {
    it('returns type', () => {
      const { type } = putProject()
      expect(type).toBe(PUT_PROJECT)
    })

    it('returns payload', () => {
      const body = 'Foo'
      const { payload } = putProject(body)
      expect(payload).toEqual(body)
    })
  })

  describe('putProjectSuccess', () => {
    it('returns type', () => {
      const { type } = putProjectSuccess()
      expect(type).toBe(PUT_PROJECT_SUCCESS)
    })

    it('returns payload', () => {
      const body = 'Foo'
      const { payload } = putProjectSuccess(body)
      expect(payload).toEqual(body)
    })
  })

  describe('putProjectFailure', () => {
    it('returns type', () => {
      const { type } = putProjectFailure()
      expect(type).toBe(PUT_PROJECT_FAILURE)
    })

    it('returns payload', () => {
      const error = new Error('foo')
      const { payload } = putProjectFailure(error)
      expect(payload).toEqual({ error, errorString: error.toString() })
    })
  })

  describe('fetchProjectItemsTags', () => {
    it('returns type', () => {
      const { type } = fetchProjectItemsTags()
      expect(type).toBe(FETCH_PROJECT_ITEMS_TAGS)
    })

    it('returns payload', () => {
      const projectId = 1
      const { payload } = fetchProjectItemsTags(projectId)
      expect(payload).toEqual({ projectId })
    })
  })

  describe('fetchProjectItemsTagsSuccess', () => {
    it('returns type', () => {
      const { type } = fetchProjectItemsTagsSuccess()
      expect(type).toBe(FETCH_PROJECT_ITEMS_TAGS_SUCCESS)
    })

    it('returns payload', () => {
      const tags = ['Foo']
      const { payload } = fetchProjectItemsTagsSuccess(tags)
      expect(payload).toEqual({ tags })
    })
  })

  describe('fetchProjectItemsTagsFailure', () => {
    it('returns type', () => {
      const { type } = fetchProjectItemsTagsFailure()
      expect(type).toBe(FETCH_PROJECT_ITEMS_TAGS_FAILURE)
    })

    it('returns payload', () => {
      const error = new Error('foo')
      const { payload } = fetchProjectItemsTagsFailure(error)
      expect(payload).toEqual({ error, errorString: error.toString() })
    })
  })

  describe('navigateToItem', () => {
    it('returns type', () => {
      const { type } = navigateToItem()
      expect(type).toBe(NAVIGATE_TO_ITEM)
    })

    it('returns payload', () => {
      const itemId = 'foo'
      const projectId = 'foo'
      const { payload } = navigateToItem(projectId, itemId)
      expect(payload).toEqual({ itemId, projectId })
    })
  })

  describe('navigateToItemSuccess', () => {
    it('returns type', () => {
      const { type } = navigateToItemSuccess()
      expect(type).toBe(NAVIGATE_TO_ITEM_SUCCESS)
    })
  })

  describe('navigateToItemFailure', () => {
    it('returns type', () => {
      const { type } = navigateToItemFailure()
      expect(type).toBe(NAVIGATE_TO_ITEM_FAILURE)
    })

    it('returns payload', () => {
      const error = new Error('foo')
      const { payload } = navigateToItemFailure(error)
      expect(payload).toEqual({ error, errorString: error.toString() })
    })
  })

  describe('fetchProjectLogs', () => {
    it('returns type', () => {
      const { type } = fetchProjectLogs()
      expect(type).toBe(FETCH_PROJECT_LOGS)
    })

    it('returns payload', () => {
      const projectId = 'Foo'
      const limit = 0
      const index = 0
      const type = 'foo'
      const { payload } = fetchProjectLogs(projectId, index, limit, type)
      expect(payload).toEqual({ projectId, index, limit, type })
    })
  })

  describe('fetchProjectLogsSuccess', () => {
    it('returns type', () => {
      const { type } = fetchProjectLogsSuccess()
      expect(type).toBe(FETCH_PROJECT_LOGS_SUCCESS)
    })

    it('returns payload', () => {
      const logs = ['Foo']
      const { payload } = fetchProjectLogsSuccess(logs)
      expect(payload).toEqual({ logs })
    })
  })

  describe('fetchProjectLogsFailure', () => {
    it('returns type', () => {
      const { type } = fetchProjectLogsFailure()
      expect(type).toBe(FETCH_PROJECT_LOGS_FAILURE)
    })

    it('returns payload', () => {
      const error = new Error('foo')
      const { payload } = fetchProjectLogsFailure(error)
      expect(payload).toEqual({ error, errorString: error.toString() })
    })
  })

  describe('postProjectComment', () => {
    it('returns type', () => {
      const { type } = postProjectComment()
      expect(type).toBe(POST_PROJECT_COMMENT)
    })

    it('returns payload', () => {
      const comment = 'Foo'
      const { payload } = postProjectComment(comment)
      expect(payload).toEqual({ comment })
    })
  })

  describe('postProjectCommentSuccess', () => {
    it('returns type', () => {
      const { type } = postProjectCommentSuccess()
      expect(type).toBe(POST_PROJECT_COMMENT_SUCCESS)
    })

    it('returns payload', () => {
      const comment = 'Foo'
      const { payload } = postProjectCommentSuccess(comment)
      expect(payload).toEqual({ comment })
    })
  })

  describe('postProjectCommentFailure', () => {
    it('returns type', () => {
      const { type } = postProjectCommentFailure()
      expect(type).toBe(POST_PROJECT_COMMENT_FAILURE)
    })

    it('returns payload', () => {
      const error = new Error('foo')
      const { payload } = postProjectCommentFailure(error)
      expect(payload).toEqual({ error, errorString: error.toString() })
    })
  })

  describe('deleteProject', () => {
    it('returns type', () => {
      const { type } = deleteProject()
      expect(type).toBe(DELETE_PROJECT)
    })

    it('returns payload', () => {
      const projectId = 'Foo'
      const { payload } = deleteProject(projectId)
      expect(payload).toEqual({ projectId })
    })
  })

  describe('deleteProjectSuccess', () => {
    it('returns type', () => {
      const { type } = deleteProjectSuccess()
      expect(type).toBe(DELETE_PROJECT_SUCCESS)
    })
  })

  describe('deleteProjectFailure', () => {
    it('returns type', () => {
      const { type } = deleteProjectFailure()
      expect(type).toBe(DELETE_PROJECT_FAILURE)
    })

    it('returns payload', () => {
      const error = new Error('foo')
      const { payload } = deleteProjectFailure(error)
      expect(payload).toEqual({ error, errorString: error.toString() })
    })
  })

  describe('openFilterModal', () => {
    it('returns type', () => {
      const { type } = openFilterModal()
      expect(type).toBe(OPEN_FILTER_MODAL)
    })
  })

  describe('closeFilterModal', () => {
    it('returns type', () => {
      const { type } = closeFilterModal()
      expect(type).toBe(CLOSE_FILTER_MODAL)
    })
  })

  describe('openGuideModal', () => {
    it('returns type', () => {
      const { type } = openGuideModal()
      expect(type).toBe(OPEN_GUIDE_MODAL)
    })
  })

  describe('closeGuideModal', () => {
    it('returns type', () => {
      const { type } = closeGuideModal()
      expect(type).toBe(CLOSE_GUIDE_MODAL)
    })
  })
})
