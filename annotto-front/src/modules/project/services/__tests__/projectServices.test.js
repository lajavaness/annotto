import moment from 'moment'

import {
	filterDuplicateLogEntries,
	mapAndSortLogsService,
	mapFilterRequestService,
	mapFilterResponseService,
	mapPostCommentResponseService,
	resolveLogValueService,
} from 'modules/project/services/projectServices'

import {
	ANNOTATION_ADD,
	ANNOTATION_REMOVE,
	COMMENT_ADD,
	COMMENT_REMOVE,
	RELATION_ADD,
	RELATION_REMOVE,
	TAGS_ADD,
	TAGS_REMOVE,
} from 'shared/enums/logsTypes'

describe('projectServices', () => {
	describe('mapFilterResponseService', () => {
		it('Returns input if null', () => {
			const input = null
			const output = null
			expect(mapFilterResponseService(input)).toEqual(output)
		})

		it('Returns input if empty', () => {
			const input = {}
			const output = {}
			expect(mapFilterResponseService(input)).toEqual(output)
		})

		it('Returns mapped data', () => {
			const responseData = [
				{ operator: 'equal', field: 'annotated', value: true },
				{
					operator: 'range',
					field: 'annotatedAt',
					value: { from: '2019-09-30T22:00:00.000Z', to: '2021-09-30T22:00:00.000Z' },
				},
				{ operator: 'containsAll', field: 'annotatedBy', value: ['admin@lajavaness.com'] },
				{ operator: 'containsAll', field: 'tags', value: ['confus'] },
				{ operator: 'similarTo', field: 'uuid', value: 'Bonjour' },
				{ operator: 'containsAny', field: 'annotatedBy', value: ['admin@lajavaness.com'] },
				{ operator: 'containsAny', field: 'annotationValues', value: ['RA', 'RB'] },
				{ operator: 'containsAll', field: 'annotationValues', value: ['RC', 'RD'] },
				{ operator: 'size', field: 'annotationValues', value: 4 },
				{ operator: 'containsAny', field: 'tags', value: ['confus'] },
				{ operator: 'size', field: 'tags', value: 4 },
				{ operator: 'containsAny', field: 'predictionValues', value: ['RA'] },
				{ operator: 'containsAll', field: 'predictionValues', value: ['RA'] },
				{ operator: 'size', field: 'predictionValues', value: 4 },
				{ operator: 'greaterThanAny', field: 'predictionScores', value: ['RA', 'RB'], threshold: 0.9 },
				{ operator: 'greaterThanAll', field: 'predictionScores', value: ['RA', 'RB'], threshold: 0.9 },
			]

			const requestData = {
				annotated: true,
				annotatedAt: [moment('2019-09-30T22:00:00.000Z'), moment('2021-09-30T22:00:00.000Z')],
				annotatedBy: ['admin@lajavaness.com'],
				tags: ['confus'],
				similarTo: 'Bonjour',
				filters: [
					{ operator: 'containsAny', field: 'annotatedBy', value: ['admin@lajavaness.com'] },
					{ operator: 'containsAny', field: 'annotationValues', value: ['RA', 'RB'] },
					{ operator: 'containsAll', field: 'annotationValues', value: ['RC', 'RD'] },
					{ operator: 'size', field: 'annotationValues', value: 4 },
					{ operator: 'containsAny', field: 'tags', value: ['confus'] },
					{ operator: 'size', field: 'tags', value: 4 },
					{ operator: 'containsAny', field: 'predictionValues', value: ['RA'] },
					{ operator: 'containsAll', field: 'predictionValues', value: ['RA'] },
					{ operator: 'size', field: 'predictionValues', value: 4 },
					{ operator: 'greaterThanAny', field: 'predictionScores', value: ['RA', 'RB'], threshold: 0.9 },
					{ operator: 'greaterThanAll', field: 'predictionScores', value: ['RA', 'RB'], threshold: 0.9 },
				],
			}

			const input = {
				_id: 'foo',
				payload: responseData,
			}
			const output = {
				form: requestData,
				total: 16,
				id: 'foo',
			}
			expect(mapFilterResponseService(input)).toEqual(output)
		})
	})

	describe('mapFilterRequestService', () => {
		it('Returns empty array if null', () => {
			const input = null
			const output = []
			expect(mapFilterRequestService(input)).toEqual(output)
		})

		it('Returns empty array if empty', () => {
			const input = {}
			const output = []
			expect(mapFilterRequestService(input)).toEqual(output)
		})

		it('Returns mapped data', () => {
			const input = [
				{ operator: 'equal', field: 'annotated', value: true },
				{
					operator: 'range',
					field: 'annotatedAt',
					value: {
						from: '2019-09-30',
						to: '2021-09-30',
					},
				},
				{ foo: 'foo' },
			]

			const output = [
				{ operator: 'equal', field: 'annotated', value: true },
				{
					operator: 'range',
					field: 'annotatedAt',
					value: {
						from: moment('2019-09-30').toISOString(),
						to: moment('2021-09-30').toISOString(),
					},
				},
				{ foo: 'foo' },
			]

			expect(mapFilterRequestService(input)).toEqual(output)
		})
	})

	describe('mapAndSortLogsService', () => {
		it('Returns logs if null', () => {
			const logs = null
			expect(mapAndSortLogsService(logs)).toBeNull()
		})

		it('Returns logs if empty', () => {
			const logs = []
			const expected = []
			expect(mapAndSortLogsService(logs)).toEqual(expected)
		})

		it('Returns partial output if missing keys', () => {
			const logs = [{ item: 'foo' }]
			const expected = [{ item: 'foo' }]

			expect(mapAndSortLogsService(logs)).toEqual(expected)
		})

		it('Returns mapped and sorted data', () => {
			const logs = [
				{
					_id: '5f5255d5d3fa2b001bdbb35b',
					tags: [],
					type: 'comment-add',
					user: {
						_id: '5f396fc8f48309001b9fb978',
						email: 'admin@lajavaness.com',
						firstName: 'Tyler',
						lastName: 'Durden',
					},
					comment: '5f5255d5d3fa2b001bdbb35a',
					commentMessage: 'hello',
					item: '5f50b42f547afd001cbf3067',
					createdAt: '2020-09-04T14:57:25.287Z',
					__v: 0,
				},
				{
					_id: '5f5124cb547afd001cbf3095',
					tags: [],
					type: 'annotation-add',
					annotations: [{ task: { label: 'foo', type: 'foo' } }],
					user: {
						_id: '5f396fc8f48309001b9fb978',
						email: 'admin@lajavaness.com',
						firstName: 'Tyler',
						lastName: 'Durden',
					},
					item: '5f50b42f547afd001cbf3066',
					createdAt: '2020-09-03T17:15:55.403Z',
					__v: 0,
				},
				{
					_id: '5f5124cb547afd001cbf3095',
					tags: [],
					type: 'annotation-add',
					annotations: [{ task: { label: 'foo', type: 'true' } }],
					user: {
						_id: '5f396fc8f48309001b9fb978',
						email: 'admin@lajavaness.com',
						firstName: 'Tyler',
						lastName: 'Durden',
					},
					item: '5f50b42f547afd001cbf3066',
					createdAt: '2020-10-03T17:15:55.403Z',
					__v: 0,
				},
			]

			const expected = [
				{
					_id: '5f5124cb547afd001cbf3095',
					createdAt: '2020-10-03T17:15:55.403Z',
					item: '5f50b42f547afd001cbf3066',
					type: 'annotation-add',
					user: 'Tyler D.',
					value: ['foo'],
				},
				{
					_id: '5f5255d5d3fa2b001bdbb35b',
					comment: '5f5255d5d3fa2b001bdbb35a',
					createdAt: '2020-09-04T14:57:25.287Z',
					item: '5f50b42f547afd001cbf3067',
					type: 'comment-add',
					user: 'Tyler D.',
					value: 'hello',
				},
				{
					_id: '5f5124cb547afd001cbf3095',
					createdAt: '2020-09-03T17:15:55.403Z',
					item: '5f50b42f547afd001cbf3066',
					type: 'annotation-add',
					user: 'Tyler D.',
					value: ['foo'],
				},
			]

			expect(mapAndSortLogsService(logs)).toEqual(expected)
		})
	})

	describe('resolveLogValueService', () => {
		it('Returns null if log is null', () => {
			const log = null
			expect(resolveLogValueService(log)).toBeNull()
		})

		it('Returns null if log is empty', () => {
			const log = null
			expect(resolveLogValueService(log)).toBeNull()
		})

		it('Returns value if type of log is ANNOTATION_ADD', () => {
			const log = {
				type: ANNOTATION_ADD,
				annotations: [{ task: { label: 'foo' } }],
			}

			const expected = ['foo']

			expect(resolveLogValueService(log)).toEqual(expected)
		})

		it('Returns an empty array if type of log is ANNOTATION_ADD and task is empty', () => {
			const log = {
				type: ANNOTATION_ADD,
				annotations: [],
			}

			const expected = []

			expect(resolveLogValueService(log)).toEqual(expected)
		})

		it('Returns null if type of log is ANNOTATION_ADD and annotations does not exist', () => {
			const log = {
				type: ANNOTATION_ADD,
			}

			const expected = null

			expect(resolveLogValueService(log)).toEqual(expected)
		})

		it('Returns value if type of log is ANNOTATION_REMOVE', () => {
			const log = {
				type: ANNOTATION_REMOVE,
				annotations: [{ task: { label: 'foo' } }],
			}

			const expected = ['foo']

			expect(resolveLogValueService(log)).toEqual(expected)
		})

		it('Returns an empty array if type of log is ANNOTATION_REMOVE and task is empty', () => {
			const log = {
				type: ANNOTATION_REMOVE,
				annotations: [],
			}

			const expected = []

			expect(resolveLogValueService(log)).toEqual(expected)
		})

		it('Returns null if type of log is ANNOTATION_REMOVE and annotations does not exist', () => {
			const log = {
				type: ANNOTATION_REMOVE,
			}

			const expected = null

			expect(resolveLogValueService(log)).toEqual(expected)
		})

		it('Returns value if type of log is RELATION_ADD', () => {
			const log = {
				type: RELATION_ADD,
				relations: [{ entitiesRelation: { label: 'foo' } }],
			}

			const expected = ['foo']

			expect(resolveLogValueService(log)).toEqual(expected)
		})

		it('Returns an empty array if type of log is RELATION_ADD and relations is empty', () => {
			const log = {
				type: RELATION_ADD,
				relations: [],
			}

			const expected = []

			expect(resolveLogValueService(log)).toEqual(expected)
		})

		it('Returns null if type of log is RELATION_ADD and relations does not exist', () => {
			const log = {
				type: RELATION_ADD,
			}

			const expected = null

			expect(resolveLogValueService(log)).toEqual(expected)
		})

		it('Returns value if type of log is RELATION_REMOVE', () => {
			const log = {
				type: RELATION_REMOVE,
				relations: [{ entitiesRelation: { label: 'foo' } }],
			}

			const expected = ['foo']

			expect(resolveLogValueService(log)).toEqual(expected)
		})

		it('Returns an empty array if type of log is RELATION_REMOVE and relations is empty', () => {
			const log = {
				type: RELATION_REMOVE,
				relations: [],
			}

			const expected = []

			expect(resolveLogValueService(log)).toEqual(expected)
		})

		it('Returns null if type of log is RELATION_REMOVE and relations does not exist', () => {
			const log = {
				type: RELATION_REMOVE,
			}

			const expected = null

			expect(resolveLogValueService(log)).toEqual(expected)
		})

		it('Returns tag if type of log is TAGS_ADD', () => {
			const log = {
				type: TAGS_ADD,
				tags: ['foo'],
			}

			const expected = 'foo'

			expect(resolveLogValueService(log)).toEqual(expected)
		})

		it('Returns tag if type of log is TAGS_REMOVE', () => {
			const log = {
				type: TAGS_REMOVE,
				tags: ['foo'],
			}

			const expected = 'foo'

			expect(resolveLogValueService(log)).toEqual(expected)
		})

		it('Returns comment message if type of log is COMMENT_ADD', () => {
			const log = {
				type: COMMENT_ADD,
				commentMessage: 'foo',
			}

			const expected = 'foo'

			expect(resolveLogValueService(log)).toEqual(expected)
		})

		it('Returns comment message if type of log is COMMENT_REMOVE', () => {
			const log = {
				type: COMMENT_REMOVE,
				commentMessage: 'foo',
			}

			const expected = 'foo'

			expect(resolveLogValueService(log)).toEqual(expected)
		})

		it('Returns default value', () => {
			const log = {
				type: 'foo',
			}
			expect(resolveLogValueService(log)).toBeNull()
		})
	})

	describe('filterDuplicateLogEntries', () => {
		it('Returns newLogs if oldLogs is empty', () => {
			const oldLogs = []
			const newLogs = [{ _id: 'foo', value: 'foo' }]
			expect(filterDuplicateLogEntries(oldLogs, newLogs)).toEqual(newLogs)
		})

		it('Returns oldLogs if newLogs is empty', () => {
			const oldLogs = [{ _id: 'foo', value: 'foo' }]
			const newLogs = []
			expect(filterDuplicateLogEntries(oldLogs, newLogs)).toEqual(newLogs)
		})

		it('Returns filtered logs', () => {
			const oldLogs = [{ _id: 'foo', value: 'foo' }]
			const newLogs = [
				{ _id: 'foo', value: 'foo' },
				{ _id: 'bar', value: 'bar' },
			]

			const expected = [{ _id: 'bar', value: 'bar' }]
			expect(filterDuplicateLogEntries(oldLogs, newLogs)).toEqual(expected)
		})
	})

	describe('mapPostCommentResponseService', () => {
		const falsyCases = [
			{ title: 'Returns input if input is null', input: null },
			{ title: 'Returns input if input is empty object', input: {} },
			{ title: 'Returns input if input is undefined', input: undefined },
		]

		falsyCases.forEach(({ title, input }) => {
			it(title, () => {
				expect(mapPostCommentResponseService(input)).toEqual(input)
			})
		})

		const _id = 'foo'
		const comment = 'foo'
		const user = {
			_id: 'foo',
			email: 'foo@lajavaness.com',
			firstName: 'Foo',
			lastName: 'Bar',
		}
		const createdAt = 'foo'

		const value = comment
		const type = COMMENT_ADD

		const newUser = `${user.firstName} ${user.lastName.substring(0, 1)}.`

		const partialOutputCases = [
			{
				title: 'Returns partial output if missing _id',
				input: { comment, user, createdAt },
				expected: { createdAt, type, value, user: newUser },
			},
			{
				title: 'Returns input if input is missing comment',
				input: { _id, user, createdAt },
				expected: { _id, comment: _id, createdAt, type, user: newUser },
			},
			{
				title: 'Returns input if input is missing user',
				input: { _id, createdAt, comment },
				expected: { _id, comment: _id, createdAt, type, value },
			},
			{
				title: 'Returns input if input is missing property firstName in user',
				input: {
					_id,
					createdAt,
					user: {
						_id: 'foo',
						email: 'foo@lajavaness.com',
						lastName: 'Bar',
					},
					comment,
				},
				expected: { _id, comment: _id, createdAt, type, value },
			},
			{
				title: 'Returns input if input is missing property lastName in user',
				input: {
					_id,
					createdAt,
					user: {
						_id: 'foo',
						email: 'foo@lajavaness.com',
						firstName: 'Bar',
					},
					comment,
				},
				expected: { _id, comment: _id, createdAt, type, value },
			},
			{
				title: 'Returns input if input is missing createdAt',
				input: { _id, comment, user },
				expected: { _id, comment: _id, type, value, user: newUser },
			},
			{ title: 'Returns input if all property are missing in input ', input: { foo: 'foo' }, expected: { type } },
		]

		partialOutputCases.forEach(({ title, input, expected }) => {
			it(title, () => {
				expect(mapPostCommentResponseService(input)).toEqual(expected)
			})
		})

		it('Returns mapped data', () => {
			const input = { _id, comment, user, createdAt }
			const expected = { _id, comment: _id, createdAt, value, type, user: newUser }
			expect(mapPostCommentResponseService(input)).toEqual(expected)
		})
	})
})
