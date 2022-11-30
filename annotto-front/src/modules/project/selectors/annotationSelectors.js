import { createSelector } from 'reselect'

export const selectIsReady = (state) => state?.project?.annotation?.isReady || false
export const selectIsAnnotationPosted = (state) => state?.project?.annotation?.isAnnotationPosted || false
export const selectAnnotationItems = (state) => state?.project?.annotation?.items || null
export const selectCurrentItemId = (state) => state?.project?.annotation?.currentItemId || null

export const selectCurrentItem = createSelector(
  [selectAnnotationItems, selectCurrentItemId],
  (items, currentItemId) => items?.find(({ _id }) => currentItemId === _id) || null
)

export const selectCurrentItemAnnotations = (state) => selectCurrentItem(state)?.annotations || null
export const selectCurrentItemLogs = (state) => selectCurrentItem(state)?.logs || null
export const selectCurrentItemPredictions = (state) => selectCurrentItem(state)?.predictions?.keys || null
export const selectCurrentItemEntitiesRelations = (state) => selectCurrentItem(state)?.entitiesRelations || null
