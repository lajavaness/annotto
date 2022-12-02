import express from 'express'
import { promises as fsPromises } from 'fs'
import mongoose from 'mongoose'
import supertest from 'supertest'
import { Item } from '../../src/db/models/items'
import createServer from '../../src/__tests__/create-server'
import getToken from '../../src/__tests__/get-oauth-token'
import { adminOauth } from './seed/seed'
import config from '../../config'

let JWT: string
let app: express.Application

jest.setTimeout(30000)

const DEMOS = [
  {
    // 0
    config: `${process.cwd()}/statics/demo/demo-zone+ocr/config.json`,
    items: `${process.cwd()}/statics/demo/demo-zone+ocr/items.jsonlines`,
    predictions: `${process.cwd()}/statics/demo/demo-zone+ocr/predictions.jsonlines`,
  },
  {
    // 1
    config: `${process.cwd()}/statics/demo/demo-zone+classification-public-image/config.json`,
    items: `${process.cwd()}/statics/demo/demo-zone+classification-public-image/items.jsonlines`,
    predictions: `${process.cwd()}/statics/demo/demo-zone+classification-public-image/predictions.jsonlines`,
  },
  {
    // 2
    config: `${process.cwd()}/statics/demo/demo-nerWithRelations/config.json`,
    items: `${process.cwd()}/statics/demo/demo-nerWithRelations/items.jsonlines`,
    predictions: `${process.cwd()}/statics/demo/demo-nerWithRelations/predictions.jsonlines`,
  },
  {
    // 3
    config: `${process.cwd()}/statics/demo/demo-classification-text-1/config.json`,
    items: `${process.cwd()}/statics/demo/demo-classification-text-1/items.jsonlines`,
    predictions: `${process.cwd()}/statics/demo/demo-classification-text-1/predictions.jsonlines`,
  },
  {
    // 4
    config: `${process.cwd()}/statics/demo/demo-ner+classification-text/config.json`,
    items: `${process.cwd()}/statics/demo/demo-ner+classification-text/items.jsonlines`,
    predictions: `${process.cwd()}/statics/demo/demo-ner+classification-text/predictions.jsonlines`,
  },
  {
    // 5
    config: `${process.cwd()}/statics/demo/demo-zone+classification-public-image/config.json`,
    items: `${process.cwd()}/statics/demo/demo-zone+classification-public-image/items.jsonlines`,
    predictions: `${process.cwd()}/statics/demo/demo-zone+classification-public-image/predictions.jsonlines`,
  },
  {
    // 6
    config: `${process.cwd()}/statics/demo/demo-classification-public-image/config.json`,
    items: `${process.cwd()}/statics/demo/demo-classification-public-image/items.jsonlines`,
    itemsUpdate: `${process.cwd()}/statics/demo/demo-classification-public-image/items.update.jsonlines`,
  },
]

const s3SeedProject = {
  config: `${process.cwd()}/tests/integration/seed/s3/config.json`,
  items: `${process.cwd()}/tests/integration/seed/s3/items.jsonlines`,
}

const createSeedProject = (
  jwt: string,
  project: { config: string; items: string; predictions?: string; itemUpdate?: string } = DEMOS[0]
) => {
  return supertest(app)
    .post('/api/projects/import')
    .set('Authorization', `Bearer ${jwt}`)
    .attach('project', project.config)
    .attach('items', project.items)
    .attach('predictions', project.predictions || '')
    .expect(200)
    .then((res) => {
      if (!res.body.project) {
        throw new Error(JSON.stringify(res.body, null, 2))
      }
      return res.body.project
    })
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

describe('items', () => {
  test('GET /projects/:_id/items', async () => {
    const { _id } = await createSeedProject(JWT)

    return supertest(app)
      .get(`/api/projects/${_id}/items`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)
      .then((res) => {
        expect(res.body.data.length).toBeGreaterThan(0)
        expect(res.body.count).toBeDefined()
        expect(res.body.limit).toBeDefined()
        expect(res.body.pageCount).toBeDefined()
        expect(res.body.total).toBeDefined()
      })
  })

  test('PUT /projects/:_id/items', async () => {
    const { _id } = await createSeedProject(JWT)

    const itemId = await supertest(app)
      .get(`/api/projects/${_id}/items`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)
      .then((res) => res.body.data[0]._id)

    const payload = {
      tags: ['FOO'],
    }

    return supertest(app)
      .put(`/api/projects/${_id}/items/${itemId}`)
      .set('Authorization', `Bearer ${JWT}`)
      .send(payload)
      .expect(200)
      .then((res) => res.body)
      .then((item) => expect(item.tags).toEqual(['FOO']))
  })

  test('GET /projects/:_id/items/:itemId', async () => {
    const { _id } = await createSeedProject(JWT)
    const itemId = await supertest(app)
      .get(`/api/projects/${_id}/items`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)
      .then((res) => res.body.data[0]._id)

    return supertest(app)
      .get(`/api/projects/${_id}/items/${itemId}`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)
      .then((res) => {
        expect(res.body._id).toBeDefined()
      })
  })

  test('GET /projects/:_id/items/by-uuid/:itemUuid', async () => {
    const { _id } = await createSeedProject(JWT)
    const itemUuid = 'd7bb0128-c478-4f56-a00a-601ee6bd0849' // based on CONFIG[0] items.jsonlines

    return supertest(app)
      .get(`/api/projects/${_id}/items/by-uuid/${itemUuid}`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)
      .then((res) => {
        expect(res.body._id).toBeDefined()
      })
  })

  test('GET /projects/:_id/items/next Get next two times, expecting a new item on second call', async () => {
    const { _id } = await createSeedProject(JWT)

    const itemId = await supertest(app)
      .get(`/api/projects/${_id}/items/next`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)
      .then((res) => res.body._id)

    await supertest(app)
      .get(`/api/projects/${_id}/items/next`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)
      .then((res) => {
        expect(res.body._id).not.toEqual(itemId)
      })
  })

  test('GET /projects/:_id/items/next Get next on a project with S3 config', async () => {
    const { _id } = await createSeedProject(JWT, s3SeedProject)

    // assert that S3 mock value in __mocks__ was correctly formatted
    return supertest(app)
      .get(`/api/projects/${_id}/items/next`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)
      .then((res) => res.body)
      .then((item) => expect(item.data.url).toBe('data:FOO;base64,QkFS'))
  })

  test('GET /projects/:_id/items/_id Get by id on a project with S3 config', async () => {
    const { _id } = await createSeedProject(JWT, s3SeedProject)

    // assert that S3 mock value in __mocks__ was correctly formated
    const itemId = await supertest(app)
      .get(`/api/projects/${_id}/items`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)
      .then((res) => res.body.data[0]._id)

    return supertest(app)
      .get(`/api/projects/${_id}/items/${itemId}`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)
      .then((res) => res.body)
      .then((item) => expect(item.data.url).toBe('data:FOO;base64,QkFS'))
  })

  // skip until highlight API is back...
  test.skip('POST /projects/:projectId/items/:itemId/annotate Annotate with empty payload doesnt mark item as annotated', async () => {
    const { _id } = await createSeedProject(JWT)

    const payload = { annotations: <[]>[] }

    const itemToAnnotateId = await supertest(app)
      .get(`/api/projects/${_id}/items/next`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)
      .then((res) => res.body._id)

    await supertest(app)
      .post(`/api/projects/${_id}/items/${itemToAnnotateId}/annotate`)
      .set('Authorization', `Bearer ${JWT}`)
      .send(payload)
      .expect(200)

    return supertest(app)
      .get(`/api/projects/${_id}/items/${itemToAnnotateId}`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)
      .then((res) => expect(res.body.annotated).toBe(false))
  })

  // skip until hightights API is back...
  test.skip('POST /projects/:_id/items/:itemId/annotate Annotate Top level category', async () => {
    const { _id } = await createSeedProject(JWT)

    const payload = {
      annotations: [
        {
          value: 'bbox_name',
          ner: { start: 0, end: 5 },
        },
      ],
    }

    const itemToAnnotateId = await supertest(app)
      .get(`/api/projects/${_id}/items/next`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)
      .then((res) => res.body._id)

    return supertest(app)
      .post(`/api/projects/${_id}/items/${itemToAnnotateId}/annotate`)
      .set('Authorization', `Bearer ${JWT}`)
      .send(payload)
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined()
      })
  })

  // skip until highlights API is back...
  test.skip('POST /projects/:_id/items/:itemId/annotate Annotate Top level category and child', async () => {
    const { _id } = await createSeedProject(JWT, DEMOS[3])
    const payload = {
      annotations: [
        {
          value: 'Famille',
        },
        {
          value: 'Enfant',
        },
      ],
    }

    const itemToAnnotateId = await supertest(app)
      .get(`/api/projects/${_id}/items/next`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)
      .then((res) => res.body._id)

    return supertest(app)
      .post(`/api/projects/${_id}/items/${itemToAnnotateId}/annotate`)
      .set('Authorization', `Bearer ${JWT}`)
      .send(payload)
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined()
      })
  })

  describe('text annotation', () => {
    test('POST /projects/import Create project with Text task', async () => {
      const { _id } = await createSeedProject(JWT, DEMOS[0])

      // parsing predictions jsonlines used on project creation
      const projectPredictions = (await fsPromises.readFile(DEMOS[0].predictions || ''))
        .toString()
        .split('\n')
        .map((row) => JSON.parse(row))

      const item = await supertest(app)
        .get(`/api/projects/${_id}/items/next`)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(200)
        .then((res) => res.body)

      const itemPredictions = projectPredictions.find((prediction) => prediction.uuid === item.uuid)
      // check that item.raw predictions length is correct, .keys formating is tested in mapPredictionLine test
      expect(itemPredictions.annotations).toEqual(item.predictions.raw)
    })

    test('POST /projects/:_id/items/:itemId/annotate Annotate item with text', async () => {
      const { _id } = await createSeedProject(JWT, DEMOS[0])
      const payload = {
        annotations: [
          {
            value: 'textInput1',
            text: 'Hello',
          },
        ],
      }

      const itemToAnnotateId = await supertest(app)
        .get(`/api/projects/${_id}/items/next`)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(200)
        .then((res) => res.body._id)

      await supertest(app)
        .post(`/api/projects/${_id}/items/${itemToAnnotateId}/annotate`)
        .set('Authorization', `Bearer ${JWT}`)
        .send(payload)
        .expect(200)

      const item = await supertest(app)
        .get(`/api/projects/${_id}/items/${itemToAnnotateId}`)
        .set('Authorization', `Bearer ${JWT}`)
        .then((res) => res.body)

      expect(item.annotated).toBe(true)
      expect(item.annotatedBy).toEqual(['admin@test.com'])
      expect(item.annotationValues).toEqual([payload.annotations[0].value])
      expect(item.logCount).toBe(1)

      const annotations = await supertest(app)
        .get(`/api/projects/${_id}/items/${itemToAnnotateId}/annotations`)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(200)
        .then((res) => res.body)

      expect(annotations).toHaveLength(1)
      expect(annotations[0].value).toBe(payload.annotations[0].value)
      expect(annotations[0].text).toBe(payload.annotations[0].text)
    })

    test('404 POST /projects/:_id/items/:itemId/annotate Annotate item with text with non existing task', async () => {
      const { _id } = await createSeedProject(JWT, DEMOS[0])
      const payload = {
        annotations: [
          {
            value: 'FOO',
            text: 'Hello',
          },
        ],
      }

      const itemToAnnotateId = await supertest(app)
        .get(`/api/projects/${_id}/items/next`)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(200)
        .then((res) => res.body._id)

      await supertest(app)
        .post(`/api/projects/${_id}/items/${itemToAnnotateId}/annotate`)
        .set('Authorization', `Bearer ${JWT}`)
        .send(payload)
        .expect(404)
    })
  })
  describe('entities relations', () => {
    test('POST /projects/:_id/items/:itemId/annotate Annotate NER item with entities relations', async () => {
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
        ],
      }

      const itemToAnnotateId = await supertest(app)
        .get(`/api/projects/${_id}/items/next`)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(200)
        .then((res) => res.body._id)

      await supertest(app)
        .post(`/api/projects/${_id}/items/${itemToAnnotateId}/annotate`)
        .set('Authorization', `Bearer ${JWT}`)
        .send(payload)
        .expect(200)

      const item = await supertest(app)
        .get(`/api/projects/${_id}/items/${itemToAnnotateId}`)
        .set('Authorization', `Bearer ${JWT}`)
        .then((res) => res.body)

      expect(item.entitiesRelations).toEqual(payload.entitiesRelations)
    })

    test('POST /projects/:_id/items/:itemId/annotate re-annotate NER item with entities relations', async () => {
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
        ],
      }

      const itemToAnnotateId = await supertest(app)
        .get(`/api/projects/${_id}/items/next`)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(200)
        .then((res) => res.body._id)

      await supertest(app)
        .post(`/api/projects/${_id}/items/${itemToAnnotateId}/annotate`)
        .set('Authorization', `Bearer ${JWT}`)
        .send(payload)
        .expect(200)

      const secondPayload = {
        annotations: [
          {
            value: 'skill',
            ner: { start: 0, end: 10 },
          },
          {
            value: 'Exp',
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
              value: 'Exp',
              ner: { start: 15, end: 20 },
            },
            value: 'is_from',
          },
          {
            src: {
              value: 'Exp',
              ner: { start: 15, end: 20 },
            },
            dest: {
              value: 'skill',
              ner: { start: 0, end: 10 },
            },
            value: 'belongs_to',
          },
        ],
      }

      await supertest(app)
        .post(`/api/projects/${_id}/items/${itemToAnnotateId}/annotate`)
        .set('Authorization', `Bearer ${JWT}`)
        .send(secondPayload)
        .expect(200)

      const item = await supertest(app)
        .get(`/api/projects/${_id}/items/${itemToAnnotateId}`)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(200)
        .then((res) => res.body)

      expect(item.entitiesRelations).toEqual(secondPayload.entitiesRelations)
    })

    test('POST /projects/:_id/items/:itemId/annotate POST with empty annotations AND relations payload keep item non annotated', async () => {
      const { _id } = await createSeedProject(JWT, DEMOS[2])
      const itemToAnnotateId = await supertest(app)
        .get(`/api/projects/${_id}/items/next`)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(200)
        .then((res) => res.body._id)

      const payload = {
        annotations: <[]>[],
        entitiesRelations: <[]>[],
      }

      await supertest(app)
        .post(`/api/projects/${_id}/items/${itemToAnnotateId}/annotate`)
        .set('Authorization', `Bearer ${JWT}`)
        .send(payload)
        .expect(200)

      const item = await supertest(app)
        .get(`/api/projects/${_id}/items/${itemToAnnotateId}`)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(200)
        .then((res) => res.body)

      expect(item.annotated).toBe(false)
    })

    test('POST /projects/:_id/items/:itemId/annotate POST 400 for payload with only relations', async () => {
      const { _id } = await createSeedProject(JWT, DEMOS[2])
      const itemToAnnotateId: Item[] = await supertest(app)
        .get(`/api/projects/${_id}/items/next`)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(200)
        .then((res) => res.body._id)

      const payload = {
        annotations: <[]>[],
        entitiesRelations: [
          {
            src: {
              value: 'Exp',
              ner: { start: 15, end: 20 },
            },
            dest: {
              value: 'skill',
              ner: { start: 0, end: 10 },
            },
            value: 'belongs_to',
          },
        ],
      }

      await supertest(app)
        .post(`/api/projects/${_id}/items/${itemToAnnotateId}/annotate`)
        .set('Authorization', `Bearer ${JWT}`)
        .send(payload)
        .expect(400)

      return supertest(app).get(`/api/projects/${_id}/items/${itemToAnnotateId}`).set('Authorization', `Bearer ${JWT}`)
    })

    test('POST /projects/:_id/items/:itemId/annotate 400 Annotate NER item with entities relations with wrong classif', async () => {
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
        ],
      }

      const itemToAnnotateId = await supertest(app)
        .get(`/api/projects/${_id}/items/next`)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(200)
        .then((res) => res.body._id)

      return supertest(app)
        .post(`/api/projects/${_id}/items/${itemToAnnotateId}/annotate`)
        .set('Authorization', `Bearer ${JWT}`)
        .send(payload)
        .expect(400)
    })

    test('POST /projects/:_id/items/:itemId/annotate 400 Annotate NER item with entities relations with wrong relation label', async () => {
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
            value: 'foo',
          },
        ],
      }

      const itemToAnnotateId = await supertest(app)
        .get(`/api/projects/${_id}/items/next`)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(200)
        .then((res) => res.body._id)

      return supertest(app)
        .post(`/api/projects/${_id}/items/${itemToAnnotateId}/annotate`)
        .set('Authorization', `Bearer ${JWT}`)
        .send(payload)
        .expect(400)
    })

    test('POST /projects/:_id/items/:itemId/annotate 400 Annotate NER item with too few entities relations ( lower than min )', async () => {
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
        ],
      }

      const itemToAnnotateId = await supertest(app)
        .get(`/api/projects/${_id}/items/next`)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(200)
        .then((res) => res.body._id)

      return supertest(app)
        .post(`/api/projects/${_id}/items/${itemToAnnotateId}/annotate`)
        .set('Authorization', `Bearer ${JWT}`)
        .send(payload)
        .expect(400)
        .then((res) => expect(res.body.message).toBe('TOO_FEW_RELATIONS_ANNOTATED'))
    })

    test('POST /projects/:_id/items/:itemId/annotate 400 Annotate NER item with too many entities relations ( higher than max )', async () => {
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
              value: 'skill',
              ner: { start: 0, end: 10 },
            },
            dest: {
              value: 'formation',
              ner: { start: 15, end: 20 },
            },
            value: 'belongs_to',
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
            value: 'is_from',
          },
        ],
      }

      const itemToAnnotateId = await supertest(app)
        .get(`/api/projects/${_id}/items/next`)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(200)
        .then((res) => res.body._id)

      return supertest(app)
        .post(`/api/projects/${_id}/items/${itemToAnnotateId}/annotate`)
        .set('Authorization', `Bearer ${JWT}`)
        .send(payload)
        .expect(400)
        .then((res) => expect(res.body.message).toBe('TOO_MANY_RELATIONS_ANNOTATED'))
    })
  })

  test('POST /projects/:_id/items/:itemId/annotate POST with empty annotations does not remove previous annotations', async () => {
    const { _id } = await createSeedProject(JWT, DEMOS[2])
    const itemToAnnotateId = await supertest(app)
      .get(`/api/projects/${_id}/items/next`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)
      .then((res) => res.body._id)

    const payload = {
      annotations: [
        {
          value: 'skill',
          ner: { start: 0, end: 10 },
        },
      ],
    }

    await supertest(app)
      .post(`/api/projects/${_id}/items/${itemToAnnotateId}/annotate`)
      .set('Authorization', `Bearer ${JWT}`)
      .send(payload)
      .expect(200)

    const secondPayload = {
      annotations: <[]>[],
    }

    await supertest(app)
      .post(`/api/projects/${_id}/items/${itemToAnnotateId}/annotate`)
      .set('Authorization', `Bearer ${JWT}`)
      .send(secondPayload)
      .expect(200)

    const item = await supertest(app)
      .get(`/api/projects/${_id}/items/${itemToAnnotateId}`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)
      .then((res) => res.body)

    const annotations = await supertest(app)
      .get(`/api/projects/${_id}/items/${itemToAnnotateId}/annotations`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)
      .then((res) => res.body)

    expect(item.annotationValues).toHaveLength(1)
    expect(item.annotated).toBe(true)
    expect(annotations).toHaveLength(1)
    expect(annotations[0].value).toBe('skill')
  })

  // skip until highlights API is back...
  test.skip('POST /projects/:_id/items/:itemId/annotate TEST 400 Missing parent category', async () => {
    const { _id } = await createSeedProject(JWT, DEMOS[3])
    const payload = {
      annotations: [
        {
          value: 'Enfant',
        },
      ],
    }
    const itemToAnnotateId = await supertest(app)
      .get(`/api/projects/${_id}/items/next`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)
      .then((res) => res.body._id)

    return supertest(app)
      .post(`/api/projects/${_id}/items/${itemToAnnotateId}/annotate`)
      .set('Authorization', `Bearer ${JWT}`)
      .send(payload)
      .expect(400)
      .then((res) => expect(res.body.infos.includes('cannot be annotated without its parent')))
  })

  test('GET /projects/:_id/items/:itemId/annotations', async () => {
    const { _id } = await createSeedProject(JWT)
    const itemToAnnotateId = await supertest(app)
      .get(`/api/projects/${_id}/items/next`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)
      .then((res) => res.body._id)

    return supertest(app)
      .get(`/api/projects/${_id}/items/${itemToAnnotateId}/annotations`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined()
      })
  })

  test('GET /projects/:_id/tasks', async () => {
    const { _id } = await createSeedProject(JWT)

    return supertest(app).get(`/api/projects/${_id}/tasks`).set('Authorization', `Bearer ${JWT}`).expect(200)
  })

  test('GET /projects/:_id/items with filter', async () => {
    const { _id } = await createSeedProject(JWT)
    const payload = [
      {
        operator: 'equal',
        field: 'annotated',
        value: false,
      },
    ]
    const filter = await supertest(app)
      .post(`/api/projects/${_id}/filter`)
      .set('Authorization', `Bearer ${JWT}`)
      .send(payload)
      .then((res) => res.body)

    return supertest(app)
      .get(`/api/projects/${_id}/items?filterId=${filter._id}`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)
      .then((res) => expect(res.body.data).toHaveLength(3))
  })

  test('GET /projects/:_id/items with filter that does not exist', async () => {
    const { _id } = await createSeedProject(JWT)

    return supertest(app)
      .get(`/api/projects/${_id}/items?filterId=5ff86a1ba95e76001cbc1520`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(404)
  })

  test('GET /projects/:_id/items withouth an objectId', async () => {
    const { _id } = await createSeedProject(JWT)

    return supertest(app)
      .get(`/api/projects/${_id}/items?filterId=123`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(500)
  })

  test('GET /projects/:_id/items/next with filter', async () => {
    const { _id } = await createSeedProject(JWT)
    const payload = [
      {
        operator: 'equal',
        field: 'annotated',
        value: false,
      },
    ]
    const filter = await supertest(app)
      .post(`/api/projects/${_id}/filter`)
      .set('Authorization', `Bearer ${JWT}`)
      .send(payload)
      .then((res) => res.body)

    return supertest(app)
      .get(`/api/projects/${_id}/items/next?filterId=${filter._id}`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)
      .then((res) => expect(res.body._id).toBeTruthy())
  })

  test('GET 404 /projects/:_id/items/next with non existing filter', async () => {
    const { _id } = await createSeedProject(JWT)

    return supertest(app)
      .get(`/api/projects/${_id}/items/next?filterId=${mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(404)
  })

  test('GET /projects/:_id/items/next Apply form filter with FOO as annotator, expecting empty result', async () => {
    const { _id } = await createSeedProject(JWT)

    const itemId = await supertest(app)
      .get(`/api/projects/${_id}/items/next`)
      .set('Authorization', `Bearer ${JWT}`)
      .then((res) => res.body._id)

    await supertest(app)
      .post(`/api/projects/${_id}/items/${itemId}/annotate`)
      .set('Authorization', `Bearer ${JWT}`)
      .send([
        {
          value: 'bbox_name',
          zone: [
            { x: 0.1212, y: 0.3434 },
            { x: 0.232323, y: 0.21212 },
            { x: 0.232323, y: 0.21112 },
          ],
        },
      ])

    const payload = [
      {
        operator: 'containsAny',
        field: 'annotatedBy',
        value: ['FOO@lajavaness.com'],
      },
    ]

    const filterId = await supertest(app)
      .post(`/api/projects/${_id}/filter`)
      .set('Authorization', `Bearer ${JWT}`)
      .send(payload)
      .then((res) => res.body._id)

    return supertest(app)
      .get(`/api/projects/${_id}/items/next?filterId=${filterId}`)
      .set('Authorization', `Bearer ${JWT}`)
      .then((res) => expect(res.body).toEqual({}))
  })

  test('GET /projects/:_id/items/next Apply form filter with Seed as annotator, expecting one result', async () => {
    const { _id } = await createSeedProject(JWT)

    const itemId = await supertest(app)
      .get(`/api/projects/${_id}/items/next`)
      .set('Authorization', `Bearer ${JWT}`)
      .then((res) => res.body._id)

    await supertest(app)
      .post(`/api/projects/${_id}/items/${itemId}/annotate`)
      .set('Authorization', `Bearer ${JWT}`)
      .send({
        annotations: [
          {
            value: 'bbox_name',
            zone: [
              { x: 0.1212, y: 0.3434 },
              { x: 0.232323, y: 0.21212 },
              { x: 0.232323, y: 0.21112 },
            ],
          },
        ],
      })

    const payload = [
      {
        operator: 'containsAny',
        field: 'annotatedBy',
        value: ['admin@test.com'],
      },
    ]

    const filterId = await supertest(app)
      .post(`/api/projects/${_id}/filter`)
      .set('Authorization', `Bearer ${JWT}`)
      .send(payload)
      .then((res) => res.body._id)

    return supertest(app)
      .get(`/api/projects/${_id}/items/next?filterId=${filterId}`)
      .set('Authorization', `Bearer ${JWT}`)
      .then((res) => {
        expect(res.body.annotatedBy).toEqual(['admin@test.com'])
      })
  })

  test('GET /projects/:_id/items/next Apply "JSON UI" filter ( with one OR condition ) with FOO as annotator, expecting no result', async () => {
    const { _id } = await createSeedProject(JWT)

    const itemId = await supertest(app)
      .get(`/api/projects/${_id}/items/next`)
      .set('Authorization', `Bearer ${JWT}`)
      .then((res) => res.body._id)

    await supertest(app)
      .post(`/api/projects/${_id}/items/${itemId}/annotate`)
      .set('Authorization', `Bearer ${JWT}`)
      .send([
        {
          value: 'bbox_name',
          zone: [
            { x: 0.1212, y: 0.3434 },
            { x: 0.232323, y: 0.21212 },
            { x: 0.232323, y: 0.21112 },
          ],
        },
      ])

    const payload = [
      {
        or: [
          {
            operator: 'containsAny',
            field: 'annotatedBy',
            value: ['foo@lajavaness.com'],
          },
        ],
      },
    ]

    const filterId = await supertest(app)
      .post(`/api/projects/${_id}/filter`)
      .set('Authorization', `Bearer ${JWT}`)
      .send(payload)
      .then((res) => res.body._id)

    return supertest(app)
      .get(`/api/projects/${_id}/items/next?filterId=${filterId}`)
      .set('Authorization', `Bearer ${JWT}`)
      .then((res) => expect(res.body).toEqual({}))
  })

  test('GET /projects/:_id/items/next Apply "JSON UI" filter ( with one OR condition ) with Seed as annotator, expecting one result', async () => {
    const { _id } = await createSeedProject(JWT)

    const itemId = await supertest(app)
      .get(`/api/projects/${_id}/items/next`)
      .set('Authorization', `Bearer ${JWT}`)
      .then((res) => res.body._id)

    await supertest(app)
      .post(`/api/projects/${_id}/items/${itemId}/annotate`)
      .set('Authorization', `Bearer ${JWT}`)
      .send({
        annotations: [
          {
            value: 'bbox_name',
            zone: [
              { x: 0.1212, y: 0.3434 },
              { x: 0.232323, y: 0.21212 },
              { x: 0.232323, y: 0.21112 },
            ],
          },
        ],
      })

    const payload = [
      {
        or: [
          {
            operator: 'containsAny',
            field: 'annotatedBy',
            value: ['admin@test.com'],
          },
        ],
      },
    ]

    const filterId = await supertest(app)
      .post(`/api/projects/${_id}/filter`)
      .set('Authorization', `Bearer ${JWT}`)
      .send(payload)
      .then((res) => res.body._id)

    return supertest(app)
      .get(`/api/projects/${_id}/items/next?filterId=${filterId}`)
      .set('Authorization', `Bearer ${JWT}`)
      .then((res) => expect(res.body.annotatedBy).toEqual(['admin@test.com']))
  })

  test('GET /projects/:_id/items/next Apply "JSON UI" filter ( with one OR condition and one AND condition ) with Admin as annotator, expecting one result', async () => {
    const { _id } = await createSeedProject(JWT)

    const itemId = await supertest(app)
      .get(`/api/projects/${_id}/items/next`)
      .set('Authorization', `Bearer ${JWT}`)
      .then((res) => res.body._id)

    await supertest(app)
      .post(`/api/projects/${_id}/items/${itemId}/annotate`)
      .set('Authorization', `Bearer ${JWT}`)
      .send({
        annotations: [
          {
            value: 'bbox_name',
            zone: [
              { x: 0.1212, y: 0.3434 },
              { x: 0.232323, y: 0.21212 },
              { x: 0.232323, y: 0.21112 },
            ],
          },
        ],
      })

    const payload = [
      {
        operator: 'containsAny',
        field: 'annotatedBy',
        value: ['FOO@lajavaness.com'],
      },
      {
        or: [
          {
            operator: 'containsAny',
            field: 'annotatedBy',
            value: ['admin@test.com'],
          },
        ],
      },
    ]

    const filterId = await supertest(app)
      .post(`/api/projects/${_id}/filter`)
      .set('Authorization', `Bearer ${JWT}`)
      .send(payload)
      .then((res) => res.body._id)

    return supertest(app)
      .get(`/api/projects/${_id}/items/next?filterId=${filterId}`)
      .set('Authorization', `Bearer ${JWT}`)
      .then((res) => {
        expect(res.body.annotatedBy).toEqual(['admin@test.com'])
      })
  })

  test('POST /projects/:_id/items/upload Upload more public image items', async () => {
    const { _id } = await createSeedProject(JWT)

    return supertest(app)
      .post(`/api/projects/${_id}/items/upload`)
      .attach('items', DEMOS[6].items)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)
  })

  test('POST /projects/:_id/items/upload?isUpdate=true Updating items should keep their non-overwritten values', async () => {
    const { _id } = await createSeedProject(JWT, DEMOS[6])

    await supertest(app)
      .post(`/api/projects/${_id}/items/upload?isUpdate=true`)
      .attach('items', DEMOS[6].itemsUpdate || '') // update does not contain the tags array
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)

    const {
      body: { data: items },
    }: {
      body: { data: Item[] }
    } = await supertest(app).get(`/api/projects/${_id}/items`).set('Authorization', `Bearer ${JWT}`).expect(200)

    expect(items).toHaveProperty('length', 5)
    const item = items.find((i) => i.tags?.length > 0)
    expect(item).toBeDefined()
    expect(item).toHaveProperty('tags', ['tag1'])
  })
})