import { createSelector } from 'reselect'

import { ADMIN, DATASCIENTIST, USER } from 'shared/enums/rolesTypes'
import { PROJECT_ITEMS_SIZE, PROJECT_STATS_TASKS_SIZE } from 'shared/enums/paginationTypes'

export const selectIsReady = (state) => state?.project?.isReady || false
export const selectIsSuccessPosted = (state) => state?.project?.isSuccessPosted || false
export const selectIsDeletePosted = (state) => state?.project?.isDeletePosted || false
export const selectProjectId = (state) => state?.project?.data?._id || null
export const selectProjectName = (state) => state?.project?.data?.name || null
export const selectProjectTasks = (state) => state?.project?.data?.tasks || null
export const selectProjectEntitiesRelationsGroup = (state) => state?.project?.data?.entitiesRelationsGroup || null
export const selectProjectHighlights = (state) => state?.project?.data?.highlights || null
export const selectProjectDefaultTags = (state) => state?.project?.data?.defaultTags || null
export const selectProjectShowPredictions = (state) => state?.project?.data?.showPredictions ?? true
export const selectProjectPrefillPredictions = (state) => state?.project?.data?.prefillPredictions || false
export const selectProjectGuideLines = (state) => state?.project?.data?.guidelines || null
export const selectProjectType = (state) => state?.project?.data?.type || null
export const selectProjectItemsTags = (state) => state?.project?.data.tags || null
export const selectProjectLogs = (state) => state?.project?.data.logs || null
export const selectProjectLogsIndex = (state) => state?.project?.data?.logs?.index || 0
export const selectProjectLogsTotal = (state) => state?.project?.data?.logs?.total || 0
export const selectProjectFilter = (state) => state?.project?.data.filter || null
export const selectProjectAnnotators = (state) => state?.project?.annotators || null
export const selectProjectUsers = (state) => state?.project?.data?.users || null
export const selectProjectDatascientists = (state) => state?.project?.data?.dataScientists || null
export const selectProjectAdmins = (state) => state?.project?.data?.admins || null
export const selectProjectFilterId = (state) => state?.project?.data.filter?.id || null
export const selectProjectFilterOperators = (state) => state?.project?.data?.operators || null
export const selectProjectFilterFields = (state) => state?.project?.data?.fields || null
export const selectProjectItems = (state) => state?.project?.items?.data || null
export const selectProjectItemsIndex = (state) => state?.project?.items?.index || 0
export const selectProjectItemsLimit = (state) => state?.project?.items?.limit || PROJECT_ITEMS_SIZE
export const selectProjectItemsPageCount = (state) => state?.project?.items?.pageCount || 0
export const selectProjectItemsTotal = (state) => state?.project?.items?.total || 0
export const selectProjectStatsTasks = (state) => state?.project?.tasks?.data || null
export const selectProjectStatsTasksIndex = (state) => state?.project?.tasks?.index || 0
export const selectProjectStatsTasksLimit = (state) => state?.project?.tasks?.limit || PROJECT_STATS_TASKS_SIZE
export const selectProjectStatsTasksPageCount = (state) => state?.project?.tasks?.pageCount || 0
export const selectProjectStatsTasksTotal = (state) => state?.project?.tasks?.total || 0
export const selectIsFilterModalOpen = (state) => state?.project?.isFilterModalOpen || false
export const selectIsGuideModalOpen = (state) => state?.project?.isGuideModalOpen || false

export const selectProjectUsersByRole = createSelector(
  [selectProjectAdmins, selectProjectDatascientists, selectProjectUsers],
  (admins, dataScientists, users) => ({ [ADMIN]: admins, [DATASCIENTIST]: dataScientists, [USER]: users })
)
