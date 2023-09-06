import {
  _isClassificationAnnotationEquivalent,
  _isEntitiesRelationEquivalent,
  _isNerAnnotationEquivalent,
  _isTextAnnotationEquivalent,
  _isZoneEquivalent,
  isAnnotationNer,
  isClassificationAnnotationEquivalent,
  isEntitiesRelationEquivalent,
  isNerAnnotationEquivalent,
  isPredictionEquivalentToAnnotation,
  isZoneAnnotationEquivalent,
} from 'shared/utils/annotationUtils'

describe('annotationUtils', () => {
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
