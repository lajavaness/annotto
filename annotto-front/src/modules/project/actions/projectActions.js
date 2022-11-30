export const STARTUP = 'project/startup'
export const STARTUP_SUCCESS = 'project/startupSuccess'
export const STARTUP_FAILURE = 'project/startupFailure'

export const FETCH_PROJECT_ITEMS_TAGS = 'FETCH_PROJECT_ITEMS_TAGS'
export const FETCH_PROJECT_ITEMS_TAGS_SUCCESS = 'FETCH_PROJECT_ITEMS_TAGS_SUCCESS'
export const FETCH_PROJECT_ITEMS_TAGS_FAILURE = 'FETCH_PROJECT_ITEMS_TAGS_FAILURE'

export const PUT_PROJECT = 'PUT_PROJECT'
export const PUT_PROJECT_SUCCESS = 'PUT_PROJECT_SUCCESS'
export const PUT_PROJECT_FAILURE = 'PUT_PROJECT_FAILURE'

export const DELETE_PROJECT = 'DELETE_PROJECT'
export const DELETE_PROJECT_SUCCESS = 'DELETE_PROJECT_SUCCESS'
export const DELETE_PROJECT_FAILURE = 'DELETE_PROJECT_FAILURE'

export const FETCH_PROJECT_ITEMS = 'FETCH_PROJECT_ITEMS'
export const FETCH_PROJECT_ITEMS_SUCCESS = 'FETCH_PROJECT_ITEMS_SUCCESS'
export const FETCH_PROJECT_ITEMS_FAILURE = 'FETCH_PROJECT_ITEMS_FAILURE'

export const FETCH_PROJECT_STATS_TASKS = 'FETCH_PROJECT_STATS_TASKS'
export const FETCH_PROJECT_STATS_TASKS_SUCCESS = 'FETCH_PROJECT_STATS_TASKS_SUCCESS'
export const FETCH_PROJECT_STATS_TASKS_FAILURE = 'FETCH_PROJECT_STATS_TASKS_FAILURE'

export const FETCH_PROJECT_USERS = 'FETCH_PROJECT_USERS'
export const FETCH_PROJECT_USERS_SUCCESS = 'FETCH_PROJECT_USERS_SUCCESS'
export const FETCH_PROJECT_USERS_FAILURE = 'FETCH_PROJECT_USERS_FAILURE'

export const NAVIGATE_TO_ITEM = 'NAVIGATE_TO_ITEM'
export const NAVIGATE_TO_ITEM_SUCCESS = 'NAVIGATE_TO_ITEM_SUCCESS'
export const NAVIGATE_TO_ITEM_FAILURE = 'NAVIGATE_TO_ITEM_FAILURE'

export const FETCH_PROJECT_LOGS = 'FETCH_PROJECT_LOGS'
export const FETCH_PROJECT_LOGS_SUCCESS = 'FETCH_PROJECT_LOGS_SUCCESS'
export const FETCH_PROJECT_LOGS_FAILURE = 'FETCH_PROJECT_LOGS_FAILURE'

export const FETCH_PROJECT_ITEMS_AND_LOGS = 'FETCH_PROJECT_ITEMS_AND_LOGS'
export const FETCH_PROJECT_ITEMS_AND_LOGS_SUCCESS = 'FETCH_PROJECT_ITEMS_AND_LOGS_SUCCESS'
export const FETCH_PROJECT_ITEMS_AND_LOGS_FAILURE = 'FETCH_PROJECT_ITEMS_AND_LOGS_FAILURE'

export const POST_PROJECT_COMMENT = 'POST_PROJECT_COMMENT'
export const POST_PROJECT_COMMENT_SUCCESS = 'POST_PROJECT_COMMENT_SUCCESS'
export const POST_PROJECT_COMMENT_FAILURE = 'POST_PROJECT_COMMENT_FAILURE'

export const OPEN_FILTER_MODAL = 'OPEN_FILTER_MODAL'
export const CLOSE_FILTER_MODAL = 'CLOSE_FILTER_MODAL'

export const OPEN_GUIDE_MODAL = 'OPEN_GUIDE_MODAL'
export const CLOSE_GUIDE_MODAL = 'CLOSE_GUIDE_MODAL'

export const startup = () => {
  return {
    type: STARTUP,
  }
}

export const startupSuccess = () => {
  return {
    type: STARTUP_SUCCESS,
  }
}

export const startupFailure = (err) => {
  return {
    type: STARTUP_FAILURE,
    payload: {
      error: err,
      errorString: err && err.toString(),
    },
  }
}

export const fetchProjectItems = (projectId, index, limit) => ({
  type: FETCH_PROJECT_ITEMS,
  payload: { projectId, index, limit },
})

export const fetchProjectItemsSuccess = (items) => ({
  type: FETCH_PROJECT_ITEMS_SUCCESS,
  payload: { items },
})

export const fetchProjectItemsFailure = (err) => ({
  type: FETCH_PROJECT_ITEMS_FAILURE,
  payload: {
    error: err,
    errorString: err && err.toString(),
  },
})

export const fetchProjectItemsTags = (projectId) => ({
  type: FETCH_PROJECT_ITEMS_TAGS,
  payload: { projectId },
})

export const fetchProjectItemsTagsSuccess = (tags) => ({
  type: FETCH_PROJECT_ITEMS_TAGS_SUCCESS,
  payload: { tags },
})

export const fetchProjectItemsTagsFailure = (err) => ({
  type: FETCH_PROJECT_ITEMS_TAGS_FAILURE,
  payload: {
    error: err,
    errorString: err && err.toString(),
  },
})

export const fetchProjectStatsTasks = (projectId, index, limit) => ({
  type: FETCH_PROJECT_STATS_TASKS,
  payload: { projectId, index, limit },
})

export const fetchProjectStatsTasksSuccess = (tasks) => ({
  type: FETCH_PROJECT_STATS_TASKS_SUCCESS,
  payload: { tasks },
})

export const fetchProjectStatsTasksFailure = (err) => ({
  type: FETCH_PROJECT_STATS_TASKS_FAILURE,
  payload: {
    error: err,
    errorString: err && err.toString(),
  },
})

export const fetchProjectUsers = (projectId) => ({
  type: FETCH_PROJECT_USERS,
  payload: { projectId },
})

export const fetchProjectUsersSuccess = (users) => ({
  type: FETCH_PROJECT_USERS_SUCCESS,
  payload: { users },
})

export const fetchProjectUsersFailure = (err) => ({
  type: FETCH_PROJECT_USERS_FAILURE,
  payload: {
    error: err,
    errorString: err && err.toString(),
  },
})

export const putProject = (body) => ({
  type: PUT_PROJECT,
  payload: body,
})

export const putProjectSuccess = (body) => ({
  type: PUT_PROJECT_SUCCESS,
  payload: body,
})

export const putProjectFailure = (err) => ({
  type: PUT_PROJECT_FAILURE,
  payload: {
    error: err,
    errorString: err && err.toString(),
  },
})

export const navigateToItem = (projectId, itemId) => ({
  type: NAVIGATE_TO_ITEM,
  payload: {
    projectId,
    itemId,
  },
})

export const navigateToItemSuccess = () => ({
  type: NAVIGATE_TO_ITEM_SUCCESS,
})

export const navigateToItemFailure = (err) => ({
  type: NAVIGATE_TO_ITEM_FAILURE,
  payload: {
    error: err,
    errorString: err && err.toString(),
  },
})

export const fetchProjectLogs = (projectId, index, limit, type) => ({
  type: FETCH_PROJECT_LOGS,
  payload: { projectId, index, limit, type },
})

export const fetchProjectLogsSuccess = (logs) => ({
  type: FETCH_PROJECT_LOGS_SUCCESS,
  payload: { logs },
})

export const fetchProjectLogsFailure = (err) => ({
  type: FETCH_PROJECT_LOGS_FAILURE,
  payload: {
    error: err,
    errorString: err && err.toString(),
  },
})

export const fetchProjectItemsAndLogs = (projectId) => ({
  type: FETCH_PROJECT_ITEMS_AND_LOGS,
  payload: { projectId },
})

export const fetchProjectItemsAndLogsSuccess = () => ({
  type: FETCH_PROJECT_ITEMS_AND_LOGS_SUCCESS,
})

export const fetchProjectItemsAndLogsFailure = (err) => ({
  type: FETCH_PROJECT_ITEMS_AND_LOGS_FAILURE,
  payload: {
    error: err,
    errorString: err && err.toString(),
  },
})

export const postProjectComment = (comment) => ({
  type: POST_PROJECT_COMMENT,
  payload: { comment },
})

export const postProjectCommentSuccess = (comment) => ({
  type: POST_PROJECT_COMMENT_SUCCESS,
  payload: { comment },
})

export const postProjectCommentFailure = (err) => ({
  type: POST_PROJECT_COMMENT_FAILURE,
  payload: {
    error: err,
    errorString: err && err.toString(),
  },
})

export const deleteProject = (projectId) => ({
  type: DELETE_PROJECT,
  payload: { projectId },
})

export const deleteProjectSuccess = () => ({
  type: DELETE_PROJECT_SUCCESS,
})

export const deleteProjectFailure = (err) => ({
  type: DELETE_PROJECT_FAILURE,
  payload: {
    error: err,
    errorString: err && err.toString(),
  },
})

export const openFilterModal = () => ({
  type: OPEN_FILTER_MODAL,
})

export const closeFilterModal = () => ({
  type: CLOSE_FILTER_MODAL,
})

export const openGuideModal = () => ({
  type: OPEN_GUIDE_MODAL,
})

export const closeGuideModal = () => ({
  type: CLOSE_GUIDE_MODAL,
})
