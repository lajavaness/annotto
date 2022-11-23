import { PROJECT_ITEMS_SIZE, PROJECT_STATS_TASKS_SIZE } from 'shared/enums/paginationTypes'

import { ADMIN, DATASCIENTIST, USER } from 'shared/enums/rolesTypes'

import {
	selectIsDeletePosted,
	selectIsFilterModalOpen,
	selectIsGuideModalOpen,
	selectIsReady,
	selectIsSuccessPosted,
	selectProjectAdmins,
	selectProjectAnnotators,
	selectProjectDatascientists,
	selectProjectDefaultTags,
	selectProjectEntitiesRelationsGroup,
	selectProjectFilter,
	selectProjectFilterFields,
	selectProjectFilterId,
	selectProjectFilterOperators,
	selectProjectGuideLines,
	selectProjectHighlights,
	selectProjectId,
	selectProjectItems,
	selectProjectItemsIndex,
	selectProjectItemsLimit,
	selectProjectItemsPageCount,
	selectProjectItemsTags,
	selectProjectItemsTotal,
	selectProjectLogs,
	selectProjectLogsIndex,
	selectProjectLogsTotal,
	selectProjectName,
	selectProjectPrefillPredictions,
	selectProjectShowPredictions,
	selectProjectStatsTasks,
	selectProjectStatsTasksIndex,
	selectProjectStatsTasksLimit,
	selectProjectStatsTasksPageCount,
	selectProjectStatsTasksTotal,
	selectProjectTasks,
	selectProjectType,
	selectProjectUsers,
	selectProjectUsersByRole,
} from 'modules/project/selectors/projectSelectors'

describe('projectSelectors', () => {
	describe('selectIsReady', () => {
		it('returns default value', () => {
			const result = selectIsReady()
			expect(result).toBeFalsy()
		})

		it('returns state value', () => {
			const state = {
				project: {
					isReady: true,
				},
			}
			const result = selectIsReady(state)
			expect(result).toBeTruthy()
		})
	})

	describe('isSuccessPosted', () => {
		it('returns default value', () => {
			const result = selectIsSuccessPosted()
			expect(result).toBeFalsy()
		})

		it('returns state value', () => {
			const state = {
				project: {
					isSuccessPosted: true,
				},
			}
			const result = selectIsSuccessPosted(state)
			expect(result).toBeTruthy()
		})
	})

	describe('selectIsDeletePosted', () => {
		it('returns default value', () => {
			const result = selectIsDeletePosted()
			expect(result).toBeFalsy()
		})

		it('returns state value', () => {
			const state = {
				project: {
					isDeletePosted: true,
				},
			}
			const result = selectIsDeletePosted(state)
			expect(result).toBeTruthy()
		})
	})

	describe('selectProjectId', () => {
		it('returns default value', () => {
			const result = selectProjectId()
			expect(result).toBeNull()
		})

		it('returns state value', () => {
			const state = {
				project: {
					data: {
						_id: 'foo',
					},
				},
			}
			const result = selectProjectId(state)
			expect(result).toEqual('foo')
		})
	})

	describe('selectProjectName', () => {
		it('returns default value', () => {
			const result = selectProjectName()
			expect(result).toBeNull()
		})

		it('returns state value', () => {
			const state = {
				project: {
					data: {
						name: 'foo',
					},
				},
			}
			const result = selectProjectName(state)
			expect(result).toEqual('foo')
		})
	})

	describe('selectProjectTasks', () => {
		it('returns default value', () => {
			const result = selectProjectTasks()
			expect(result).toBeNull()
		})

		it('returns state value', () => {
			const state = {
				project: {
					data: {
						tasks: [{ foo: 'bar' }],
					},
				},
			}
			const result = selectProjectTasks(state)
			expect(result).toEqual([{ foo: 'bar' }])
		})
	})

	describe('selectProjectEntitiesRelationsGroup', () => {
		it('returns default value', () => {
			const result = selectProjectEntitiesRelationsGroup()
			expect(result).toBeNull()
		})

		it('returns state value', () => {
			const state = {
				project: {
					data: {
						entitiesRelationsGroup: [{ foo: 'bar' }],
					},
				},
			}
			const result = selectProjectEntitiesRelationsGroup(state)
			expect(result).toEqual([{ foo: 'bar' }])
		})
	})

	describe('selectProjectHighlights', () => {
		it('returns default value', () => {
			const result = selectProjectHighlights()
			expect(result).toBeNull()
		})

		it('returns state value', () => {
			const state = {
				project: {
					data: {
						highlights: ['foo'],
					},
				},
			}
			const result = selectProjectHighlights(state)
			expect(result).toEqual(['foo'])
		})
	})

	describe('selectProjectShowPredictions', () => {
		it('returns default value', () => {
			const result = selectProjectShowPredictions()
			expect(result).toBeTruthy()
		})

		it('returns state value', () => {
			const state = {
				project: {
					data: {
						showPredictions: true,
					},
				},
			}
			const result = selectProjectShowPredictions(state)
			expect(result).toBeTruthy()
		})
	})

	describe('selectProjectPrefillPredictions', () => {
		it('returns default value', () => {
			const result = selectProjectPrefillPredictions()
			expect(result).toBeFalsy()
		})

		it('returns state value', () => {
			const state = {
				project: {
					data: {
						prefillPredictions: true,
					},
				},
			}
			const result = selectProjectPrefillPredictions(state)
			expect(result).toBeTruthy()
		})
	})

	describe('selectProjectType', () => {
		it('returns default value', () => {
			const result = selectProjectType()
			expect(result).toBeNull()
		})

		it('returns state value', () => {
			const state = {
				project: {
					data: {
						type: 'text',
					},
				},
			}
			const result = selectProjectType(state)
			expect(result).toEqual('text')
		})
	})

	describe('selectProjectItemsTags', () => {
		it('returns default value', () => {
			const result = selectProjectItemsTags()
			expect(result).toBeNull()
		})

		it('returns state value', () => {
			const state = {
				project: {
					data: {
						tags: ['foo'],
					},
				},
			}
			const result = selectProjectItemsTags(state)
			expect(result).toEqual(state.project.data.tags)
		})
	})

	describe('selectProjectDefaultTags', () => {
		it('returns default value', () => {
			const result = selectProjectDefaultTags()
			expect(result).toBeNull()
		})

		it('returns state value', () => {
			const state = {
				project: {
					data: {
						defaultTags: ['foo'],
					},
				},
			}
			const result = selectProjectDefaultTags(state)
			expect(result).toEqual(state.project.data.defaultTags)
		})
	})

	describe('selectProjectFilter', () => {
		it('returns default value', () => {
			const result = selectProjectFilter()
			expect(result).toBeNull()
		})

		it('returns state value', () => {
			const state = {
				project: {
					data: {
						filter: ['foo'],
					},
				},
			}
			const result = selectProjectFilter(state)
			expect(result).toEqual(state.project.data.filter)
		})
	})

	describe('selectProjectAnnotators', () => {
		it('returns default value', () => {
			const result = selectProjectAnnotators()
			expect(result).toBeNull()
		})

		it('returns state value', () => {
			const state = {
				project: {
					annotators: ['foo'],
				},
			}
			const result = selectProjectAnnotators(state)
			expect(result).toEqual(state.project.annotators)
		})
	})

	describe('selectProjectUsers', () => {
		it('returns default value', () => {
			const result = selectProjectUsers()
			expect(result).toBeNull()
		})

		it('returns state value', () => {
			const state = {
				project: {
					data: {
						users: ['foo'],
					},
				},
			}
			const result = selectProjectUsers(state)
			expect(result).toEqual(state.project.data.users)
		})
	})

	describe('selectProjectDatascientists', () => {
		it('returns default value', () => {
			const result = selectProjectDatascientists()
			expect(result).toBeNull()
		})

		it('returns state value', () => {
			const state = {
				project: {
					data: {
						dataScientists: ['foo'],
					},
				},
			}
			const result = selectProjectDatascientists(state)
			expect(result).toEqual(state.project.data.dataScientists)
		})
	})

	describe('selectProjectAdmins', () => {
		it('returns default value', () => {
			const result = selectProjectAdmins()
			expect(result).toBeNull()
		})

		it('returns state value', () => {
			const state = {
				project: {
					data: {
						admins: ['foo'],
					},
				},
			}
			const result = selectProjectAdmins(state)
			expect(result).toEqual(state.project.data.admins)
		})
	})

	describe('selectProjectFilterId', () => {
		it('returns default value', () => {
			const result = selectProjectFilterId()
			expect(result).toBeNull()
		})

		it('returns state value', () => {
			const state = {
				project: {
					data: {
						filter: { id: 123 },
					},
				},
			}
			const result = selectProjectFilterId(state)
			expect(result).toEqual(state.project.data.filter.id)
		})
	})

	describe('selectProjectFilterOperators', () => {
		it('returns default value', () => {
			const result = selectProjectFilterOperators()
			expect(result).toBeNull()
		})

		it('returns state value', () => {
			const state = {
				project: {
					data: {
						operators: ['foo'],
					},
				},
			}
			const result = selectProjectFilterOperators(state)
			expect(result).toEqual(state.project.data.operators)
		})
	})

	describe('selectProjectGuideLines', () => {
		it('returns default value', () => {
			const result = selectProjectGuideLines()
			expect(result).toBeNull()
		})

		it('returns state value', () => {
			const state = {
				project: {
					data: {
						guidelines: 'foo',
					},
				},
			}
			const result = selectProjectGuideLines(state)
			expect(result).toEqual('foo')
		})
	})

	describe('selectProjectFilterFields', () => {
		it('returns default value', () => {
			const result = selectProjectFilterFields()
			expect(result).toBeNull()
		})

		it('returns state value', () => {
			const state = {
				project: {
					data: {
						fields: ['foo'],
					},
				},
			}
			const result = selectProjectFilterFields(state)
			expect(result).toEqual(state.project.data.fields)
		})
	})

	describe('selectProjectLogs', () => {
		it('returns default value', () => {
			const result = selectProjectLogs()
			expect(result).toBeNull()
		})

		it('returns state value', () => {
			const state = {
				project: {
					data: {
						logs: {
							foo: 'foo',
						},
					},
				},
			}
			const result = selectProjectLogs(state)
			expect(result).toEqual(state.project.data.logs)
		})
	})

	describe('selectProjectLogsIndex', () => {
		it('returns default value', () => {
			const result = selectProjectLogsIndex()
			expect(result).toEqual(0)
		})

		it('returns state value', () => {
			const state = {
				project: {
					data: {
						logs: {
							index: 1,
						},
					},
				},
			}
			const result = selectProjectLogsIndex(state)
			expect(result).toEqual(state.project.data.logs.index)
		})
	})

	describe('selectProjectLogsTotal', () => {
		it('returns default value', () => {
			const result = selectProjectLogsTotal()
			expect(result).toEqual(0)
		})

		it('returns state value', () => {
			const state = {
				project: {
					data: {
						logs: {
							total: 1,
						},
					},
				},
			}
			const result = selectProjectLogsTotal(state)
			expect(result).toEqual(state.project.data.logs.total)
		})
	})

	describe('selectProjectItems', () => {
		it('returns default value', () => {
			const result = selectProjectItems()
			expect(result).toBeNull()
		})

		it('returns state value', () => {
			const state = {
				project: {
					items: {
						data: ['foo'],
					},
				},
			}
			const result = selectProjectItems(state)
			expect(result).toEqual(['foo'])
		})
	})

	describe('selectProjectItemsIndex', () => {
		it('returns default value', () => {
			const result = selectProjectItemsIndex()
			expect(result).toEqual(0)
		})

		it('returns state value', () => {
			const state = {
				project: {
					items: {
						index: 1,
					},
				},
			}
			const result = selectProjectItemsIndex(state)
			expect(result).toEqual(1)
		})
	})

	describe('selectProjectItemsLimit', () => {
		it('returns default value', () => {
			const result = selectProjectItemsLimit()
			expect(result).toEqual(PROJECT_ITEMS_SIZE)
		})

		it('returns state value', () => {
			const state = {
				project: {
					items: {
						limit: PROJECT_ITEMS_SIZE,
					},
				},
			}
			const result = selectProjectItemsLimit(state)
			expect(result).toEqual(PROJECT_ITEMS_SIZE)
		})
	})

	describe('selectProjectItemsPageCount', () => {
		it('returns default value', () => {
			const result = selectProjectItemsPageCount()
			expect(result).toEqual(0)
		})

		it('returns state value', () => {
			const state = {
				project: {
					items: {
						pageCount: 1,
					},
				},
			}
			const result = selectProjectItemsPageCount(state)
			expect(result).toEqual(1)
		})
	})

	describe('selectProjectItemsLimit', () => {
		it('returns default value', () => {
			const result = selectProjectItemsTotal()
			expect(result).toEqual(0)
		})

		it('returns state value', () => {
			const state = {
				project: {
					items: {
						total: 1,
					},
				},
			}
			const result = selectProjectItemsTotal(state)
			expect(result).toEqual(1)
		})
	})

	describe('selectProjectStatsTasks', () => {
		it('returns default value', () => {
			const result = selectProjectStatsTasks()
			expect(result).toBeNull()
		})

		it('returns state value', () => {
			const state = {
				project: {
					tasks: {
						data: ['foo'],
					},
				},
			}
			const result = selectProjectStatsTasks(state)
			expect(result).toEqual(['foo'])
		})
	})

	describe('selectProjectStatsTasksIndex', () => {
		it('returns default value', () => {
			const result = selectProjectStatsTasksIndex()
			expect(result).toEqual(0)
		})

		it('returns state value', () => {
			const state = {
				project: {
					tasks: {
						index: 1,
					},
				},
			}
			const result = selectProjectStatsTasksIndex(state)
			expect(result).toEqual(1)
		})
	})

	describe('selectProjectStatsTasksLimit', () => {
		it('returns default value', () => {
			const result = selectProjectStatsTasksLimit()
			expect(result).toEqual(PROJECT_STATS_TASKS_SIZE)
		})

		it('returns state value', () => {
			const state = {
				project: {
					tasks: {
						limit: PROJECT_STATS_TASKS_SIZE,
					},
				},
			}
			const result = selectProjectStatsTasksLimit(state)
			expect(result).toEqual(PROJECT_STATS_TASKS_SIZE)
		})
	})

	describe('selectProjectStatsTasksPageCount', () => {
		it('returns default value', () => {
			const result = selectProjectStatsTasksPageCount()
			expect(result).toEqual(0)
		})

		it('returns state value', () => {
			const state = {
				project: {
					tasks: {
						pageCount: 1,
					},
				},
			}
			const result = selectProjectStatsTasksPageCount(state)
			expect(result).toEqual(1)
		})
	})

	describe('selectProjectStatsTasksLimit', () => {
		it('returns default value', () => {
			const result = selectProjectStatsTasksTotal()
			expect(result).toEqual(0)
		})

		it('returns state value', () => {
			const state = {
				project: {
					tasks: {
						total: 1,
					},
				},
			}
			const result = selectProjectStatsTasksTotal(state)
			expect(result).toEqual(1)
		})
	})

	describe('selectIsFilterModalOpen', () => {
		it('returns default value', () => {
			const result = selectIsFilterModalOpen()
			expect(result).toBeFalsy()
		})

		it('returns state value', () => {
			const state = {
				project: {
					isFilterModalOpen: true,
				},
			}
			const result = selectIsFilterModalOpen(state)
			expect(result).toBeTruthy()
		})
	})

	describe('selectIsGuideModalOpen', () => {
		it('returns default value', () => {
			const result = selectIsGuideModalOpen()
			expect(result).toBeFalsy()
		})

		it('returns state value', () => {
			const state = {
				project: {
					isGuideModalOpen: true,
				},
			}
			const result = selectIsGuideModalOpen(state)
			expect(result).toBeTruthy()
		})
	})

	describe('selectProjectUsersByRole', () => {
		it('returns default value', () => {
			const result = selectProjectUsersByRole({})
			expect(result).toEqual({ [ADMIN]: null, [DATASCIENTIST]: null, [USER]: null })
		})

		it('returns state value', () => {
			const state = {
				project: {
					data: {
						users: ['foo'],
						admins: ['foo'],
						dataScientists: ['foo'],
					},
				},
			}
			const result = selectProjectUsersByRole(state)
			expect(result).toEqual({ [ADMIN]: ['foo'], [DATASCIENTIST]: ['foo'], [USER]: ['foo'] })
		})
	})
})
