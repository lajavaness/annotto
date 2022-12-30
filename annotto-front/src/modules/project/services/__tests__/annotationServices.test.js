import {
  addLogsToItemService,
  filterAndAddAnnotationsToItemService,
  filterAndAddItemService,
  filterAndMergeAnnotationItemsService,
  findAnnotationItemType,
  mapAnnotationItemsPredictionsKeyResponseService,
  mapAnnotationRequestService,
  mapAnnotationsRequestService,
  updateItemsService,
} from 'modules/project/services/annotationServices'

import { ANNOTATION_ITEMS_SIZE } from 'shared/enums/paginationTypes'
import { CANCELLED, DONE, NER, TEXT, ZONE } from 'shared/enums/annotationTypes'
import { IMAGE as PROJECT_IMAGE, TEXT as PROJECT_TEXT } from 'shared/enums/projectType'

describe('annotationServices', () => {
  describe('filterAndMergeAnnotationItemsService', () => {
    it('Returns newItems if items is empty', () => {
      const items = []
      const newItems = [{ _id: 'Foo' }, { _id: 'Bar' }]
      expect(filterAndMergeAnnotationItemsService(items, newItems)).toEqual(newItems)
    })

    it('Returns items merged with newItems if newItems is not filtered', () => {
      const items = [{ _id: 'Zog' }]
      const newItems = [{ _id: 'Foo' }, { _id: 'Bar' }]
      const output = [...items, ...newItems]
      expect(filterAndMergeAnnotationItemsService(items, newItems)).toEqual(output)
    })

    it('Returns items merged with filtered newItems', () => {
      const items = [{ _id: 'Foo' }]
      const newItems = [{ _id: 'Foo' }, { _id: 'Bar' }]
      const output = [...items, { _id: 'Bar' }]
      expect(filterAndMergeAnnotationItemsService(items, newItems)).toEqual(output)
    })
  })

  describe('updateItemsService', () => {
    const itemToUpdate = { _id: 'foo', body: 'zog' }
    const items = [
      { _id: 'foo', body: 'bar' },
      { _id: 'bar', body: 'foo' },
    ]

    it('Returns gived items if is not an array', () => {
      const newItems = null
      expect(updateItemsService(newItems, itemToUpdate)).toEqual(newItems)
    })

    it('Returns items if itemToUpdate is empty', () => {
      const newItemToUpdate = null
      expect(updateItemsService(items, newItemToUpdate)).toEqual(items)
    })

    it('Returns items with itemToUpdate in last position if itemToUpdate is not in items', () => {
      const newItemToUpdate = { _id: 'zog', body: 'zog' }
      const expected = [...items, newItemToUpdate]
      expect(updateItemsService(items, newItemToUpdate)).toEqual(expected)
    })

    it('Returns an array with itemToUpdate inside if items is an empty array', () => {
      const newItems = []
      expect(updateItemsService(newItems, itemToUpdate)).toEqual([itemToUpdate])
    })

    it('Returns items with updated item', () => {
      const expected = [itemToUpdate, { _id: 'bar', body: 'foo' }]
      expect(updateItemsService(items, itemToUpdate)).toEqual(expected)
    })
  })

  describe('filterAndAddAnnotationsToItemService', () => {
    const annotations = [
      {
        _id: '5f4674480e2f5c3d2dcca335',
        status: DONE,
        value: 'foo',
        zone: [],
        ner: {
          start: 2,
          end: 2,
        },
        updatedAt: '2020-08-27T12:17:32.442Z',
        createdAt: '2020-08-26T14:40:08.093Z',
      },
      {
        _id: '5f4674480e2f5c3d2dcca335',
        status: DONE,
        value: 'foo',
        zone: [],
        ner: {},
        text: 'foo',
        updatedAt: '2020-08-27T12:17:32.442Z',
        createdAt: '2020-08-26T14:40:08.093Z',
      },
      {
        _id: '5f47a45cabc8771c128f6792',
        status: DONE,
        value: 'bar',
        zone: ['foo'],
        ner: {},
        updatedAt: '2020-08-27T12:25:21.012Z',
        createdAt: '2020-08-27T12:17:32.434Z',
      },
      {
        _id: '5f47a45cabc8771c128f6793',
        status: CANCELLED,
        value: 'zog',
        zone: ['bar'],
        ner: {},
        updatedAt: '2020-08-27T12:25:21.012Z',
        createdAt: '2020-08-27T12:17:32.434Z',
      },
    ]
    const item = { _id: 'foo', value: 'bar' }

    it('Returns item if annotations is empty', () => {
      const emptyAnnotations = []
      expect(filterAndAddAnnotationsToItemService(emptyAnnotations, item)).toEqual(item)
    })

    it('Returns item if item is empty', () => {
      const emptyItem = []
      expect(filterAndAddAnnotationsToItemService(annotations, emptyItem)).toEqual(emptyItem)
    })

    it('Returns item with annotations without key ner if ner is empty in annotations input', () => {
      const expected = {
        ...item,
        annotations: [
          {
            value: 'foo',
          },
        ],
      }

      const newAnnotations = [
        {
          _id: '5f47a45cabc8771c128f6792',
          status: DONE,
          value: 'foo',
          zone: [],
          updatedAt: '2020-08-27T12:25:21.012Z',
          createdAt: '2020-08-27T12:17:32.434Z',
        },
      ]
      expect(filterAndAddAnnotationsToItemService(newAnnotations, item)).toEqual(expected)
    })

    it('Returns item with annotations without key zone if zone is empty in annotations input', () => {
      const expected = {
        ...item,
        annotations: [
          {
            value: 'foo',
          },
        ],
      }

      const newAnnotations = [
        {
          _id: '5f47a45cabc8771c128f6792',
          status: DONE,
          value: 'foo',
          ner: {},
          updatedAt: '2020-08-27T12:25:21.012Z',
          createdAt: '2020-08-27T12:17:32.434Z',
        },
      ]
      expect(filterAndAddAnnotationsToItemService(newAnnotations, item)).toEqual(expected)
    })

    it('Returns items with empty annotations array if there are not annotations with status === DONE', () => {
      const expected = {
        ...item,
        annotations: [],
      }

      const newAnnotations = [
        {
          _id: '5f47a45cabc8771c128f6792',
          status: CANCELLED,
          task: '5f3d330e71162f53ca61f477',
          ner: {},
          updatedAt: '2020-08-27T12:25:21.012Z',
          createdAt: '2020-08-27T12:17:32.434Z',
        },
      ]

      expect(filterAndAddAnnotationsToItemService(newAnnotations, item)).toEqual(expected)
    })

    it('Returns items with annotations', () => {
      const expected = {
        ...item,
        annotations: [
          {
            value: 'foo',
            ner: {
              start: 2,
              end: 2,
            },
          },
          {
            value: 'foo',
            text: 'foo',
          },
          {
            value: 'bar',
            zone: ['foo'],
          },
        ],
      }
      expect(filterAndAddAnnotationsToItemService(annotations, item)).toEqual(expected)
    })
  })

  describe('mapAnnotationItemsPredictionsKeyResponseService', () => {
    it('Returns input if input is empty', () => {
      const input = {}
      expect(mapAnnotationItemsPredictionsKeyResponseService(input)).toEqual(input)
    })

    it('Returns an object with value if input contains an object with a value', () => {
      const input = { value: 'foo' }
      expect(mapAnnotationItemsPredictionsKeyResponseService(input)).toEqual(input)
    })

    describe('ner cases', () => {
      const cases = [
        {
          title: 'Returns ner if input contains an object having a start and an end',
          input: { ner: { start: 2, end: 3 } },
          expected: { ner: { start: 2, end: 3 } },
        },
        {
          title: 'Returns an empty object if input contains an object having a start and no end',
          input: { ner: { start: 2 } },
          expected: {},
        },
        {
          title: 'Returns an empty object if input contains an object having a end and no start',
          input: { ner: { end: 2 } },
          expected: {},
        },
        {
          title: 'Returns items with ner if input contains start and end',
          input: { start: 2, end: 3 },
          expected: { ner: { start: 2, end: 3 } },
        },
        {
          title: 'Returns an empty object if input contains start and no end',
          input: { start: 2 },
          expected: {},
        },
        {
          title: 'Returns an empty object if input contains end and no start',
          input: { end: 2 },
          expected: {},
        },
      ]

      cases.forEach(({ title, input, expected }) => {
        it(title, () => {
          expect(mapAnnotationItemsPredictionsKeyResponseService(input)).toEqual(expected)
        })
      })
    })

    it('Returns an object with zone if input contains an object with a zone', () => {
      const input = { zone: 'foo' }
      expect(mapAnnotationItemsPredictionsKeyResponseService(input)).toEqual(input)
    })

    it('Returns an object with text if input contains an object with a text', () => {
      const input = { text: 'foo' }
      expect(mapAnnotationItemsPredictionsKeyResponseService(input)).toEqual(input)
    })

    it('Returns filtered data', () => {
      const input = { value: 'foo', text: 'foo', zone: 'foo', ner: { start: 2, end: 3 }, foo: 'foo' }
      const expected = { value: 'foo', text: 'foo', zone: 'foo', ner: { start: 2, end: 3 } }
      expect(mapAnnotationItemsPredictionsKeyResponseService(input)).toEqual(expected)
    })

    it('Returns mapped data', () => {
      const input = { value: 'foo', text: 'foo', zone: 'foo', ner: { start: 2, end: 3 } }
      const expected = { value: 'foo', text: 'foo', zone: 'foo', ner: { start: 2, end: 3 } }
      expect(mapAnnotationItemsPredictionsKeyResponseService(input)).toEqual(expected)
    })
  })

  describe('addLogsToItemService', () => {
    const logs = ['foo']
    const item = { _id: 'foo', value: 'bar' }

    it('Returns item if logs is empty', () => {
      const emptyLogs = []
      expect(addLogsToItemService(emptyLogs, item)).toEqual(item)
    })

    it('Returns item if item is empty', () => {
      const emptyItem = []
      expect(addLogsToItemService(logs, emptyItem)).toEqual(emptyItem)
    })

    it('Returns items with logs', () => {
      const expected = {
        ...item,
        logs,
      }
      expect(addLogsToItemService(logs, item)).toEqual(expected)
    })
  })

  describe('filterAndAddItemService', () => {
    const items = [
      { _id: 'foo', value: 'foo' },
      { _id: 'bar', value: 'bar' },
    ]
    const item = { _id: 'zog', value: 'zog' }

    it('Returns gived items if it is an empty array', () => {
      const newItems = []
      expect(filterAndAddItemService(newItems, item)).toEqual(newItems)
    })

    it('Returns items if it is an empty array', () => {
      const newItem = []
      expect(filterAndAddItemService(items, newItem)).toEqual(items)
    })

    it('Returns filtered items and add a new value', () => {
      const newItem = { _id: 'foo', value: 'bar' }

      const expected = [{ _id: 'bar', value: 'bar' }, newItem]

      expect(filterAndAddItemService(items, newItem)).toEqual(expected)
    })

    it("Returns filtered items with item in last position if items don't have item", () => {
      const expected = [
        { _id: 'foo', value: 'foo' },
        { _id: 'bar', value: 'bar' },
        { _id: 'zog', value: 'zog' },
      ]
      expect(filterAndAddItemService(items, item)).toEqual(expected)
    })

    it('Returns sliced items', () => {
      const newItems = Array.from({ length: ANNOTATION_ITEMS_SIZE + 1 }, (v, i) => ({
        _id: `foo_${i}`,
        value: `foo_value_${i}`,
      }))
      expect(filterAndAddItemService(newItems, item)).toHaveLength(ANNOTATION_ITEMS_SIZE)
    })

    it('Returns filtered and sliced items', () => {
      const newItems = Array.from({ length: ANNOTATION_ITEMS_SIZE + 1 }, (v, i) => ({
        _id: `foo_${i}`,
        value: `foo_value_${i}`,
      }))
      const newItem = { _id: 'foo_1', value: 'foo_value_1' }
      expect(filterAndAddItemService(newItems, newItem)).toHaveLength(ANNOTATION_ITEMS_SIZE)
    })
  })

  describe('mapAnnotationsRequestService', () => {
    it('Returns input if null', () => {
      const input = null
      expect(mapAnnotationsRequestService(input)).toBeNull()
    })

    it('Returns input if empty', () => {
      const input = {}
      const output = {}
      expect(mapAnnotationsRequestService(input)).toEqual(output)
    })

    it('Returns partial output if missing keys', () => {
      const input = [{ value: 'foo' }]
      const output = [{ value: 'foo' }]

      expect(mapAnnotationsRequestService(input)).toEqual(output)
    })

    it('Returns mapped data', () => {
      const input = [
        {
          value: 'foo',
          ner: 'foo',
          zone: [{ foo: 'foo', x: 'bar', y: 'bar' }],
        },
      ]

      const output = [
        {
          value: 'foo',
          ner: 'foo',
          zone: [{ x: 'bar', y: 'bar' }],
        },
      ]
      expect(mapAnnotationsRequestService(input)).toEqual(output)
    })
  })

  describe('mapAnnotationRequestService', () => {
    it('Returns input if null', () => {
      const input = null
      expect(mapAnnotationRequestService(input)).toBeNull()
    })

    it('Returns input if empty', () => {
      const input = {}
      const output = {}
      expect(mapAnnotationRequestService(input)).toEqual(output)
    })

    it('Returns partial output if missing keys', () => {
      const input = { value: 'foo' }
      const output = { value: 'foo' }

      expect(mapAnnotationRequestService(input)).toEqual(output)
    })

    it('Returns mapped data', () => {
      const input = {
        value: 'foo',
        ner: 'foo',
        zone: [{ foo: 'foo', x: 'bar', y: 'bar' }],
        text: 'foo',
      }

      const output = {
        value: 'foo',
        ner: 'foo',
        zone: [{ x: 'bar', y: 'bar' }],
        text: 'foo',
      }
      expect(mapAnnotationRequestService(input)).toEqual(output)
    })
  })

  describe('findAnnotationItemType', () => {
    it('Throws an error if no annotation type is found', () => {
      const err = new Error('No annotation type found')

      expect(() => findAnnotationItemType('foo')).toThrow(err)
    })

    const cases = [
      [
        `Returns ${NER} if the project type is ${PROJECT_TEXT} and there is a task of type ${NER}`,
        PROJECT_TEXT,
        [{ type: NER }],
        NER,
      ],
      [
        `Returns ${TEXT} if the project type is ${TEXT} and there is no task of type ${NER}`,
        PROJECT_TEXT,
        [{ type: 'foo' }],
        TEXT,
      ],
      [`Returns ${TEXT} if the project type is ${TEXT} and there is no tasks`, PROJECT_TEXT, null, TEXT],
      [`Returns ${ZONE} if the project type is ${PROJECT_IMAGE}`, PROJECT_IMAGE, null, ZONE],
    ]
    it.each(cases)('%s', (title, projectType, tasks, output) => {
      expect(findAnnotationItemType(projectType, tasks)).toEqual(output)
    })
  })
})
