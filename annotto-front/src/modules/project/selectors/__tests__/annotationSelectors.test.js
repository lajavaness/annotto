import {
	selectAnnotationItems,
	selectCurrentItem,
	selectCurrentItemAnnotations,
	selectCurrentItemEntitiesRelations,
	selectCurrentItemId,
	selectCurrentItemLogs,
	selectCurrentItemPredictions,
	selectIsAnnotationPosted,
	selectIsReady,
} from 'modules/project/selectors/annotationSelectors'

describe('annotationSelectors', () => {
	describe('selectIsReady', () => {
		it('returns default value', () => {
			const result = selectIsReady()
			expect(result).toBeFalsy()
		})

		it('returns state value', () => {
			const state = {
				project: {
					annotation: {
						isReady: true,
					},
				},
			}
			const result = selectIsReady(state)
			expect(result).toBeTruthy()
		})
	})

	describe('selectIsAnnotationPosted', () => {
		it('returns default value', () => {
			const result = selectIsAnnotationPosted()
			expect(result).toBeFalsy()
		})

		it('returns state value', () => {
			const state = {
				project: {
					annotation: {
						isAnnotationPosted: true,
					},
				},
			}
			const result = selectIsAnnotationPosted(state)
			expect(result).toBeTruthy()
		})
	})

	describe('selectAnnotationItems', () => {
		it('returns default value', () => {
			const result = selectAnnotationItems()
			expect(result).toBeNull()
		})

		it('returns state value', () => {
			const state = {
				project: {
					annotation: {
						items: ['foo'],
					},
				},
			}
			const result = selectAnnotationItems(state)
			expect(result).toEqual(['foo'])
		})
	})

	describe('selectCurrentItemId', () => {
		it('returns default value', () => {
			const result = selectCurrentItemId({})
			expect(result).toBeNull()
		})

		it('returns current item', () => {
			const currentItemId = 'foo'

			const state = {
				project: {
					annotation: {
						currentItemId,
					},
				},
			}

			const result = selectCurrentItemId(state)
			expect(result).toEqual(currentItemId)
		})
	})

	describe('selectCurrentItem', () => {
		it('returns default value', () => {
			const result = selectCurrentItem({})
			expect(result).toBeNull()
		})

		it('returns current item', () => {
			const currentItemId = 'foo'
			const currentItem = { _id: currentItemId, name: 'foo' }

			const state = {
				project: {
					annotation: {
						currentItemId,
						items: [{ _id: 'bar', name: 'bar' }, currentItem],
					},
				},
			}

			const result = selectCurrentItem(state)
			expect(result).toEqual(currentItem)
		})
	})

	describe('selectCurrentItemLogs', () => {
		it('returns default value', () => {
			const result = selectCurrentItemLogs()
			expect(result).toBeNull()
		})

		it('returns state value', () => {
			const currentItemId = 'foo'
			const logs = { foo: 'foo' }
			const currentItem = { _id: currentItemId, annotations: ['foo'], logs }

			const state = {
				project: {
					annotation: {
						currentItemId,
						items: [currentItem, { _id: 'bar', name: 'bar' }],
					},
				},
			}

			const result = selectCurrentItemLogs(state)
			expect(result).toEqual(logs)
		})
	})

	describe('selectCurrentItemAnnotations', () => {
		it('returns default value', () => {
			const result = selectCurrentItemAnnotations()
			expect(result).toBeNull()
		})

		it('returns current item', () => {
			const currentItemId = 'foo'
			const currentItem = { _id: currentItemId, annotations: ['foo'] }

			const state = {
				project: {
					annotation: {
						currentItemId,
						items: [currentItem, { _id: 'bar', name: 'bar' }],
					},
				},
			}

			const result = selectCurrentItemAnnotations(state)
			expect(result).toEqual(currentItem.annotations)
		})
	})

	describe('selectCurrentItemEntitiesRelations', () => {
		it('returns default value', () => {
			const result = selectCurrentItemEntitiesRelations()
			expect(result).toBeNull()
		})

		it('returns current item', () => {
			const currentItemId = 'foo'
			const currentItem = { _id: currentItemId, entitiesRelations: ['foo'] }

			const state = {
				project: {
					annotation: {
						currentItemId,
						items: [currentItem, { _id: 'bar', name: 'bar' }],
					},
				},
			}

			const result = selectCurrentItemEntitiesRelations(state)
			expect(result).toEqual(currentItem.entitiesRelations)
		})
	})

	describe('selectCurrentItemPredictions', () => {
		it('returns default value', () => {
			const result = selectCurrentItemPredictions()
			expect(result).toBeNull()
		})

		it('returns current item', () => {
			const predictions = ['foo']
			const currentItemId = 'foo'
			const currentItem = { _id: currentItemId, predictions: { keys: predictions } }

			const state = {
				project: {
					annotation: {
						currentItemId,
						items: [currentItem, { _id: 'bar', name: 'bar' }],
					},
				},
			}

			const result = selectCurrentItemPredictions(state)
			expect(result).toEqual(predictions)
		})
	})
})
