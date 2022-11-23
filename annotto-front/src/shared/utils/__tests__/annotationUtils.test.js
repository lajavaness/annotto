import {
	_isClassificationAnnotationEquivalent,
	_isEntitiesRelationEquivalent,
	_isNerAnnotationEquivalent,
	_isTextAnnotationEquivalent,
	_isZoneEquivalent,
	doesOverlapWithCurrentAnnotations,
	isAnnotationNer,
	isClassificationAnnotationEquivalent,
	isEntitiesRelationEquivalent,
	isNerAnnotationEquivalent,
	isPredictionEquivalentToAnnotation,
	isZoneAnnotationEquivalent,
	sortAndFilterNerByStart,
} from 'shared/utils/annotationUtils'

describe('annotationUtils', () => {
	describe('sortNerByStart', () => {
		const cases = [
			{
				title: 'returns input if input is a number',
				input: 1,
			},
			{ title: 'returns input if input is null', input: null },
			{
				title: 'returns input if input is undefined',
				input: undefined,
			},
			{
				title: 'returns input if input is an empty object',
				input: {},
			},
			{
				title: 'returns input if input is an empty array',
				input: [],
			},
			{
				title: 'returns input if input is a string',
				input: 'toto',
			},
			{
				title: 'returns input if input an empty string',
				input: '',
			},
		]

		cases.forEach(({ title, input }) => {
			it(title, () => {
				expect(sortAndFilterNerByStart(input)).toEqual(input)
			})
		})

		it('returns filtered input', () => {
			const input = [{ name: 'bar' }, { name: 'foo', ner: { start: 1 } }]
			const output = [{ name: 'foo', ner: { start: 1 } }]
			expect(sortAndFilterNerByStart(input)).toEqual(output)
		})

		it('returns sorted input', () => {
			const input = [
				{ name: 'bar', ner: { start: 2 } },
				{ name: 'foo', ner: { start: 1 } },
			]
			const output = [
				{ name: 'foo', ner: { start: 1 } },
				{ name: 'bar', ner: { start: 2 } },
			]
			expect(sortAndFilterNerByStart(input)).toEqual(output)
		})

		it('returns filtered and sorted input', () => {
			const input = [{ name: 'bar', ner: { start: 2 } }, { name: 'foo', ner: { start: 1 } }, { name: 'zog' }]
			const output = [
				{ name: 'foo', ner: { start: 1 } },
				{ name: 'bar', ner: { start: 2 } },
			]
			expect(sortAndFilterNerByStart(input)).toEqual(output)
		})
	})

	describe('isAnnotationNer', () => {
		const falsyCases = [
			{
				title: 'returns false if input is a number',
				input: 1,
			},
			{ title: 'returns false if input is null', input: null },
			{
				title: 'returns false if input is undefined',
				input: undefined,
			},
			{
				title: 'returns false if input is an empty object',
				input: {},
			},
			{
				title: 'returns false if input is an empty array',
				input: [],
			},
			{
				title: 'returns false if input is a string',
				input: 'foo',
			},
			{
				title: 'returns false if input is an empty string',
				input: '',
			},
			{
				title: 'returns false if input has no value ner start',
				input: { ner: {} },
			},
			{
				title: 'returns false if input has no value ner end',
				input: { ner: { start: 1 } },
			},
			{
				title: 'returns false if is not a ner prediction',
				input: {
					value: 'foo',
					zone: [
						{ x: 1, y: 1 },
						{ x: 2, y: 1 },
					],
				},
			},
		]

		falsyCases.forEach(({ title, input }) => {
			it(title, () => {
				expect(isAnnotationNer(input)).toBeFalsy()
			})
		})

		it('returns true if ner prediction', () => {
			const input = { value: 'foo', ner: { start: 4, end: 8 } }
			expect(isAnnotationNer(input)).toBeTruthy()
		})
	})

	describe('doesOverlapWithCurrentAnnotations', () => {
		const annotations = [{ value: 'foo', ner: { start: 2, end: 5 } }]

		const emptyArrayCases = [
			{
				title: 'returns an empty array if annotations is a number',
				annotations: 1,
			},
			{ title: 'returns an empty array if annotations is null', annotations: null },
			{
				title: 'returns an empty array if annotations is undefined',
				annotations: undefined,
			},
			{
				title: 'returns an empty array if annotations is an empty object',
				annotations: {},
			},
			{
				title: 'returns an empty array if annotations is an empty array',
				annotations: [],
			},
			{
				title: 'returns an empty array if annotations is a string',
				annotations: 'foo',
			},
			{
				title: 'returns an empty array if annotations is an empty string',
				annotations: '',
			},
			{
				title: 'returns an empty array if start is not a number',
				annotations: annotations,
				start: 'foo',
			},
			{
				title: 'returns an empty array if end is not a number',
				annotations: annotations,
				start: 1,
				end: 'foo',
			},
			{
				title: 'returns an empty array if start and end do not overlap current annotations',
				annotations: annotations,
				start: 8,
				end: 10,
			},
		]

		emptyArrayCases.forEach(({ title, annotations, start, end }) => {
			it(title, () => {
				expect(doesOverlapWithCurrentAnnotations(annotations, start, end)).toEqual([])
			})
		})

		const overlapCases = [
			{
				title:
					'return an array with the overlapping annotation if the start is greater than the start of the annotation and less than the end of the annotation ',
				annotations: annotations,
				start: 3,
				end: 4,
			},
			{
				title:
					'return an array with the overlapping annotation if the start is equal than to start of the annotation and less than the end of the annotation ',
				annotations: annotations,
				start: 2,
				end: 4,
			},
			{
				title:
					'return an array with the overlapping annotation if the start is greater than the start of the annotation and equal to the end of the annotation ',
				annotations: annotations,
				start: 3,
				end: 5,
			},
			{
				title:
					'return an array with the overlapping annotation if the end is greater than the start of the annotation and less than the end of the annotation ',
				annotations: annotations,
				start: 3,
				end: 4,
			},
			{
				title:
					'return an array with the overlapping annotation if the end is equal to the start of the annotation and less than the end of the annotation ',
				annotations: annotations,
				start: 1,
				end: 2,
			},
			{
				title:
					'return an array with the overlapping annotation if the end is greater than the start of the annotation and equal to the end of the annotation ',
				annotations: annotations,
				start: 1,
				end: 5,
			},
			{
				title:
					'return an array with the overlapping annotation if the start is less than the start of the annotation and the end is less than the end of the annotation ',
				annotations: annotations,
				start: 1,
				end: 6,
			},
			{
				title:
					'return an array with the overlapping annotation if the start is greater than the start of the annotation and the end is less than the end of the annotation ',
				annotations: annotations,
				start: 3,
				end: 4,
			},
			{
				title: 'return an array with the overlapping annotation if the end is equal to the start of the annotation',
				annotations: annotations,
				start: 1,
				end: 5,
			},
			{
				title:
					'return an array with the overlapping annotation if the start is equal to than the end of the annotation',
				annotations: annotations,
				start: 5,
				end: 8,
			},
		]

		overlapCases.forEach(({ title, annotations, start, end }) => {
			it(title, () => {
				expect(doesOverlapWithCurrentAnnotations(annotations, start, end)).toEqual(annotations)
			})
		})
	})

	describe('isNerAnnotationEquivalent', () => {
		const falsyCases = [
			{
				title: 'returns false if input is a number',
				input: 1,
			},
			{ title: 'returns false if input is null', input: null },
			{
				title: 'returns false if input is undefined',
				input: undefined,
			},
			{
				title: 'returns false if input is an empty object',
				input: {},
			},
			{
				title: 'returns false if input is an empty array',
				input: [],
			},
			{
				title: 'returns false if input is a string',
				input: 'toto',
			},
			{
				title: 'returns false if input an empty string',
				input: '',
			},
			{
				title: 'returns false if input is not empty and other is a number',
				input: { ner: { start: 1, end: 1 } },
				other: 1,
			},
			{
				title: 'returns false if input is not empty and other is null',
				input: { ner: { start: 1, end: 1 } },
				other: null,
			},
			{
				title: 'returns false if input is not empty and other is undefined',
				input: { ner: { start: 1, end: 1 } },
				other: undefined,
			},
			{
				title: 'returns false if input is not empty and other is an empty object',
				input: { ner: { start: 1, end: 1 } },
				other: {},
			},
			{
				title: 'returns false if input is not empty and other is an empty array',
				input: { ner: { start: 1, end: 1 } },
				other: [],
			},
			{
				title: 'returns false if input is not empty and other is a string',
				input: { ner: { start: 1, end: 1 } },
				other: 'foo',
			},
			{
				title: 'returns false if input is not empty and other an empty string',
				input: { ner: { start: 1, end: 1 } },
				other: '',
			},
			{
				title: 'returns false if input has no value ner start',
				input: { ner: {} },
				other: { ner: { start: 1, end: 1 } },
			},
			{
				title: 'returns false if input has no value ner end',
				input: { ner: { start: 1 } },
				other: { ner: { start: 1, end: 1 } },
			},
			{
				title: 'returns false if other has no value ner start',
				input: { ner: { start: 1, end: 1 } },
				other: { ner: {} },
			},
			{
				title: 'returns false if other has no value ner end',
				input: { ner: { start: 1, end: 1 } },
				other: { ner: { start: 1 } },
			},
			{
				title: 'returns false if the input has not the same ner start than the other ner start ',
				input: { ner: { start: 1, end: 1 } },
				other: { ner: { start: 2, end: 1 } },
			},
			{
				title: 'returns false if the input has not the same ner end than the other ner end ',
				input: { ner: { start: 1, end: 1 } },
				other: { ner: { start: 1, end: 2 } },
			},
		]

		falsyCases.forEach(({ title, input, other }) => {
			it(title, () => {
				expect(isNerAnnotationEquivalent(input, other)).toBeFalsy()
			})
		})

		it('returns true if equal', () => {
			const input = { value: 'foo', ner: { start: 0, end: 2 } }
			const other = { value: 'foo', ner: { start: 0, end: 2 } }
			expect(isNerAnnotationEquivalent(input, other)).toBeTruthy()
		})
	})

	describe('isTaskAnnotationEquivalent', () => {
		const falsyCases = [
			{
				title: 'returns false if input is a number',
				input: 1,
			},
			{ title: 'returns false if input is null', input: null },
			{
				title: 'returns false if input is undefined',
				input: undefined,
			},
			{
				title: 'returns false if input is an empty object',
				input: {},
			},
			{
				title: 'returns false if input is an empty array',
				input: [],
			},
			{
				title: 'returns false if input is a string',
				input: 'toto',
			},
			{
				title: 'returns false if input an empty string',
				input: '',
			},
			{
				title: 'returns false if input is not empty and other is a number',
				input: { value: 'foo' },
				other: 1,
			},
			{ title: 'returns false if input is not empty and other is null', input: null },
			{
				title: 'returns false if input is not empty and other is undefined',
				input: { value: 'foo' },
				other: undefined,
			},
			{
				title: 'returns false if input is not empty and other is an empty object',
				input: { value: 'foo' },
				other: {},
			},
			{
				title: 'returns false if input is not empty and other is an empty array',
				input: { value: 'foo' },
				other: [],
			},
			{
				title: 'returns false if input is not empty and other is a string',
				input: { value: 'foo' },
				other: 'foo',
			},
			{
				title: 'returns false if input is not empty and other an empty string',
				input: { value: 'foo' },
				other: '',
			},
			{
				title: 'returns false if the input has no value',
				input: { value: null },
				other: { value: 'bar' },
			},
			{
				title: 'returns false if the input has no value',
				input: { value: 'bar' },
				other: { value: null },
			},
			{
				title: 'returns false if the input has not the same value than the other value ',
				input: { value: 'foo' },
				other: { value: 'bar' },
			},
		]

		falsyCases.forEach(({ title, input, other }) => {
			it(title, () => {
				expect(isClassificationAnnotationEquivalent(input, other)).toBeFalsy()
			})
		})

		it('returns true if equal', () => {
			const input = { value: 'foo' }
			const other = { value: 'foo' }
			expect(isClassificationAnnotationEquivalent(input, other)).toBeTruthy()
		})
	})

	describe('_isClassificationAnnotationEquivalent', () => {
		it('returns false if not equal', () => {
			const input = { value: 'foo' }
			const other = { value: 'bar' }
			expect(_isClassificationAnnotationEquivalent(input, other)).toBeFalsy()
		})

		it('returns true if equal', () => {
			const input = { value: 'foo' }
			const other = { value: 'foo' }
			expect(_isClassificationAnnotationEquivalent(input, other)).toBeTruthy()
		})
	})

	describe('_isNerAnnotationEquivalent', () => {
		it('returns false if not equal', () => {
			const input = { value: 'foo', ner: { start: 0, end: 2 } }
			const other = { value: 'foo', ner: { start: 1, end: 2 } }
			expect(_isNerAnnotationEquivalent(input, other)).toBeFalsy()
		})

		it('returns true if equal', () => {
			const input = { value: 'foo', ner: { start: 0, end: 2 } }
			const other = { value: 'foo', ner: { start: 0, end: 2 } }
			expect(_isNerAnnotationEquivalent(input, other)).toBeTruthy()
		})
	})

	describe('_isTextAnnotationEquivalent', () => {
		const falsyCases = [
			{
				title: 'returns false if input is a number',
				input: 1,
			},
			{ title: 'returns false if input is null', input: null },
			{
				title: 'returns false if input is undefined',
				input: undefined,
			},
			{
				title: 'returns false if input is an empty object',
				input: {},
			},
			{
				title: 'returns false if input is an empty array',
				input: [],
			},
			{
				title: 'returns false if output is a number',
				input: 'foo',
				output: 1,
			},
			{
				title: 'returns false if output is null',
				input: 'foo',
				output: null,
			},
			{
				title: 'returns false if output is undefined',
				input: 'foo',
				output: undefined,
			},
			{
				title: 'returns false if output is an empty object',
				input: 'foo',
				output: {},
			},
			{
				title: 'returns false if output is an empty array',
				input: 'foo',
				output: [],
			},
			{
				title: 'returns false if input and output are not equal',
				input: 'foo',
				output: 'bar',
			},
		]

		falsyCases.forEach(({ title, input }) => {
			it(title, () => {
				expect(_isTextAnnotationEquivalent(input)).toBeFalsy()
			})
		})

		it('returns true if equal', () => {
			const input = { value: 'foo', text: 'foo' }
			const other = { value: 'foo', text: 'foo' }
			expect(_isTextAnnotationEquivalent(input, other)).toBeTruthy()
		})
	})

	describe('_isZoneEquivalent', () => {
		const falsyCases = [
			{
				title: 'returns false if input zone is null',
				input: { zone: null },
				other: {
					zone: [
						{ x: 1, y: 1 },
						{ x: 2, y: 1 },
					],
				},
			},
			{
				title: 'returns false if other zone is null',
				input: {
					zone: [
						{ x: 1, y: 1 },
						{ x: 2, y: 1 },
					],
				},
				other: { zone: null },
			},
			{
				title: 'returns false if input zone is undefined',
				input: { zone: undefined },
				other: {
					zone: [
						{ x: 1, y: 1 },
						{ x: 2, y: 1 },
					],
				},
			},
			{
				title: 'returns false if other zone is undefined',
				input: {
					zone: [
						{ x: 1, y: 1 },
						{ x: 2, y: 1 },
					],
				},
				other: { zone: undefined },
			},
			{
				title: 'returns false if input zone is a number',
				input: { zone: 1 },
				other: {
					zone: [
						{ x: 1, y: 1 },
						{ x: 2, y: 1 },
					],
				},
			},
			{
				title: 'returns false if other zone is a number',
				input: {
					zone: [
						{ x: 1, y: 1 },
						{ x: 2, y: 1 },
					],
				},
				other: { zone: 'foo' },
			},
			{
				title: 'returns false if input zone is a string',
				input: { zone: 1 },
				other: {
					zone: [
						{ x: 1, y: 1 },
						{ x: 2, y: 1 },
					],
				},
			},
			{
				title: 'returns false if other zone is a string',
				input: {
					zone: [
						{ x: 1, y: 1 },
						{ x: 2, y: 1 },
					],
				},
				other: { zone: 'foo' },
			},
			{
				title: 'returns false if input zone is an object',
				input: { zone: {} },
				other: {
					zone: [
						{ x: 1, y: 1 },
						{ x: 2, y: 1 },
					],
				},
			},
			{
				title: 'returns false if other zone is an object',
				input: {
					zone: [
						{ x: 1, y: 1 },
						{ x: 2, y: 1 },
					],
				},
				other: { zone: {} },
			},
			{
				title: 'returns false if input zone and other zone have not the same length',
				input: { zone: [{ x: 1, y: 1 }] },
				other: {
					zone: [
						{ x: 1, y: 1 },
						{ x: 2, y: 1 },
					],
				},
			},
			{
				title: 'returns false if input zone does not have property x in all of its objects ',
				input: { zone: [{ x: 1, y: 1 }, { y: 1 }] },
				other: {
					zone: [
						{ x: 1, y: 1 },
						{ x: 2, y: 1 },
					],
				},
			},
			{
				title: 'returns false if input zone does not have property y in all of its objects ',
				input: { zone: [{ x: 1, y: 1 }, { x: 1 }] },
				other: {
					zone: [
						{ x: 1, y: 1 },
						{ x: 2, y: 1 },
					],
				},
			},
			{
				title: 'returns false if other zone does not have property x in all of its objects ',

				input: {
					zone: [
						{ x: 1, y: 1 },
						{ x: 2, y: 1 },
					],
				},
				other: { zone: [{ x: 1, y: 1 }, { y: 1 }] },
			},
			{
				title: 'returns false if other zone does not have property y in all of its objects ',
				input: {
					zone: [
						{ x: 1, y: 1 },
						{ x: 2, y: 1 },
					],
				},
				other: { zone: [{ x: 1, y: 1 }, { x: 1 }] },
			},
			{
				title: 'returns false if not equal',
				input: {
					value: 'foo',
					zone: [
						{ x: 1, y: 1 },
						{ x: 2, y: 1 },
					],
				},
				other: {
					value: 'foo',
					zone: [
						{ x: 1, y: 1 },
						{ x: 2, y: 2 },
					],
				},
			},
		]

		falsyCases.forEach(({ title, input, other }) => {
			it(title, () => {
				expect(_isZoneEquivalent(input, other)).toBeFalsy()
			})
		})

		it('returns true if equal', () => {
			const input = {
				value: 'foo',
				zone: [
					{ x: 1, y: 1 },
					{ x: 2, y: 1 },
				],
			}
			const other = {
				value: 'foo',
				zone: [
					{ x: 1, y: 1 },
					{ x: 2, y: 1 },
				],
			}
			expect(_isZoneEquivalent(input, other)).toBeTruthy()
		})
	})

	describe('isZoneAnnotationEquivalent', () => {
		const falsyCases = [
			{
				title: 'returns false if input is a number',
				input: 1,
			},
			{ title: 'returns false if input is null', input: null },
			{
				title: 'returns false if input is undefined',
				input: undefined,
			},
			{
				title: 'returns false if input is an empty object',
				input: {},
			},
			{
				title: 'returns false if input is an empty array',
				input: [],
			},
			{
				title: 'returns false if input is a string',
				input: 'toto',
			},
			{
				title: 'returns false if input an empty string',
				input: '',
			},
			{
				title: 'returns false if input is not empty and other is a number',
				input: { ner: { start: 1, end: 1 } },
				other: 1,
			},
			{
				title: 'returns false if input is not empty and other is null',
				input: { ner: { start: 1, end: 1 } },
				other: null,
			},
			{
				title: 'returns false if input is not empty and other is undefined',
				input: { ner: { start: 1, end: 1 } },
				other: undefined,
			},
			{
				title: 'returns false if input is not empty and other is an empty object',
				input: { ner: { start: 1, end: 1 } },
				other: {},
			},
			{
				title: 'returns false if input is not empty and other is an empty array',
				input: { ner: { start: 1, end: 1 } },
				other: [],
			},
			{
				title: 'returns false if input is not empty and other is a string',
				input: { ner: { start: 1, end: 1 } },
				other: 'foo',
			},
			{
				title: 'returns false if input is not empty and other an empty string',
				input: { ner: { start: 1, end: 1 } },
				other: '',
			},
		]

		falsyCases.forEach(({ title, input, other }) => {
			it(title, () => {
				expect(isZoneAnnotationEquivalent(input, other)).toBeFalsy()
			})
		})

		it('returns true if equal', () => {
			const input = {
				value: 'foo',
				zone: [
					{ x: 1, y: 1 },
					{ x: 2, y: 1 },
				],
			}
			const other = {
				value: 'foo',
				zone: [
					{ x: 1, y: 1 },
					{ x: 2, y: 1 },
				],
			}
			expect(isZoneAnnotationEquivalent(input, other)).toBeTruthy()
		})
	})

	describe('isPredictionEquivalentToAnnotation', () => {
		const falsyCases = [
			{
				title: 'returns false if annotation is null',
				annotation: null,
				prediction: { value: 'foo' },
			},
			{
				title: 'returns false if annotation is undefined',
				annotation: null,
				prediction: { value: 'foo' },
			},
			{
				title: 'returns false if prediction is null',
				annotation: { value: 'foo' },
				prediction: null,
			},
			{
				title: 'returns false if prediction is undefined',
				annotation: { value: 'foo' },
				prediction: undefined,
			},
		]

		falsyCases.forEach(({ title, annotation, prediction }) => {
			it(title, () => {
				expect(isPredictionEquivalentToAnnotation(annotation, prediction)).toBeFalsy()
			})
		})

		it('returns true if equivalent', () => {
			const prediction = { value: 'foo', ner: { start: 1, end: 2 } }
			const annotation = { value: 'foo', ner: { start: 1, end: 2 } }
			expect(isPredictionEquivalentToAnnotation(prediction, annotation)).toBeTruthy()
		})

		it('returns true if ner equivalent', () => {
			const prediction = { ner: { start: 1, end: 2 } }
			const annotation = { ner: { start: 1, end: 2 } }
			expect(isPredictionEquivalentToAnnotation(prediction, annotation)).toBeTruthy()
		})

		it('returns true if task equivalent', () => {
			const prediction = { value: 'foo' }
			const annotation = { value: 'foo' }
			expect(isPredictionEquivalentToAnnotation(prediction, annotation)).toBeTruthy()
		})

		it('returns true if text equivalent', () => {
			const prediction = { value: 'foo', text: 'foo' }
			const annotation = { value: 'foo', text: 'foo' }
			expect(isPredictionEquivalentToAnnotation(prediction, annotation)).toBeTruthy()
		})
	})

	describe('_isEntitiesRelationEquivalent', () => {
		it('returns false if not equal', () => {
			const input = {
				value: 'bar',
				src: { value: 'foo', ner: { start: 0, end: 2 } },
				dest: { value: 'foo', ner: { start: 3, end: 4 } },
			}
			const other = {
				value: 'foo',
				src: { value: 'bar', ner: { start: 1, end: 2 } },
				dest: { value: 'foo', ner: { start: 3, end: 4 } },
			}
			expect(_isEntitiesRelationEquivalent(input, other)).toBeFalsy()
		})

		it('returns true if equal', () => {
			const input = {
				value: 'bar',
				src: { value: 'foo', ner: { start: 0, end: 2 } },
				dest: { value: 'foo', ner: { start: 3, end: 4 } },
			}
			const other = {
				value: 'bar',
				src: { value: 'foo', ner: { start: 0, end: 2 } },
				dest: { value: 'foo', ner: { start: 3, end: 4 } },
			}
			expect(_isEntitiesRelationEquivalent(input, other)).toBeTruthy()
		})
	})

	describe('isEntitiesRelationEquivalent', () => {
		const falsyCases = [
			{
				title: 'returns false if input is a number',
				input: 1,
			},
			{ title: 'returns false if input is null', input: null },
			{
				title: 'returns false if input is undefined',
				input: undefined,
			},
			{
				title: 'returns false if input is an empty object',
				input: {},
			},
			{
				title: 'returns false if input is an empty array',
				input: [],
			},
			{
				title: 'returns false if input is a string',
				input: 'toto',
			},
			{
				title: 'returns false if input an empty string',
				input: '',
			},
			{
				title: 'returns false if input is not empty and other is a number',
				input: {
					value: 'bar',
					src: { value: 'foo', ner: { start: 0, end: 2 } },
					dest: { value: 'foo', ner: { start: 3, end: 4 } },
				},
				other: 1,
			},
			{
				title: 'returns false if input is not empty and other is null',
				input: {
					value: 'bar',
					src: { value: 'foo', ner: { start: 0, end: 2 } },
					dest: { value: 'foo', ner: { start: 3, end: 4 } },
				},
				other: null,
			},
			{
				title: 'returns false if input is not empty and other is undefined',
				input: {
					value: 'bar',
					src: { value: 'foo', ner: { start: 0, end: 2 } },
					dest: { value: 'foo', ner: { start: 3, end: 4 } },
				},
				other: undefined,
			},
			{
				title: 'returns false if input is not empty and other is an empty object',
				input: {
					value: 'bar',
					src: { value: 'foo', ner: { start: 0, end: 2 } },
					dest: { value: 'foo', ner: { start: 3, end: 4 } },
				},
				other: {},
			},
			{
				title: 'returns false if input is not empty and other is an empty array',
				input: {
					value: 'bar',
					src: { value: 'foo', ner: { start: 0, end: 2 } },
					dest: { value: 'foo', ner: { start: 3, end: 4 } },
				},
				other: [],
			},
			{
				title: 'returns false if input is not empty and other is a string',
				input: {
					value: 'bar',
					src: { value: 'foo', ner: { start: 0, end: 2 } },
					dest: { value: 'foo', ner: { start: 3, end: 4 } },
				},
				other: 'foo',
			},
			{
				title: 'returns false if input is not empty and other an empty string',
				input: { ner: { start: 1, end: 1 } },
				other: '',
			},
			{
				title: 'returns false if input has no value src',
				input: { value: 'bar', dest: { value: 'foo', ner: { start: 3, end: 4 } } },
				other: {
					value: 'bar',
					src: { value: 'foo', ner: { start: 0, end: 2 } },
					dest: { value: 'foo', ner: { start: 3, end: 4 } },
				},
			},
			{
				title: 'returns false if input has no dest',
				input: { value: 'bar', src: { value: 'foo', ner: { start: 0, end: 2 } } },
				other: { ner: { start: 1, end: 1 } },
			},
			{
				title: 'returns false if other has no value src',
				input: {
					value: 'bar',
					src: { value: 'foo', ner: { start: 0, end: 2 } },
					dest: { value: 'foo', ner: { start: 3, end: 4 } },
				},
				other: { value: 'bar', dest: { value: 'foo', ner: { start: 3, end: 4 } } },
			},
			{
				title: 'returns false if other has no value dest',
				input: {
					value: 'bar',
					src: { value: 'foo', ner: { start: 0, end: 2 } },
					dest: { value: 'foo', ner: { start: 3, end: 4 } },
				},
				other: { value: 'bar', dest: { value: 'foo', ner: { start: 3, end: 4 } } },
			},
			{
				title: 'returns false if the input value is not the same than the other value ',
				input: {
					value: 'foo',
					src: { value: 'foo', ner: { start: 0, end: 2 } },
					dest: { value: 'foo', ner: { start: 3, end: 4 } },
				},
				other: {
					value: 'bar',
					src: { value: 'foo', ner: { start: 0, end: 2 } },
					dest: { value: 'foo', ner: { start: 3, end: 4 } },
				},
			},
		]

		falsyCases.forEach(({ title, input, other }) => {
			it(title, () => {
				expect(isNerAnnotationEquivalent(input, other)).toBeFalsy()
			})
		})

		it('returns true if equal', () => {
			const input = {
				value: 'bar',
				src: { value: 'foo', ner: { start: 0, end: 2 } },
				dest: { value: 'foo', ner: { start: 3, end: 4 } },
			}
			const other = {
				value: 'bar',
				src: { value: 'foo', ner: { start: 0, end: 2 } },
				dest: { value: 'foo', ner: { start: 3, end: 4 } },
			}
			expect(isEntitiesRelationEquivalent(input, other)).toBeTruthy()
		})
	})
})
