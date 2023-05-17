import {
  doesAnnotationNerAlreadyExist,
  getAnnotationIndex,
  getAnnotationMarkNode,
  getTextNodes,
  sortAndFilterNerByStart,
  splitContentToAnnotationMarks,
} from 'modules/project/services/nerAnnotationServices'

describe('nerAnnotationServices', () => {
  describe('splitContentToAnnotationMarks', () => {
    it('should return an empty array if the input string is empty', () => {
      expect(splitContentToAnnotationMarks('')).toEqual([])
    })

    it('should return string in object if annotations is empty', () => {
      const string = 'foo'
      expect(splitContentToAnnotationMarks(string)).toEqual([{ charAnnotations: [], isHighlight: false, value: 'foo' }])
    })

    it('should correctly split the input string into an array of characters with their annotations and highlights', () => {
      const string = 'Hello World'
      const annotations = [
        {
          ner: {
            start: 0,
            end: 5,
          },
          taskValue: 'Greeting',
          task: 'Annotation',
        },
        {
          ner: {
            start: 6,
            end: 11,
          },
          taskValue: 'Earth',
          task: 'Annotation',
        },
      ]
      const highlights = [
        {
          start: 0,
          end: 10,
          score: 0.9,
        },
      ]

      const result = splitContentToAnnotationMarks(string, annotations, highlights)

      expect(result).toEqual([
        {
          charAnnotations: [
            {
              end: 5,
              isFirstMark: true,
              isLastMark: true,
              start: 0,
            },
          ],
          isHighlight: true,
          value: 'Hello',
        },
        {
          charAnnotations: [],
          isHighlight: true,
          value: ' ',
        },
        {
          charAnnotations: [
            {
              end: 11,
              isFirstMark: true,
              isLastMark: false,
              start: 6,
            },
          ],
          isHighlight: true,
          value: 'Worl',
        },
        {
          charAnnotations: [
            {
              end: 11,
              isFirstMark: false,
              isLastMark: true,
              start: 6,
            },
          ],
          isHighlight: false,
          value: 'd',
        },
      ])
    })
  })

  describe('doesAnnotationNerAlreadyExist', () => {
    it('returns true when the annotation to check is in the annotations list', () => {
      expect(
        doesAnnotationNerAlreadyExist([{ value: 'John', ner: { start: 0, end: 3 } }], {
          value: 'John',
          ner: { start: 0, end: 3 },
        })
      ).toBeTruthy()
    })

    it('returns false when the annotation to check is not in the annotations list', () => {
      expect(
        doesAnnotationNerAlreadyExist([{ value: 'John', ner: { start: 0, end: 3 } }], {
          value: 'Jane',
          ner: { start: 0, end: 3 },
        })
      ).toBeFalsy()
    })
  })

  describe('getTextNodes', () => {
    let div
    let textNode1
    let textNode2
    let supNode

    beforeEach(() => {
      div = document.createElement('div')
      textNode1 = document.createTextNode('text node 1')
      textNode2 = document.createTextNode('text node 2')
      supNode = document.createElement('sup')
      supNode.appendChild(textNode2)
      div.appendChild(textNode1)
      div.appendChild(supNode)
    })

    it('returns only text nodes with parent tagName different from SUP', () => {
      const textNodes = getTextNodes(div)
      expect(textNodes).toHaveLength(1)
      expect(textNodes[0]).toBe(textNode1)
    })

    it('returns an empty array for a node without text nodes', () => {
      const emptyNode = document.createElement('empty')
      const textNodes = getTextNodes(emptyNode)
      expect(textNodes).toHaveLength(0)
    })
  })

  describe('getAnnotationMarkNode', () => {
    it('returns the node with the specified annotationIndex', () => {
      const nodes = [
        { annotationIndex: 1, node: { id: 'node1' } },
        { annotationIndex: 2, node: { id: 'node2' } },
        { annotationIndex: 3, node: { id: 'node3' } },
      ]
      const annotationIndex = 2
      const result = getAnnotationMarkNode(annotationIndex, nodes)
      expect(result).toEqual({ id: 'node2' })
    })

    it('returns null if no node has the specified annotationIndex', () => {
      const nodes = [
        { annotationIndex: 1, node: { id: 'node1' } },
        { annotationIndex: 2, node: { id: 'node2' } },
        { annotationIndex: 3, node: { id: 'node3' } },
      ]
      const annotationIndex = 4
      const result = getAnnotationMarkNode(annotationIndex, nodes)
      expect(result).toBeNull()
    })

    it('returns null if nodes is empty', () => {
      const nodes = []
      const annotationIndex = 2
      const result = getAnnotationMarkNode(annotationIndex, nodes)
      expect(result).toBeNull()
    })

    it('returns null if annotationIndex is not defined', () => {
      const nodes = [
        { annotationIndex: 1, node: { id: 'node1' } },
        { annotationIndex: 2, node: { id: 'node2' } },
        { annotationIndex: 3, node: { id: 'node3' } },
      ]
      const annotationIndex = undefined
      const result = getAnnotationMarkNode(annotationIndex, nodes)
      expect(result).toBeNull()
    })
  })

  describe('getAnnotationIndex', () => {
    const annotations = [
      { value: 'John Doe', ner: { start: 1, end: 5 } },
      { value: 'Jane Doe', ner: { start: 6, end: 10 } },
    ]

    const annotationToFind = { value: 'Jane Doe', ner: { start: 6, end: 10 } }

    it('returns the index of the specified annotation', () => {
      const result = getAnnotationIndex(annotationToFind, annotations)
      expect(result).toBe(1)
    })

    const falsyCases = [
      ['the specified annotation is not found', { value: 'Event', ner: { start: 16, end: 20 } }, annotations],
      ['annotations is empty', annotationToFind, []],
      ['annotations is undefined', annotationToFind, undefined],
    ]

    it.each(falsyCases)('return -1 if %s', (title, input1, input2) => {
      expect(getAnnotationIndex(input1, input2)).toBe(-1)
    })
  })

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
})
