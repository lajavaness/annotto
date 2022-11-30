import produce from 'immer'

import { LOGIN_SUCCESS, LOGOUT_SUCCESS } from 'modules/root/actions/authActions'

const initialState = {
  userInfo: null,
  keycloakInstance: null,
}

export default (state, action) => {
  return produce(state || initialState, (draft) => {
    switch (action.type) {
      case LOGIN_SUCCESS: {
        draft.userInfo = action.payload.userInfo
        draft.keycloakInstance = action.payload.keycloakInstance
        break
      }

      case LOGOUT_SUCCESS: {
        draft.userInfo = null
        break
      }

      default: {
        // do nothing
      }
    }
  })
}
