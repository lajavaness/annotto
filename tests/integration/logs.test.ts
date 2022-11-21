import express from 'express'
import mongoose from 'mongoose'
import supertest from 'supertest'
import { Log } from '../../src/db/models/logs'
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

describe('logs', () => {
  test('GET /api/projects/logs/:_id', async () => {
    const { _id } = await createSeedProject(JWT)
    return supertest(app)
      .get(`/api/projects/logs/${_id}`)
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

  test('GET /api/projects/logs/:_id?itemId=X Annotate creates logs', async () => {
    const { _id } = await createSeedProject(JWT)

    const itemId = await supertest(app)
      .get(`/api/projects/${_id}/items/next`)
      .set('Authorization', `Bearer ${JWT}`)
      .then((res) => res.body._id)

    const payload = {
      annotations: [
        {
          value: 'bbox_name',
          zone: [
            { x: 0.1, y: 0.1 },
            { x: 0.2, y: 0.2 },
            { x: 0.3, y: 0.3 },
          ],
        },
      ],
    }

    const secondPayload = {
      annotations: [
        {
          value: 'bbox_skill',
          zone: [
            { x: 0.1, y: 0.1 },
            { x: 0.2, y: 0.2 },
            { x: 0.3, y: 0.3 },
          ],
        },
      ],
    }

    await supertest(app)
      .post(`/api/projects/${_id}/items/${itemId}/annotate`)
      .set('Authorization', `Bearer ${JWT}`)
      .send(payload)

    await supertest(app)
      .post(`/api/projects/${_id}/items/${itemId}/annotate`)
      .set('Authorization', `Bearer ${JWT}`)
      .send(secondPayload)

    // eslint-disable-next-line no-promise-executor-return
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return supertest(app)
      .get(`/api/projects/logs/${_id}?itemId=${itemId}`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)
      .then((res) => {
        expect(res.body.data.length).toBeDefined()
        expect(res.body.count).toBeDefined()
        expect(res.body.limit).toBeDefined()
        expect(res.body.pageCount).toBeDefined()
        expect(res.body.total).toBeDefined()

        expect(res.body.data).toHaveLength(3)
        expect(
          (<Log[]>res.body.data).find((log) => log.annotations.length === 1 && log.type === 'annotation-add')
        ).toBeTruthy()
        expect(
          (<Log[]>res.body.data).find((log) => log.annotations.length === 1 && log.type === 'annotation-remove')
        ).toBeTruthy()
        expect(
          (<Log[]>res.body.data).find((log) => log.annotations.length === 1 && log.type === 'annotation-add')
        ).toBeTruthy()
      })
  })

  test('GET /api/projects/logs/:_id?itemId=X Annotate with relations creates logs', async () => {
    const { _id } = await createSeedProject(JWT, DEMOS[2])
    const payload = {
      annotations: [
        {
          value: 'skill',
          ner: { start: 0, end: 10 },
        },
        {
          value: 'formation',
          ner: { start: 15, end: 20 },
        },
      ],
      entitiesRelations: [
        {
          src: {
            value: 'skill',
            ner: { start: 0, end: 10 },
          },
          dest: {
            value: 'formation',
            ner: { start: 15, end: 20 },
          },
          value: 'is_from',
        },
        {
          src: {
            value: 'formation',
            ner: { start: 15, end: 20 },
          },
          dest: {
            value: 'skill',
            ner: { start: 0, end: 10 },
          },
          value: 'belongs_to',
        },
        {
          src: {
            value: 'Exp',
            ner: { start: 30, end: 40 },
          },
          dest: {
            value: 'formation',
            ner: { start: 40, end: 50 },
          },
          value: 'is_unit',
        },
      ],
    }

    const secondPayload = {
      annotations: [
        {
          value: 'formation',
          ner: { start: 0, end: 10 },
        },
        {
          value: 'skill',
          ner: { start: 15, end: 20 },
        },
      ],
      entitiesRelations: [
        {
          src: {
            value: 'formation',
            ner: { start: 0, end: 10 },
          },
          dest: {
            value: 'skill',
            ner: { start: 15, end: 20 },
          },
          value: 'is_from',
        },
        {
          src: {
            value: 'skill',
            ner: { start: 15, end: 20 },
          },
          dest: {
            value: 'formation',
            ner: { start: 0, end: 10 },
          },
          value: 'belongs_to',
        },
      ],
    }

    const itemId = await supertest(app)
      .get(`/api/projects/${_id}/items/next`)
      .set('Authorization', `Bearer ${JWT}`)
      .then((res) => res.body._id)

    await supertest(app)
      .post(`/api/projects/${_id}/items/${itemId}/annotate`)
      .set('Authorization', `Bearer ${JWT}`)
      .send(payload)
      .expect(200)

    await supertest(app)
      .post(`/api/projects/${_id}/items/${itemId}/annotate`)
      .set('Authorization', `Bearer ${JWT}`)
      .send(secondPayload)
      .expect(200)

    const res = await supertest(app)
      .get(`/api/projects/logs/${_id}?itemId=${itemId}`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)

    expect(res.body.data.length).toBeDefined()
    expect(res.body.count).toBeDefined()
    expect(res.body.limit).toBeDefined()
    expect(res.body.pageCount).toBeDefined()
    expect(res.body.total).toBeDefined()

    expect(res.body.data).toHaveLength(6)

    const relationRemovedLog = (<Log[]>res.body.data).filter((obj) => {
      return obj.type === 'relation-remove'
    })
    const relationAddLog = (<Log[]>res.body.data).filter((obj) => {
      return obj.type === 'relation-add'
    })

    const annotationRemoveLog = (<Log[]>res.body.data).filter((obj) => {
      return obj.type === 'annotation-remove'
    })
    const annotationAddLog = (<Log[]>res.body.data).filter((obj) => {
      return obj.type === 'annotation-add'
    })

    expect(relationRemovedLog).toHaveLength(1)
    expect(relationAddLog).toHaveLength(2)
    expect(annotationRemoveLog).toHaveLength(1)
    expect(annotationAddLog).toHaveLength(2)

    const { body: item } = await supertest(app)
      .get(`/api/projects/${_id}/items/${itemId}`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)

    expect(item).toHaveProperty('logCount', 6)
  })
})
