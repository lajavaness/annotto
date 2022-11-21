import mongoose from 'mongoose'
import crypto from 'crypto'
import ItemModel, { Item } from '../../db/models/items'
import { insertItemsBatch, saveItem } from '../items'
import { logTags } from '../logs'
import mongoSetupTeardown from './mongoSetupTeardown'

mongoSetupTeardown()

const createItem = async () => {
  const newItem = new ItemModel({
    body: 'first rule: Do not talk about fight club',
    predictions: {
      raw: {
        AGG: 0.41232131,
        RA01: 0.2112331,
      },
      keys: ['AGG', 'RA01'],
      size: 2,
    },
  })

  const item = await saveItem(newItem)

  item._user = {
    _id: mongoose.Types.ObjectId().toString(),
    email: `${crypto.randomBytes(10).toString('hex')}@lajavaness.com`,
    firstName: `${crypto.randomBytes(10).toString('hex')}`,
    lastName: `${crypto.randomBytes(10).toString('hex')}@lajavaness.com`,
  }

  return item
}

describe('services/item', () => {
  test('create', async () => {
    const item = await createItem()
    expect(item.body).toBeDefined()
  })
  test('insertItemsBatch', async () => {
    const projectId = mongoose.Types.ObjectId()

    const items = [
      { body: 'foo', data: {}, uuid: '1' },
      { body: 'bar', data: {}, uuid: '2' },
    ]
    const r = await insertItemsBatch(projectId, items)

    expect(r.insertedCount).toBe(2)
  })
})

describe('logs', () => {
  test('logTags - add tags', async () => {
    const item = await createItem()

    item.tags = ['pose question']
    const res = await logTags(item)

    expect(res).toHaveLength(1)
  })
  test('logTags - add && remove tags', async () => {
    const item = await createItem()
    item._original = <Item>{ tags: ['inconnu'] }
    item.tags = ['pose question']

    const res = await logTags(item)

    expect(res).toHaveLength(2)
    expect(res[0].type).toBe('tags-add')
    expect(res[1].type).toBe('tags-remove')
    expect(Array.from(res[0].tags)).toEqual(Array.from(item.tags))
    expect(Array.from(res[1].tags)).toEqual(Array.from(item._original.tags))
  })
  test('logTags - remove tags', async () => {
    const item = await createItem()
    item._original = <Item>{ tags: ['inconnu', 'test', 'FC TD'] }
    item.tags = []

    const res = await logTags(item)
    expect(res).toHaveLength(1)
    expect(res[0].type).toBe('tags-remove')
    expect(Array.from(res[0].tags)).toEqual(Array.from(item._original.tags))
  })
})
