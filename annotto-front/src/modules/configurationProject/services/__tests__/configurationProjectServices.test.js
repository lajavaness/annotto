import format from 'dayjs'

import { ENTITIES_RELATIONS_GROUP } from 'shared/enums/taskTypes'

import {
	mapConfigProjectPostRequestService,
	mapConfigProjectResponseService,
	mapEntitiesRelationsGroupPutRequestService,
	mapEntitiesRelationsGroupResponseService,
	mapTasksToLabelingService,
	mergeConfigService,
} from 'modules/configurationProject/services/configurationProjectServices'

describe('ConfigurationProjectServices', () => {
	describe('mapConfigProjectResponseService', () => {
		it('Returns input if null', () => {
			const input = null
			expect(mapConfigProjectResponseService(input)).toBeNull()
		})

		it('Returns input if empty', () => {
			const input = {}
			const output = {}
			expect(mapConfigProjectResponseService(input)).toEqual(output)
		})

		it('Returns partial output if missing keys', () => {
			const input = { name: 'foo' }
			const output = { name: 'foo', guidelines: undefined }

			expect(mapConfigProjectResponseService(input)).toEqual(output)
		})

		const baseInput = {
			name: 'name',
			client: { name: 'foo' },
			type: 'text',
			guidelines: 'guidelines',
			deadline: '2020-10-22T16:29:00.716Z',
			defaultTags: ['foo', 'bar'],
			admins: ['admins@lajavaness.com'],
			dataScientists: ['foo'],
			users: ['user@lajavaness.com'],
		}
		const baseOutput = {
			name: 'name',
			type: 'text',
			client: 'foo',
			deadline: format(baseInput.deadline),
			defaultTags: ['foo', 'bar'],
			admins: ['admins@lajavaness.com'],
			dataScientists: ['foo'],
			users: ['user@lajavaness.com'],
			guidelines: 'guidelines',
		}

		it('Returns mapped data with existing labeling data', () => {
			const labeling = [
				{
					name: 'test',
					category: 'classification',
					values: [
						{
							label: 'aa',
							value: 'aa',
						},
						{
							label: 'ab',
							value: 'ab',
						},
					],
				},
			]
			const input = {
				...baseInput,
				labeling,
			}

			const output = {
				...baseOutput,
				labeling,
			}
			expect(mapConfigProjectResponseService(input)).toEqual(output)
		})

		it('Takes tasks input and returns mapped data with labeling', () => {
			const input = {
				...baseInput,
				tasks: [
					{
						label: 'a',
						value: 'a',
						category: 'task1',
						type: 'classifications',
						min: 1,
						max: 5,
					},
					{
						label: 'b',
						value: 'b',
						category: 'task1',
						type: 'classifications',
						min: 1,
						max: 5,
					},
					{
						label: 'c',
						value: 'c',
						category: 'task2',
						type: 'NER',
					},
				],
			}
			const output = {
				...baseOutput,
				labeling: [
					{
						name: 'task1',
						type: 'classifications',
						conditions: [],
						min: 1,
						max: 5,
						values: [
							{ label: 'a', value: 'a' },
							{ label: 'b', value: 'b' },
						],
					},
					{
						name: 'task2',
						type: 'NER',
						conditions: [],
						values: [{ label: 'c', value: 'c' }],
					},
				],
			}
			expect(mapConfigProjectResponseService(input)).toEqual(output)
		})
	})

	describe('mapConfigProjectPostRequestService', () => {
		it('Returns input if null', () => {
			const input = null
			expect(mapConfigProjectPostRequestService(input)).toBeNull()
		})

		it('Returns input if empty', () => {
			const input = {}
			expect(mapConfigProjectPostRequestService(input)).toEqual(input)
		})

		const inputWithLabeling = {
			name: 'foo',
			client: 'LJN',
			type: 'text',
			deadline: '2022-05-28T10:22:08.847Z',
			description: 'bar',
			defaultTags: ['To delete', 'To check', 'To discuss'],
			labeling: [
				{
					name: 'ferf',
					type: 'classifications',
					values: [
						{
							label: 'aa',
							value: 'aa',
						},
						{
							label: 'ab',
							value: 'ab',
						},
					],
				},
				{
					name: 'fzfezfezf',
					type: 'classifications',
					values: [
						{
							label: 'ba',
							value: 'ba',
						},
					],
				},
			],
		}
		const outputWithTasks = {
			name: 'foo',
			client: 'LJN',
			type: 'text',
			deadline: '2022-05-28T10:22:08.847Z',
			description: 'bar',
			defaultTags: ['To delete', 'To check', 'To discuss'],
			tasks: [
				{
					label: 'aa',
					value: 'aa',
					category: 'ferf',
					type: 'classifications',
				},
				{
					label: 'ab',
					value: 'ab',
					category: 'ferf',
					type: 'classifications',
				},
				{
					label: 'ba',
					value: 'ba',
					category: 'fzfezfezf',
					type: 'classifications',
				},
			],
		}
		it('Returns mapped data with tasks', () => {
			expect(mapConfigProjectPostRequestService(inputWithLabeling)).toEqual(outputWithTasks)
		})

		it('Returns mapped data without tasks', () => {
			delete inputWithLabeling.labeling
			delete outputWithTasks.tasks
			expect(mapConfigProjectPostRequestService(inputWithLabeling)).toEqual(outputWithTasks)
		})
	})

	describe('mapEntitiesRelationsGroupResponseService', () => {
		it('Returns input if null', () => {
			const input = null
			expect(mapEntitiesRelationsGroupResponseService(input)).toBeNull()
		})

		it('Returns input if empty', () => {
			const input = {}
			expect(mapEntitiesRelationsGroupResponseService(input)).toEqual(input)
		})

		it('Returns mapped data', () => {
			const input = [
				{
					_id: 'foo',
					name: 'foo',
					values: [
						{
							_id: 'foo',
							label: 'bar',
							value: 'bar',
						},
					],
				},
			]

			const output = [
				{
					name: 'foo',
					_id: 'foo',
					type: ENTITIES_RELATIONS_GROUP,
					values: [
						{
							label: 'bar',
							value: 'bar',
							type: ENTITIES_RELATIONS_GROUP,
						},
					],
				},
			]

			expect(mapEntitiesRelationsGroupResponseService(input)).toEqual(output)
		})
	})

	describe('mergeConfigService', () => {
		it('Returns null if they are no oldConfig and no newConfig', () => {
			expect(mergeConfigService()).toBeNull()
		})

		it('Returns oldConfig if empty oldConfig', () => {
			const newConfig = null
			expect(mergeConfigService(newConfig)).toEqual(newConfig)
		})

		it('Returns newConfig if no oldConfig', () => {
			const newConfig = { foo: 'bar' }
			expect(mergeConfigService(newConfig)).toEqual(newConfig)
		})

		it('Returns merged config', () => {
			const oldConfig = { foo: 'bar', zog: 'zog' }
			const newConfig = { foo: 'foo', bar: 'bar' }
			expect(mergeConfigService(newConfig, oldConfig)).toEqual({ foo: 'foo', bar: 'bar', zog: 'zog' })
		})
	})

	describe('mapTasksToLabelingService', () => {
		it('Returns input if null', () => {
			const input = null
			expect(mapTasksToLabelingService(input)).toBeNull()
		})

		it('Returns input if is an empty object', () => {
			const input = {}
			expect(mapTasksToLabelingService(input)).toEqual(input)
		})

		it('Returns input if is an empty array', () => {
			const input = []
			expect(mapTasksToLabelingService(input)).toEqual(input)
		})

		const createInputTask = ({ value, category, conditions, label, _id, type }) => ({
			value,
			category,
			conditions,
			label,
			type,
			_id,
		})

		const createOutputLabel = ({ name, conditions, type }, values) => ({
			name,
			conditions,
			type,
			values,
		})

		it('Returns mapped data - one classification task', () => {
			const taskValue = {
				_id: '604f7972bcb0f9001f4db634',
				label: 'aa label',
				value: 'aa',
			}
			const taskMeta = {
				...taskValue,
				category: 'task1',
				conditions: ['cond'],
				type: 'classifications',
			}

			const taskOutput = {
				name: taskMeta.category,
				conditions: taskMeta.conditions,
				type: taskMeta.type,
			}

			const input = [createInputTask(taskMeta)]
			const expected = [createOutputLabel(taskOutput, [taskValue])]
			expect(mapTasksToLabelingService(input)).toEqual(expected)
		})

		it('Returns mapped data - two classification tasks', () => {
			const taskValue = {
				_id: '604f7972bcb0f9001f4db634',
				label: 'aa label',
				value: 'aa',
			}
			const taskMeta = {
				...taskValue,
				category: 'task1',
				conditions: ['cond'],
				type: 'classifications',
			}

			const taskOutput = {
				name: taskMeta.category,
				conditions: taskMeta.conditions,
				type: taskMeta.type,
			}

			const input = [createInputTask(taskMeta), createInputTask(taskMeta)]
			const expected = [createOutputLabel(taskOutput, [taskValue, taskValue])]
			expect(mapTasksToLabelingService(input)).toEqual(expected)
		})

		it('Returns mapped data where tasks dont have conditions', () => {
			const taskValue = {
				_id: '604f7972bcb0f9001f4db634',
				label: 'aa label',
				value: 'aa',
			}
			const taskMeta = {
				...taskValue,
				category: 'task1',
				type: 'classifications',
			}

			const taskOutput = {
				name: taskMeta.category,
				conditions: [],
				type: taskMeta.type,
			}

			const input = [createInputTask(taskMeta), createInputTask(taskMeta)]
			const expected = [createOutputLabel(taskOutput, [taskValue, taskValue])]
			expect(mapTasksToLabelingService(input)).toEqual(expected)
		})

		it('Returns mapped data where tasks have same category but different conditions', () => {
			const taskValue = {
				_id: '604f7972bcb0f9001f4db634',
				label: 'aa label',
				value: 'aa',
			}
			const task1Meta = {
				...taskValue,
				category: 'task1',
				conditions: ['cond1'],
				type: 'classifications',
			}
			const task2Meta = {
				...taskValue,
				category: 'task1',
				conditions: ['cond2'],
				type: 'classifications',
			}

			const task1Output = {
				name: task1Meta.category,
				conditions: task1Meta.conditions,
				type: task1Meta.type,
			}
			const task2Output = {
				name: task2Meta.category,
				conditions: task2Meta.conditions,
				type: task2Meta.type,
			}

			const input = [createInputTask(task1Meta), createInputTask(task2Meta)]
			const expected = [createOutputLabel(task1Output, [taskValue]), createOutputLabel(task2Output, [taskValue])]
			expect(mapTasksToLabelingService(input)).toEqual(expected)
		})
	})

	describe('mapEntitiesRelationsGroupPutRequestService', () => {
		it('Returns input if null', () => {
			const input = null
			expect(mapEntitiesRelationsGroupPutRequestService(input)).toBeNull()
		})

		it('Returns input if empty', () => {
			const input = {}
			expect(mapEntitiesRelationsGroupPutRequestService(input)).toEqual(input)
		})

		it('Returns mapped data', () => {
			const input = [
				{
					name: 'foo',
					_id: 'foo',
					type: ENTITIES_RELATIONS_GROUP,
					values: [
						{
							label: 'bar',
							value: 'bar',
							type: ENTITIES_RELATIONS_GROUP,
							category: 'foo',
						},
					],
				},
			]

			const output = [
				{
					name: 'foo',
					_id: 'foo',
					values: [
						{
							label: 'bar',
							value: 'bar',
						},
					],
				},
			]

			expect(mapEntitiesRelationsGroupPutRequestService(input)).toEqual(output)
		})
	})
})
