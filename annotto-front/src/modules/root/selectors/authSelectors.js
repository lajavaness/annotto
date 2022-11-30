import { get } from 'lodash'

export const selectUserInfo = (state) => get(state, 'auth.userInfo', null)
export const selectKeycloakInstance = (state) => get(state, 'auth.keycloakInstance', null)
export const selectIsAuthenticated = (state) => get(state, 'auth.keycloakInstance.authenticated', false)
