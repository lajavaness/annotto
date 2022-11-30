import produce from 'immer'

import { FETCH_PROJECTS_SUCCESS, STARTUP_SUCCESS } from 'modules/projects/actions/projectsActions'

export const initialState = {
  isReady: false,
  data: [],
  total: 0,
  index: 0,
  limit: 0,
  pageCount: 0,
}

export default (state, action) => {
  return produce(state || initialState, (draft) => {
    switch (action.type) {
      case STARTUP_SUCCESS: {
        draft.isReady = true
        break
      }
      case FETCH_PROJECTS_SUCCESS: {
        draft.data = [...draft.data, ...action.payload.projects.data]
        draft.total = action.payload.projects.total
        draft.index = action.payload.projects.index
        draft.limit = action.payload.projects.limit
        draft.pageCount = action.payload.projects.pageCount
        break
      }
      default: {
        // do nothing
      }
    }
  })
}
