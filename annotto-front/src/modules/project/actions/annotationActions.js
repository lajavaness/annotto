export const MOUNT_ANNOTATION_PAGE = 'MOUNT_ANNOTATION_PAGE'
export const MOUNT_ANNOTATION_PAGE_SUCCESS = 'MOUNT_ANNOTATION_PAGE_SUCCESS'
export const MOUNT_ANNOTATION_PAGE_FAILURE = 'MOUNT_ANNOTATION_PAGE_FAILURE'

export const SET_CURRENT_ITEM = 'SET_CURRENT_ITEM'
export const SET_CURRENT_ITEM_SUCCESS = 'SET_CURRENT_ITEM_SUCCESS'
export const SET_CURRENT_ITEM_FAILURE = 'SET_CURRENT_ITEM_FAILURE'

export const UPDATE_CURRENT_ANNOTATION_ITEM = 'UPDATE_CURRENT_ANNOTATION_ITEM'
export const UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS = 'UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS'
export const UPDATE_CURRENT_ANNOTATION_ITEM_FAILURE = 'UPDATE_CURRENT_ANNOTATION_ITEM_FAILURE'

export const FETCH_ANNOTATION_ITEM = 'FETCH_ANNOTATION_ITEM'
export const FETCH_ANNOTATION_ITEM_SUCCESS = 'FETCH_ANNOTATION_ITEM_SUCCESS'
export const FETCH_ANNOTATION_ITEM_FAILURE = 'FETCH_ANNOTATION_ITEM_FAILURE'

export const RESET_ANNOTATION_ITEMS = 'RESET_ANNOTATION_ITEMS'
export const RESET_ANNOTATION_ITEMS_SUCCESS = 'RESET_ANNOTATION_ITEMS_SUCCESS'
export const RESET_ANNOTATION_ITEMS_FAILURE = 'RESET_ANNOTATION_ITEMS_FAILURE'

export const PUT_ITEM_TAGS = 'PUT_ITEM_TAGS'
export const PUT_ITEM_TAGS_SUCCESS = 'PUT_ITEM_TAGS_SUCCESS'
export const PUT_ITEM_TAGS_FAILURE = 'PUT_ITEM_TAGS_FAILURE'

export const FETCH_CURRENT_ITEM_ANNOTATIONS = 'FETCH_CURRENT_ITEM_ANNOTATIONS'
export const FETCH_CURRENT_ITEM_ANNOTATIONS_SUCCESS = 'FETCH_CURRENT_ITEM_ANNOTATIONS_SUCCESS'
export const FETCH_CURRENT_ITEM_ANNOTATIONS_FAILURE = 'FETCH_CURRENT_ITEM_ANNOTATIONS_FAILURE'

export const NAVIGATE_TO_NEXT_ITEM = 'NAVIGATE_TO_NEXT_ITEM'
export const NAVIGATE_TO_NEXT_ITEM_SUCCESS = 'NAVIGATE_TO_NEXT_ITEM_SUCCESS'
export const NAVIGATE_TO_NEXT_ITEM_FAILURE = 'NAVIGATE_TO_NEXT_ITEM_FAILURE'

export const NAVIGATE_TO_PREV_ITEM = 'NAVIGATE_TO_PREV_ITEM'
export const NAVIGATE_TO_PREV_ITEM_SUCCESS = 'NAVIGATE_TO_PREV_ITEM_SUCCESS'
export const NAVIGATE_TO_PREV_ITEM_FAILURE = 'NAVIGATE_TO_PREV_ITEM_FAILURE'

export const SAVE_ANNOTATIONS_ITEM = 'SAVE_ANNOTATIONS_ITEM'
export const SAVE_ANNOTATIONS_ITEM_SUCCESS = 'SAVE_ANNOTATIONS_ITEM_SUCCESS'
export const SAVE_ANNOTATIONS_ITEM_FAILURE = 'SAVE_ANNOTATIONS_ITEM_FAILURE'

export const FETCH_ITEM_LOGS = 'FETCH_ITEM_LOGS'
export const FETCH_ITEM_LOGS_SUCCESS = 'FETCH_ITEM_LOGS_SUCCESS'
export const FETCH_ITEM_LOGS_FAILURE = 'FETCH_ITEM_LOGS_FAILURE'

export const POST_ITEM_COMMENT = 'POST_ITEM_COMMENT'
export const POST_ITEM_COMMENT_SUCCESS = 'POST_ITEM_COMMENT_SUCCESS'
export const POST_ITEM_COMMENT_FAILURE = 'POST_ITEM_COMMENT_FAILURE'

export const mountAnnotationPage = () => ({
  type: MOUNT_ANNOTATION_PAGE,
})

export const mountAnnotationPageSuccess = (isReady = false) => ({
  type: MOUNT_ANNOTATION_PAGE_SUCCESS,
  payload: {
    isReady,
  },
})

export const mountAnnotationPageFailure = (err) => ({
  type: MOUNT_ANNOTATION_PAGE_FAILURE,
  payload: {
    error: err,
    errorString: err && err.toString(),
  },
})

export const fetchCurrentItemAnnotations = (item, projectId) => ({
  type: FETCH_CURRENT_ITEM_ANNOTATIONS,
  payload: { item, projectId },
})

export const fetchCurrentItemAnnotationsSuccess = (item) => ({
  type: FETCH_CURRENT_ITEM_ANNOTATIONS_SUCCESS,
  payload: { item },
})

export const fetchCurrentItemAnnotationsFailure = (err) => ({
  type: FETCH_CURRENT_ITEM_ANNOTATIONS_FAILURE,
  payload: {
    error: err,
    errorString: err && err.toString(),
  },
})

export const setCurrentItem = (itemId) => ({
  type: SET_CURRENT_ITEM,
  payload: { itemId },
})

export const setCurrentItemSuccess = (itemId) => ({
  type: SET_CURRENT_ITEM_SUCCESS,
  payload: { itemId },
})

export const setCurrentItemFailure = (err) => ({
  type: SET_CURRENT_ITEM_FAILURE,
  payload: {
    error: err,
    errorString: err && err.toString(),
  },
})

export const updateCurrentAnnotationItem = (item, items) => ({
  type: UPDATE_CURRENT_ANNOTATION_ITEM,
  payload: { item, items },
})

export const updateCurrentAnnotationItemSuccess = (items) => ({
  type: UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS,
  payload: { items },
})

export const updateCurrentAnnotationItemFailure = (err) => ({
  type: UPDATE_CURRENT_ANNOTATION_ITEM_FAILURE,
  payload: {
    error: err,
    errorString: err && err.toString(),
  },
})

export const navigateToNextItem = () => ({
  type: NAVIGATE_TO_NEXT_ITEM,
})

export const navigateToNextItemSuccess = () => ({
  type: NAVIGATE_TO_NEXT_ITEM_SUCCESS,
})

export const navigateToNextItemFailure = (err) => ({
  type: NAVIGATE_TO_NEXT_ITEM_FAILURE,
  payload: {
    error: err,
    errorString: err && err.toString(),
  },
})

export const navigateToPrevItem = () => ({
  type: NAVIGATE_TO_PREV_ITEM,
})

export const navigateToPrevItemSuccess = () => ({
  type: NAVIGATE_TO_PREV_ITEM_SUCCESS,
})

export const navigateToPrevItemFailure = (err) => ({
  type: NAVIGATE_TO_PREV_ITEM_FAILURE,
  payload: {
    error: err,
    errorString: err && err.toString(),
  },
})

export const saveAnnotationsItem = (annotations, entitiesRelations, projectId, itemId) => ({
  type: SAVE_ANNOTATIONS_ITEM,
  payload: { annotations, entitiesRelations, projectId, itemId },
})

export const saveAnnotationsItemSuccess = (annotations) => ({
  type: SAVE_ANNOTATIONS_ITEM_SUCCESS,
  payload: { annotations },
})

export const saveAnnotationsItemFailure = (err) => ({
  type: SAVE_ANNOTATIONS_ITEM_FAILURE,
  payload: {
    error: err,
    errorString: err && err.toString(),
  },
})

export const resetAnnotationItems = () => ({
  type: RESET_ANNOTATION_ITEMS,
})

export const resetAnnotationItemsSuccess = (items) => ({
  type: RESET_ANNOTATION_ITEMS_SUCCESS,
  payload: {
    items,
  },
})

export const resetAnnotationItemsFailure = (err) => ({
  type: RESET_ANNOTATION_ITEMS_FAILURE,
  payload: {
    error: err,
    errorString: err && err.toString(),
  },
})

export const fetchAnnotationItem = (itemId, projectId) => ({
  type: FETCH_ANNOTATION_ITEM,
  payload: { itemId, projectId },
})

export const fetchAnnotationItemSuccess = (item) => ({
  type: FETCH_ANNOTATION_ITEM_SUCCESS,
  payload: { item },
})

export const fetchAnnotationItemFailure = (err) => ({
  type: FETCH_ANNOTATION_ITEM_FAILURE,
  payload: {
    error: err,
    errorString: err && err.toString(),
  },
})

export const putItemTags = (itemId, projectId, tags) => ({
  type: PUT_ITEM_TAGS,
  payload: { itemId, projectId, tags },
})

export const putItemTagsSuccess = () => ({
  type: PUT_ITEM_TAGS_SUCCESS,
})

export const putItemTagsFailure = (err) => ({
  type: PUT_ITEM_TAGS_FAILURE,
  payload: {
    error: err,
    errorString: err && err.toString(),
  },
})

export const fetchItemLogs = (itemId) => ({
  type: FETCH_ITEM_LOGS,
  payload: { itemId },
})

export const fetchItemLogsSuccess = (logs) => ({
  type: FETCH_ITEM_LOGS_SUCCESS,
  payload: logs,
})

export const fetchItemLogsFailure = (err) => ({
  type: FETCH_ITEM_LOGS_FAILURE,
  payload: {
    error: err,
    errorString: err && err.toString(),
  },
})

export const postItemComment = (comment) => ({
  type: POST_ITEM_COMMENT,
  payload: { comment },
})

export const postItemCommentSuccess = (logs) => ({
  type: POST_ITEM_COMMENT_SUCCESS,
  payload: logs,
})

export const postItemCommentFailure = (err) => ({
  type: POST_ITEM_COMMENT_FAILURE,
  payload: {
    error: err,
    errorString: err && err.toString(),
  },
})
