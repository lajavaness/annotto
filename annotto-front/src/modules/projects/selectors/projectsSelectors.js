import { PROJECTS_SIZE } from 'shared/enums/projectsTypes'

export const selectIsReady = (state) => state?.projects?.isReady || false
export const selectProjects = (state) => state?.projects?.data || null
export const selectTotalProjects = (state) => state?.projects?.total || 0
export const selectIndexProjects = (state) => state?.projects?.index || 0
export const selectLimitProjects = (state) => state?.projects?.limit || PROJECTS_SIZE
