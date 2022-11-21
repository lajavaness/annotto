import crypto from 'crypto'
import express from 'express'
import supertest from 'supertest'
import mongoose from 'mongoose'
import createServer from '../../src/__tests__/create-server'
import getToken from '../../src/__tests__/get-oauth-token'
import { adminOauth } from './seed/seed'
import config from '../../config'

let JWT: string
let app: express.Application

const DEMOS = [
  {
    config: `${process.cwd()}/statics/demo/demo-zone+ocr/config.json`,
    items: `${process.cwd()}/statics/demo/demo-zone+ocr/items.jsonlines`,
    predictions: `${process.cwd()}/statics/demo/demo-zone+ocr/predictions.jsonlines`,
  },
  {
    config: `${process.cwd()}/statics/demo/demo-zone+classification-public-image/config.json`,
    items: `${process.cwd()}/statics/demo/demo-zone+classification-public-image/items.jsonlines`,
    predictions: `${process.cwd()}/statics/demo/demo-zone+classification-public-image/predictions.jsonlines`,
  },
  {
    config: `${process.cwd()}/statics/demo/demo-nerWithRelations/config.json`,
    items: `${process.cwd()}/statics/demo/demo-nerWithRelations/items.jsonlines`,
    predictions: `${process.cwd()}/statics/demo/demo-nerWithRelations/predictions.jsonlines`,
  },
  {
    config: `${process.cwd()}/statics/demo/demo-classification-text-1/config.json`,
    items: `${process.cwd()}/statics/demo/demo-classification-text-1/items.jsonlines`,
    predictions: `${process.cwd()}/statics/demo/demo-classification-text-1/predictions.jsonlines`,
  },
  {
    config: `${process.cwd()}/statics/demo/demo-ner+classification-text/config.json`,
    items: `${process.cwd()}/statics/demo/demo-ner+classification-text/items.jsonlines`,
    predictions: `${process.cwd()}/statics/demo/demo-ner+classification-text/predictions.jsonlines`,
  },
  {
    config: `${process.cwd()}/statics/demo/demo-zone+classification-public-image/config.json`,
    items: `${process.cwd()}/statics/demo/demo-zone+classification-public-image/items.jsonlines`,
    predictions: `${process.cwd()}/statics/demo/demo-zone+classification-public-image/predictions.jsonlines`,
  },
  {
    config: `${process.cwd()}/statics/demo/demo-classification-public-image/config.json`,
    items: `${process.cwd()}/statics/demo/demo-classification-public-image/items.jsonlines`,
  },
]

const createSeedProject = (jwt: string, project = DEMOS[0]) => {
  return supertest(app)
    .post('/api/projects/import')
    .set('Authorization', `Bearer ${jwt}`)
    .attach('project', project.config)
    .attach('items', project.items)
    .attach('predictions', project.predictions || '')
    .expect(200)
    .then((res) => res.body.project)
}

beforeAll(async () => {
  app = await createServer(config)
  await mongoose.connect(config.mongo.url, config.mongo.options)

  JWT = await getToken(adminOauth)
}, 15000)

afterAll(() => mongoose.disconnect())

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections()

  for (const collection of collections) {
    await collection.deleteMany({})
  }
})

describe('comments', () => {
  const itemId = mongoose.Types.ObjectId()

  test('POST 400 /api/projects/comments/:_id', async () => {
    const { _id } = await createSeedProject(JWT)
    const payload = {}
    return supertest(app)
      .post(`/api/projects/comments/${_id}`)
      .set('Authorization', `Bearer ${JWT}`)
      .send(payload)
      .expect(400)
  })

  test('POST /api/projects/comments/:_id', async () => {
    const { _id } = await createSeedProject(JWT)
    const payload = {
      comment: `${crypto.randomBytes(10).toString('hex')}`,
      item: itemId,
    }
    return supertest(app)
      .post(`/api/projects/comments/${_id}`)
      .set('Authorization', `Bearer ${JWT}`)
      .send(payload)
      .expect(200)
      .then((res) => {
        expect(res.body.data).toBeDefined()
        expect(res.body.count).toBeDefined()
        expect(res.body.limit).toBeDefined()
        expect(res.body.pageCount).toBeDefined()
        expect(res.body.total).toBeDefined()
      })
  })
  test('GET /api/projects/comments/:_id', async () => {
    const { _id } = await createSeedProject(JWT)
    return supertest(app)
      .get(`/api/projects/comments/${_id}`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)
      .then((res) => {
        expect(res.body.data.length).toBeDefined()
        expect(res.body.count).toBeDefined()
        expect(res.body.limit).toBeDefined()
        expect(res.body.pageCount).toBeDefined()
        expect(res.body.total).toBeDefined()
      })
  })
})
