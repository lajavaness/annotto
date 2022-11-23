import { findDependantTasks } from 'modules/project/utils/labelListUtils'

describe('projectUtils', () => {
	const tasks = [
		{
			value: 'aa',
			label: 'aa',
			conditions: [],
			category: 'taskA',
			type: 'classifications',
		},
		{
			value: 'ab',
			label: 'ab',
			conditions: [],
			category: 'taskA',
			type: 'classifications',
		},
		{
			value: 'ba',
			label: 'ba',
			conditions: ['aa'],
			category: 'taskB',
			type: 'classifications',
		},
		{
			value: 'ca',
			label: 'ca',
			conditions: ['ba'],
			category: 'taskC',
			type: 'classifications',
		},
	]

	describe('find dependant tasks', () => {
		it('Return empty array if no dependant task is found', () => {
			const value = null
			const output = []
			expect(findDependantTasks(value, tasks)).toEqual(output)
		})

		it('Find one dependant tasks', () => {
			const value = 'ba'
			const output = ['ca']
			expect(findDependantTasks(value, tasks)).toEqual(output)
		})

		it('Find nested dependant tasks', () => {
			const value = 'aa'
			const output = ['ba', 'ca']
			expect(findDependantTasks(value, tasks)).toEqual(output)
		})
	})
})
