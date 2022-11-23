import { get } from 'lodash'

export const selectIsAppReady = (state) => get(state, 'root.isReady', false)
export const selectExpirationDate = (state) => get(state, 'root.expirationDate', null)
export const selectUsers = (state) => get(state, 'root.users', [])
export const selectHttpError = (state) => get(state, 'root.httpError', null)
export const selectIsHighlightAllowed = (state) => get(state, 'root.isHighlightAllowed', false)
export const selectIsSimilarityAllowed = (state) => get(state, 'root.isSimilarityAllowed', false)
export const selectProjectClients = (state) => state?.root?.clients || null
