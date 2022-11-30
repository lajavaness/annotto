import {
  FETCH_ANNOTATION_ITEM,
  FETCH_ANNOTATION_ITEM_FAILURE,
  FETCH_ANNOTATION_ITEM_SUCCESS,
  FETCH_CURRENT_ITEM_ANNOTATIONS,
  FETCH_CURRENT_ITEM_ANNOTATIONS_FAILURE,
  FETCH_CURRENT_ITEM_ANNOTATIONS_SUCCESS,
  FETCH_ITEM_LOGS,
  FETCH_ITEM_LOGS_FAILURE,
  FETCH_ITEM_LOGS_SUCCESS,
  MOUNT_ANNOTATION_PAGE,
  MOUNT_ANNOTATION_PAGE_FAILURE,
  MOUNT_ANNOTATION_PAGE_SUCCESS,
  NAVIGATE_TO_NEXT_ITEM,
  NAVIGATE_TO_NEXT_ITEM_FAILURE,
  NAVIGATE_TO_NEXT_ITEM_SUCCESS,
  NAVIGATE_TO_PREV_ITEM,
  NAVIGATE_TO_PREV_ITEM_FAILURE,
  NAVIGATE_TO_PREV_ITEM_SUCCESS,
  POST_ITEM_COMMENT,
  POST_ITEM_COMMENT_FAILURE,
  POST_ITEM_COMMENT_SUCCESS,
  PUT_ITEM_TAGS,
  PUT_ITEM_TAGS_FAILURE,
  PUT_ITEM_TAGS_SUCCESS,
  RESET_ANNOTATION_ITEMS,
  RESET_ANNOTATION_ITEMS_FAILURE,
  RESET_ANNOTATION_ITEMS_SUCCESS,
  SAVE_ANNOTATIONS_ITEM,
  SAVE_ANNOTATIONS_ITEM_FAILURE,
  SAVE_ANNOTATIONS_ITEM_SUCCESS,
  SET_CURRENT_ITEM,
  SET_CURRENT_ITEM_FAILURE,
  SET_CURRENT_ITEM_SUCCESS,
  UPDATE_CURRENT_ANNOTATION_ITEM,
  UPDATE_CURRENT_ANNOTATION_ITEM_FAILURE,
  UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS,
  fetchAnnotationItem,
  fetchAnnotationItemFailure,
  fetchAnnotationItemSuccess,
  fetchCurrentItemAnnotations,
  fetchCurrentItemAnnotationsFailure,
  fetchCurrentItemAnnotationsSuccess,
  fetchItemLogs,
  fetchItemLogsFailure,
  fetchItemLogsSuccess,
  mountAnnotationPage,
  mountAnnotationPageFailure,
  mountAnnotationPageSuccess,
  navigateToNextItem,
  navigateToNextItemFailure,
  navigateToNextItemSuccess,
  navigateToPrevItem,
  navigateToPrevItemFailure,
  navigateToPrevItemSuccess,
  postItemComment,
  postItemCommentFailure,
  postItemCommentSuccess,
  putItemTags,
  putItemTagsFailure,
  putItemTagsSuccess,
  resetAnnotationItems,
  resetAnnotationItemsFailure,
  resetAnnotationItemsSuccess,
  saveAnnotationsItem,
  saveAnnotationsItemFailure,
  saveAnnotationsItemSuccess,
  setCurrentItem,
  setCurrentItemFailure,
  setCurrentItemSuccess,
  updateCurrentAnnotationItem,
  updateCurrentAnnotationItemFailure,
  updateCurrentAnnotationItemSuccess,
} from 'modules/project/actions/annotationActions'

describe('annotationActions', () => {
  describe('mountLambdasPage', () => {
    it('returns type', () => {
      const { type } = mountAnnotationPage()
      expect(type).toBe(MOUNT_ANNOTATION_PAGE)
    })
  })

  describe('mountLambdasPageSuccess', () => {
    it('returns type', () => {
      const { type } = mountAnnotationPageSuccess()
      expect(type).toBe(MOUNT_ANNOTATION_PAGE_SUCCESS)
    })

    it('returns payload', () => {
      const isReady = true
      const { payload } = mountAnnotationPageSuccess(isReady)
      expect(payload).toEqual({ isReady })
    })

    it('returns default payload', () => {
      const isReady = false
      const { payload } = mountAnnotationPageSuccess()
      expect(payload).toEqual({ isReady })
    })
  })

  describe('mountLambdasPageFailure', () => {
    it('returns type', () => {
      const { type } = mountAnnotationPageFailure()
      expect(type).toBe(MOUNT_ANNOTATION_PAGE_FAILURE)
    })

    it('returns payload', () => {
      const error = new Error('foo')
      const { payload } = mountAnnotationPageFailure(error)
      expect(payload).toEqual({ error, errorString: error.toString() })
    })
  })

  describe('fetchCurrentItemAnnotations', () => {
    it('returns type', () => {
      const { type } = fetchCurrentItemAnnotations()
      expect(type).toBe(FETCH_CURRENT_ITEM_ANNOTATIONS)
    })

    it('returns payload', () => {
      const item = 'Foo'
      const projectId = 'bar'
      const { payload } = fetchCurrentItemAnnotations(item, projectId)
      expect(payload).toEqual({ item, projectId })
    })
  })

  describe('fetchCurrentItemAnnotationsSuccess', () => {
    it('returns type', () => {
      const { type } = fetchCurrentItemAnnotationsSuccess()
      expect(type).toBe(FETCH_CURRENT_ITEM_ANNOTATIONS_SUCCESS)
    })

    it('returns payload', () => {
      const item = 'Foo'
      const { payload } = fetchCurrentItemAnnotationsSuccess(item)
      expect(payload).toEqual({ item })
    })
  })

  describe('fetchCurrentItemAnnotationsFailure', () => {
    it('returns type', () => {
      const { type } = fetchCurrentItemAnnotationsFailure()
      expect(type).toBe(FETCH_CURRENT_ITEM_ANNOTATIONS_FAILURE)
    })

    it('returns payload', () => {
      const error = new Error('foo')
      const { payload } = fetchCurrentItemAnnotationsFailure(error)
      expect(payload).toEqual({ error, errorString: error.toString() })
    })
  })

  describe('setCurrentItem', () => {
    it('returns type', () => {
      const { type } = setCurrentItem()
      expect(type).toBe(SET_CURRENT_ITEM)
    })

    it('returns payload', () => {
      const itemId = 'Foo'
      const { payload } = setCurrentItem(itemId)
      expect(payload).toEqual({ itemId })
    })
  })

  describe('setCurrentItemSuccess', () => {
    it('returns type', () => {
      const { type } = setCurrentItemSuccess()
      expect(type).toBe(SET_CURRENT_ITEM_SUCCESS)
    })

    it('returns payload', () => {
      const itemId = 'Foo'
      const { payload } = setCurrentItemSuccess(itemId)
      expect(payload).toEqual({ itemId })
    })
  })

  describe('setCurrentItemFailure', () => {
    it('returns type', () => {
      const { type } = setCurrentItemFailure()
      expect(type).toBe(SET_CURRENT_ITEM_FAILURE)
    })

    it('returns payload', () => {
      const error = new Error('foo')
      const { payload } = setCurrentItemFailure(error)
      expect(payload).toEqual({ error, errorString: error.toString() })
    })
  })

  describe('updateCurrentAnnotationItem', () => {
    it('returns type', () => {
      const { type } = updateCurrentAnnotationItem()
      expect(type).toBe(UPDATE_CURRENT_ANNOTATION_ITEM)
    })

    it('returns payload', () => {
      const item = 'Foo'
      const items = ['Foo', 'bar']
      const { payload } = updateCurrentAnnotationItem(item, items)
      expect(payload).toEqual({ item, items })
    })
  })

  describe('updateCurrentAnnotationItemSuccess', () => {
    it('returns type', () => {
      const { type } = updateCurrentAnnotationItemSuccess()
      expect(type).toBe(UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS)
    })

    it('returns payload', () => {
      const items = 'Foo'
      const { payload } = updateCurrentAnnotationItemSuccess(items)
      expect(payload).toEqual({ items })
    })
  })

  describe('updateCurrentAnnotationItemFailure', () => {
    it('returns type', () => {
      const { type } = updateCurrentAnnotationItemFailure()
      expect(type).toBe(UPDATE_CURRENT_ANNOTATION_ITEM_FAILURE)
    })

    it('returns payload', () => {
      const error = new Error('foo')
      const { payload } = updateCurrentAnnotationItemFailure(error)
      expect(payload).toEqual({ error, errorString: error.toString() })
    })
  })

  describe('resetAnnotationItems', () => {
    it('returns type', () => {
      const { type } = resetAnnotationItems()
      expect(type).toBe(RESET_ANNOTATION_ITEMS)
    })
  })

  describe('resetAnnotationItemsSuccess', () => {
    it('returns type', () => {
      const { type } = resetAnnotationItemsSuccess()
      expect(type).toBe(RESET_ANNOTATION_ITEMS_SUCCESS)
    })

    it('returns payload', () => {
      const items = []
      const { payload } = resetAnnotationItemsSuccess(items)
      expect(payload).toEqual({ items })
    })
  })

  describe('resetAnnotationItemsFailure', () => {
    it('returns type', () => {
      const { type } = resetAnnotationItemsFailure()
      expect(type).toBe(RESET_ANNOTATION_ITEMS_FAILURE)
    })

    it('returns payload', () => {
      const error = new Error('foo')
      const { payload } = resetAnnotationItemsFailure(error)
      expect(payload).toEqual({ error, errorString: error.toString() })
    })
  })

  describe('navigateToNextItem', () => {
    it('returns type', () => {
      const { type } = navigateToNextItem()
      expect(type).toBe(NAVIGATE_TO_NEXT_ITEM)
    })
  })

  describe('navigateToNextItemSuccess', () => {
    it('returns type', () => {
      const { type } = navigateToNextItemSuccess()
      expect(type).toBe(NAVIGATE_TO_NEXT_ITEM_SUCCESS)
    })
  })

  describe('navigateToNextItemFailure', () => {
    it('returns type', () => {
      const { type } = navigateToNextItemFailure()
      expect(type).toBe(NAVIGATE_TO_NEXT_ITEM_FAILURE)
    })

    it('returns payload', () => {
      const error = new Error('foo')
      const { payload } = navigateToNextItemFailure(error)
      expect(payload).toEqual({ error, errorString: error.toString() })
    })
  })

  describe('navigateToPrevItem', () => {
    it('returns type', () => {
      const { type } = navigateToPrevItem()
      expect(type).toBe(NAVIGATE_TO_PREV_ITEM)
    })
  })

  describe('navigateToPrevItemSuccess', () => {
    it('returns type', () => {
      const { type } = navigateToPrevItemSuccess()
      expect(type).toBe(NAVIGATE_TO_PREV_ITEM_SUCCESS)
    })
  })

  describe('navigateToPrevItemFailure', () => {
    it('returns type', () => {
      const { type } = navigateToPrevItemFailure()
      expect(type).toBe(NAVIGATE_TO_PREV_ITEM_FAILURE)
    })

    it('returns payload', () => {
      const error = new Error('foo')
      const { payload } = navigateToPrevItemFailure(error)
      expect(payload).toEqual({ error, errorString: error.toString() })
    })
  })

  describe('saveAnnotationsItem', () => {
    it('returns type', () => {
      const { type } = saveAnnotationsItem()
      expect(type).toBe(SAVE_ANNOTATIONS_ITEM)
    })

    it('returns payload', () => {
      const annotations = ['Foo']
      const entitiesRelations = ['Bar']
      const itemId = 'bar'
      const projectId = 'zog'

      const { payload } = saveAnnotationsItem(annotations, entitiesRelations, projectId, itemId)
      expect(payload).toEqual({ annotations, entitiesRelations, projectId, itemId })
    })
  })

  describe('saveAnnotationsItemSuccess', () => {
    it('returns type', () => {
      const { type } = saveAnnotationsItemSuccess()
      expect(type).toBe(SAVE_ANNOTATIONS_ITEM_SUCCESS)
    })

    it('returns payload', () => {
      const annotations = ['Foo']
      const { payload } = saveAnnotationsItemSuccess(annotations)
      expect(payload).toEqual({ annotations })
    })
  })

  describe('saveAnnotationsItemFailure', () => {
    it('returns type', () => {
      const { type } = saveAnnotationsItemFailure()
      expect(type).toBe(SAVE_ANNOTATIONS_ITEM_FAILURE)
    })

    it('returns payload', () => {
      const error = new Error('foo')
      const { payload } = saveAnnotationsItemFailure(error)
      expect(payload).toEqual({ error, errorString: error.toString() })
    })
  })

  describe('fetchAnnotationItem', () => {
    it('returns type', () => {
      const { type } = fetchAnnotationItem()
      expect(type).toBe(FETCH_ANNOTATION_ITEM)
    })

    it('returns payload', () => {
      const itemId = 'foo'
      const projectId = 'foo'
      const { payload } = fetchAnnotationItem(itemId, projectId)
      expect(payload).toEqual({ itemId, projectId })
    })
  })

  describe('fetchAnnotationItemSuccess', () => {
    it('returns type', () => {
      const { type } = fetchAnnotationItemSuccess()
      expect(type).toBe(FETCH_ANNOTATION_ITEM_SUCCESS)
    })

    it('returns payload', () => {
      const item = 'Foo'
      const { payload } = fetchAnnotationItemSuccess(item)
      expect(payload).toEqual({ item })
    })
  })

  describe('fetchAnnotationItemFailure', () => {
    it('returns type', () => {
      const { type } = fetchAnnotationItemFailure()
      expect(type).toBe(FETCH_ANNOTATION_ITEM_FAILURE)
    })

    it('returns payload', () => {
      const error = new Error('foo')
      const { payload } = fetchAnnotationItemFailure(error)
      expect(payload).toEqual({ error, errorString: error.toString() })
    })
  })

  describe('putItemTags', () => {
    it('returns type', () => {
      const { type } = putItemTags()
      expect(type).toBe(PUT_ITEM_TAGS)
    })

    it('returns payload', () => {
      const itemId = 'Foo'
      const tags = ['bar', 'Foo']
      const projectId = 'bar'
      const { payload } = putItemTags(itemId, projectId, tags)
      expect(payload).toEqual({ itemId, projectId, tags })
    })
  })

  describe('putItemTagsSuccess', () => {
    it('returns type', () => {
      const { type } = putItemTagsSuccess()
      expect(type).toBe(PUT_ITEM_TAGS_SUCCESS)
    })
  })

  describe('putItemTagsFailure', () => {
    it('returns type', () => {
      const { type } = putItemTagsFailure()
      expect(type).toBe(PUT_ITEM_TAGS_FAILURE)
    })

    it('returns payload', () => {
      const error = new Error('foo')
      const { payload } = putItemTagsFailure(error)
      expect(payload).toEqual({ error, errorString: error.toString() })
    })
  })
})

describe('fetchItemLogs', () => {
  it('returns type', () => {
    const { type } = fetchItemLogs()
    expect(type).toBe(FETCH_ITEM_LOGS)
  })

  it('returns payload', () => {
    const itemId = 'Foo'
    const { payload } = fetchItemLogs(itemId)
    expect(payload).toEqual({ itemId })
  })
})

describe('fetchItemLogsSuccess', () => {
  it('returns type', () => {
    const { type } = fetchItemLogsSuccess()
    expect(type).toBe(FETCH_ITEM_LOGS_SUCCESS)
  })

  it('returns payload', () => {
    const logs = ['Foo']
    const { payload } = fetchItemLogsSuccess(logs)
    expect(payload).toEqual(logs)
  })
})

describe('fetchItemLogsFailure', () => {
  it('returns type', () => {
    const { type } = fetchItemLogsFailure()
    expect(type).toBe(FETCH_ITEM_LOGS_FAILURE)
  })

  it('returns payload', () => {
    const error = new Error('foo')
    const { payload } = fetchItemLogsFailure(error)
    expect(payload).toEqual({ error, errorString: error.toString() })
  })
})

describe('postItemComment', () => {
  it('returns type', () => {
    const { type } = postItemComment()
    expect(type).toBe(POST_ITEM_COMMENT)
  })

  it('returns payload', () => {
    const comment = 'Foo'
    const { payload } = postItemComment(comment)
    expect(payload).toEqual({ comment })
  })
})

describe('postItemCommentSuccess', () => {
  it('returns type', () => {
    const { type } = postItemCommentSuccess()
    expect(type).toBe(POST_ITEM_COMMENT_SUCCESS)
  })

  it('returns payload', () => {
    const logs = ['Foo']
    const { payload } = postItemCommentSuccess(logs)
    expect(payload).toEqual(logs)
  })
})

describe('postItemCommentFailure', () => {
  it('returns type', () => {
    const { type } = postItemCommentFailure()
    expect(type).toBe(POST_ITEM_COMMENT_FAILURE)
  })

  it('returns payload', () => {
    const error = new Error('foo')
    const { payload } = postItemCommentFailure(error)
    expect(payload).toEqual({ error, errorString: error.toString() })
  })
})
