import reduce, { initialState } from 'modules/project/reducers/projectReducer'

import {
	CLOSE_FILTER_MODAL,
	CLOSE_GUIDE_MODAL,
	DELETE_PROJECT,
	DELETE_PROJECT_FAILURE,
	DELETE_PROJECT_SUCCESS,
	FETCH_PROJECT_ITEMS_SUCCESS,
	FETCH_PROJECT_ITEMS_TAGS_SUCCESS,
	FETCH_PROJECT_LOGS_SUCCESS,
	FETCH_PROJECT_STATS_TASKS_SUCCESS,
	NAVIGATE_TO_ITEM_SUCCESS,
	OPEN_FILTER_MODAL,
	OPEN_GUIDE_MODAL,
	POST_PROJECT_COMMENT_SUCCESS,
	PUT_PROJECT_SUCCESS,
	STARTUP_SUCCESS,
} from 'modules/project/actions/projectActions'
import {
	FETCH_PROJECT_FILTER_OPERATORS_SUCCESS,
	FETCH_PROJECT_FILTER_SUCCESS,
	POST_PROJECT_FILTER,
	POST_PROJECT_FILTER_SUCCESS,
} from 'modules/project/actions/filterActions'
import { FETCH_PROJECT_SUCCESS } from 'modules/root/actions/rootActions'
import {
	MOUNT_ANNOTATION_PAGE_SUCCESS,
	NAVIGATE_TO_NEXT_ITEM_SUCCESS,
	RESET_ANNOTATION_ITEMS_SUCCESS,
	SAVE_ANNOTATIONS_ITEM_SUCCESS,
	SET_CURRENT_ITEM_SUCCESS,
	UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS,
} from 'modules/project/actions/annotationActions'

describe('projectReducer', () => {
	describe('Uncaught action', () => {
		it('returns state', () => {
			const state = reduce(initialState, { type: 'PROJECT' })
			expect(state).toEqual(initialState)
		})
	})

	describe('STARTUP_SUCCESS', () => {
		it('updates state', () => {
			const newState = {
				...initialState,
				isReady: true,
			}
			const state = reduce(initialState, {
				type: STARTUP_SUCCESS,
			})
			expect(state).toEqual(newState)
		})
	})

	describe('DELETE_PROJECT', () => {
		it('updates state', () => {
			const newState = {
				...initialState,
				isDeletePosted: true,
			}
			const state = reduce(initialState, {
				type: DELETE_PROJECT,
			})
			expect(state).toEqual(newState)
		})
	})

	describe('DELETE_PROJECT_FAILURE', () => {
		it('updates state', () => {
			const newState = {
				...initialState,
				isDeletePosted: false,
			}
			const state = reduce(initialState, {
				type: DELETE_PROJECT_FAILURE,
			})
			expect(state).toEqual(newState)
		})
	})

	describe('DELETE_PROJECT_SUCCESS', () => {
		it('updates state', () => {
			const newState = {
				...initialState,
				isDeletePosted: false,
			}
			const state = reduce(initialState, {
				type: DELETE_PROJECT_SUCCESS,
			})
			expect(state).toEqual(newState)
		})
	})

	describe('FETCH_PROJECT_SUCCESS', () => {
		it('updates state', () => {
			const newState = {
				...initialState,
				data: { foo: 'Foo' },
			}
			const state = reduce(initialState, {
				type: FETCH_PROJECT_SUCCESS,
				payload: {
					project: { foo: 'Foo' },
				},
			})
			expect(state).toEqual(newState)
		})
	})

	describe('FETCH_PROJECT_LOGS_SUCCESS', () => {
		it('updates state', () => {
			const newState = {
				...initialState,
				data: { logs: ['Foo'] },
			}
			const state = reduce(initialState, {
				type: FETCH_PROJECT_LOGS_SUCCESS,
				payload: {
					logs: ['Foo'],
				},
			})
			expect(state).toEqual(newState)
		})
	})

	describe('POST_PROJECT_COMMENT_SUCCESS', () => {
		const comment = 'foo'
		const data = {
			logs: {
				data: ['foo'],
			},
		}

		it('updates state', () => {
			const newState = {
				...initialState,
				data: {
					logs: {
						data: [...data.logs.data, comment],
					},
				},
			}

			const state = reduce(
				{ ...initialState, data },
				{
					type: POST_PROJECT_COMMENT_SUCCESS,
					payload: {
						comment,
					},
				}
			)
			expect(state).toEqual(newState)
		})
	})

	describe('PUT_PROJECT_SUCCESS', () => {
		it('updates state', () => {
			const newState = {
				...initialState,
				data: { foo: 'foo' },
			}
			const state = reduce(initialState, {
				type: PUT_PROJECT_SUCCESS,
				payload: {
					foo: 'foo',
				},
			})
			expect(state).toEqual(newState)
		})
	})

	describe('FETCH_PROJECT_ITEMS_TAGS_SUCCESS', () => {
		it('updates state', () => {
			const newState = {
				...initialState,
				data: { tags: ['Foo'] },
			}
			const state = reduce(initialState, {
				type: FETCH_PROJECT_ITEMS_TAGS_SUCCESS,
				payload: {
					tags: ['Foo'],
				},
			})
			expect(state).toEqual(newState)
		})
	})

	describe('FETCH_PROJECT_ITEMS_SUCCESS', () => {
		it('updates state', () => {
			const newState = {
				...initialState,
				items: { data: ['FOO'] },
			}
			const state = reduce(initialState, {
				type: FETCH_PROJECT_ITEMS_SUCCESS,
				payload: {
					items: { data: ['FOO'] },
				},
			})
			expect(state).toEqual(newState)
		})
	})

	describe('FETCH_PROJECT_STATS_TASKS_SUCCESS', () => {
		it('updates state', () => {
			const newState = {
				...initialState,
				tasks: { data: ['FOO'] },
			}
			const state = reduce(initialState, {
				type: FETCH_PROJECT_STATS_TASKS_SUCCESS,
				payload: {
					tasks: { data: ['FOO'] },
				},
			})
			expect(state).toEqual(newState)
		})
	})

	describe('MOUNT_ANNOTATION_PAGE_SUCCESS', () => {
		it('updates state', () => {
			const isReady = true
			const newState = {
				...initialState,
				annotation: {
					...initialState.annotation,
					isReady,
				},
			}
			const state = reduce(initialState, {
				type: MOUNT_ANNOTATION_PAGE_SUCCESS,
				payload: {
					isReady,
				},
			})
			expect(state).toEqual(newState)
		})
	})

	describe('SAVE_ANNOTATIONS_ITEM_SUCCESS', () => {
		it('updates state', () => {
			const isAnnotationPosted = true
			const newState = {
				...initialState,
				annotation: {
					...initialState.annotation,
					isAnnotationPosted,
				},
			}
			const state = reduce(initialState, {
				type: SAVE_ANNOTATIONS_ITEM_SUCCESS,
			})
			expect(state).toEqual(newState)
		})
	})

	describe('NAVIGATE_TO_NEXT_ITEM_SUCCESS', () => {
		it('updates state', () => {
			const isAnnotationPosted = false
			const isReady = true

			const newState = {
				...initialState,
				annotation: {
					...initialState.annotation,
					isAnnotationPosted,
					isReady,
				},
			}
			const state = reduce(initialState, {
				type: NAVIGATE_TO_NEXT_ITEM_SUCCESS,
			})
			expect(state).toEqual(newState)
		})
	})

	describe('NAVIGATE_TO_ITEM_SUCCESS', () => {
		it('updates state', () => {
			const newState = {
				...initialState,
				annotation: {
					...initialState.annotation,
					isReady: false,
				},
			}
			const state = reduce(initialState, {
				type: NAVIGATE_TO_ITEM_SUCCESS,
			})
			expect(state).toEqual(newState)
		})
	})

	describe('UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS', () => {
		it('updates state', () => {
			const newState = {
				...initialState,
				annotation: {
					...initialState.annotation,
					items: ['FOO'],
				},
			}
			const state = reduce(initialState, {
				type: UPDATE_CURRENT_ANNOTATION_ITEM_SUCCESS,
				payload: {
					items: ['FOO'],
				},
			})
			expect(state).toEqual(newState)
		})
	})

	describe('RESET_ANNOTATION_ITEMS_SUCCESS', () => {
		it('updates state', () => {
			const newState = initialState
			const state = reduce(initialState, {
				type: RESET_ANNOTATION_ITEMS_SUCCESS,
				payload: {
					items: initialState.annotation.items,
				},
			})
			expect(state).toEqual(newState)
		})
	})

	describe('SET_CURRENT_ITEM_SUCCESS', () => {
		it('updates state', () => {
			const newState = {
				...initialState,
				annotation: {
					...initialState.annotation,
					currentItemId: 123,
				},
			}
			const state = reduce(initialState, {
				type: SET_CURRENT_ITEM_SUCCESS,
				payload: {
					itemId: 123,
				},
			})
			expect(state).toEqual(newState)
		})
	})

	describe('POST_PROJECT_FILTER', () => {
		it('updates state', () => {
			const newState = {
				...initialState,
				isSuccessPosted: false,
			}
			const state = reduce(initialState, {
				type: POST_PROJECT_FILTER,
			})
			expect(state).toEqual(newState)
		})
	})

	describe('POST_PROJECT_FILTER_SUCCESS', () => {
		it('updates state', () => {
			const newState = {
				...initialState,
				isSuccessPosted: true,
				data: { filter: ['Foo'] },
			}
			const state = reduce(initialState, {
				type: POST_PROJECT_FILTER_SUCCESS,
				payload: {
					filter: ['Foo'],
				},
			})
			expect(state).toEqual(newState)
		})
	})

	describe('FETCH_PROJECT_FILTER_SUCCESS', () => {
		it('updates state', () => {
			const newState = {
				...initialState,
				data: { filter: ['Foo'] },
			}
			const state = reduce(initialState, {
				type: FETCH_PROJECT_FILTER_SUCCESS,
				payload: {
					filter: ['Foo'],
				},
			})
			expect(state).toEqual(newState)
		})
	})

	describe('FETCH_PROJECT_FILTER_OPERATORS_SUCCESS', () => {
		it('updates state', () => {
			const newState = {
				...initialState,
				data: { operators: 'foo', fields: 'bar' },
			}
			const state = reduce(initialState, {
				type: FETCH_PROJECT_FILTER_OPERATORS_SUCCESS,
				payload: {
					operators: { operators: 'foo', fields: 'bar' },
				},
			})
			expect(state).toEqual(newState)
		})
	})

	describe('OPEN_FILTER_MODAL', () => {
		it('updates state', () => {
			const newState = {
				...initialState,
				isFilterModalOpen: true,
			}
			const state = reduce(initialState, {
				type: OPEN_FILTER_MODAL,
			})
			expect(state).toEqual(newState)
		})
	})

	describe('CLOSE_FILTER_MODAL', () => {
		it('updates state', () => {
			const newState = {
				...initialState,
				isFilterModalOpen: false,
			}
			const state = reduce(
				{ ...initialState, isFilterModalOpen: true },
				{
					type: CLOSE_FILTER_MODAL,
				}
			)
			expect(state).toEqual(newState)
		})
	})

	describe('OPEN_GUIDE_MODAL', () => {
		it('updates state', () => {
			const newState = {
				...initialState,
				isGuideModalOpen: true,
			}
			const state = reduce(initialState, {
				type: OPEN_GUIDE_MODAL,
			})
			expect(state).toEqual(newState)
		})
	})

	describe('CLOSE_GUIDE_MODAL', () => {
		it('updates state', () => {
			const newState = {
				...initialState,
				isFilterModalOpen: false,
			}
			const state = reduce(
				{ ...initialState, isGuideModalOpen: true },
				{
					type: CLOSE_GUIDE_MODAL,
				}
			)
			expect(state).toEqual(newState)
		})
	})
})
