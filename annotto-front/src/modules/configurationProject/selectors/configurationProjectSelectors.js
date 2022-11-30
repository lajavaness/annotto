import { ADMIN, DATASCIENTIST, USER } from 'shared/enums/rolesTypes'
import { createSelector } from 'reselect'

export const selectIsReady = (state) => state?.configuration?.isReady || false
export const selectIsSuccessPosted = (state) => state?.configuration?.isSuccessPosted || false
export const selectIsPosting = (state) => state?.configuration?.isPosting || false
export const selectIsSuccessUpdated = (state) => state?.configuration?.isSuccessUpdated || false
export const selectConfig = (state) => state?.configuration?.config || null
export const selectInitialConfig = (state) => state?.configuration?.initialConfig || null
export const selectInitialConfigDefaultTag = (state) =>
  state?.configuration?.initialConfig?.project?.defaultTags || null
export const selectConfigProject = (state) => state?.configuration?.config?.project || null
export const selectConfigProjectName = (state) => state?.configuration?.config?.project?.name || null
export const selectConfigProjectUsers = (state) => state?.configuration?.config?.project?.users || null
export const selectConfigProjectDatascientists = (state) =>
  state?.configuration?.config?.project?.dataScientists || null
export const selectConfigProjectAdmins = (state) => state?.configuration?.config?.project?.admins || null
export const selectConfigItems = (state) => state?.configuration?.config?.items || null
export const selectConfigPredictions = (state) => state?.configuration?.config?.predictions || null
export const selectConfigAnnotations = (state) => state?.configuration?.config?.annotations || null

export const selectConfigProjectUsersByRole = createSelector(
  [selectConfigProjectAdmins, selectConfigProjectDatascientists, selectConfigProjectUsers],
  (admins, dataScientists, users) => ({ [ADMIN]: admins, [DATASCIENTIST]: dataScientists, [USER]: users })
)
