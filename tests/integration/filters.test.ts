import express from 'express'
import mongoose from 'mongoose'
import supertest from 'supertest'
import { Project } from '../../src/db/models/projects'
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

const createSeedProject = (jwt: string, project = DEMOS[0]): Promise<Project> => {
  return supertest(app)
    .post('/api/projects/import')
    .set('Authorization', `Bearer ${JWT}`)
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

describe('filters', () => {
  test('GET /projects/:_id/filter/operators', async () => {
    const { _id } = await createSeedProject(JWT)

    const resp = await supertest(app)
      .get(`/api/projects/${_id}/filter/operators`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)

    expect(resp.body).toEqual({
      fields: {
        annotated: {
          operators: ['equal'],
        },
        annotatedAt: {
          operators: ['range'],
        },
        annotatedBy: {
          operators: ['containsAny', 'containsAll'],
        },
        annotationValues: {
          operators: ['containsAny', 'containsAll', 'size'],
        },
        body: {
          operators: ['textContains'],
        },
        predictionScores: {
          operators: ['greaterThanAny', 'greaterThanAll', 'wrongPredictions'],
        },
        predictionValues: {
          operators: ['containsAny', 'containsAll', 'size'],
        },
        tags: {
          operators: ['containsAny', 'containsAll', 'size'],
        },
        uuid: {
          operators: ['similarTo'],
        },
      },
      operators: [
        {
          name: 'equal',
          param: {
            value: 'Boolean',
          },
        },
        {
          name: 'range',
          param: {
            value: {
              from: 'Date',
              to: 'Date',
            },
          },
        },
        {
          name: 'containsAny',
          param: {
            value: ['String'],
          },
        },
        {
          name: 'containsAll',
          param: {
            value: ['String'],
          },
        },
        {
          name: 'size',
          param: {
            value: 'Number',
          },
        },
        {
          name: 'similarTo',
          optionalParam: {
            limit: 'Number',
            neg_values: ['String'],
          },
          param: {
            value: 'String',
          },
        },
        {
          name: 'greaterThanAny',
          optionalParam: {
            threshold: 'Number',
          },
          param: {
            value: ['String'],
          },
        },
        {
          name: 'greaterThanAll',
          optionalParam: {
            threshold: 'Number',
          },
          param: {
            value: ['String'],
          },
        },
        {
          name: 'wrongPredictions',
          optionalParam: {
            threshold: 'Number',
          },
          param: {
            value: ['String'],
          },
        },
        {
          name: 'textContains',
          param: {
            value: 'String',
          },
        },
      ],
    })
  })

  test('POST 400 /projects/:_id/filter', async () => {
    const { _id } = await createSeedProject(JWT)
    const payload = {
      invalidField: <null>null,
    }

    return supertest(app)
      .post(`/api/projects/${_id}/filter`)
      .set('Authorization', `Bearer ${JWT}`)
      .send(payload)
      .expect(400)
  })
  test('POST 400 /projects/:_id/filter there is already a filter on project for user to update', async () => {
    const { _id } = await createSeedProject(JWT)
    const payload = [
      {
        operator: 'equal',
        field: 'annotated',
        value: true,
      },
    ]
    await supertest(app)
      .post(`/api/projects/${_id}/filter`)
      .set('Authorization', `Bearer ${JWT}`)
      .send(payload)
      .expect(200)

    await supertest(app)
      .post(`/api/projects/${_id}/filter`)
      .set('Authorization', `Bearer ${JWT}`)
      .send(payload)
      .expect(400)
  })

  test('PUT 400 /projects/:_id/filter', async () => {
    const { _id } = await createSeedProject(JWT)
    const payload = {
      invalidField: <null>null,
    }

    return supertest(app)
      .put(`/api/projects/${_id}/filter`)
      .set('Authorization', `Bearer ${JWT}`)
      .send(payload)
      .expect(400)
  })

  test('POST /projects/:_id/filter', async () => {
    const { _id } = await createSeedProject(JWT)
    const payload = [
      {
        operator: 'equal',
        field: 'annotated',
        value: true,
      },
    ]
    return supertest(app)
      .post(`/api/projects/${_id}/filter`)
      .set('Authorization', `Bearer ${JWT}`)
      .send(payload)
      .expect(200)
      .then((res) => {
        expect(res.body.user).toBeDefined()
        expect(res.body.project).toEqual(_id)
        expect(res.body.payload).toEqual(payload)
        expect(res.body.criteria).toBeDefined()
      })
  })
  test('GET /projects/:_id/filter', async () => {
    const { _id } = await createSeedProject(JWT)

    await supertest(app).get(`/api/projects/${_id}/filter`).set('Authorization', `Bearer ${JWT}`).expect(200)

    const payload = [
      {
        operator: 'equal',
        field: 'annotated',
        value: true,
      },
    ]
    await supertest(app).post(`/api/projects/${_id}/filter`).set('Authorization', `Bearer ${JWT}`).send(payload)

    return supertest(app).get(`/api/projects/${_id}/filter`).set('Authorization', `Bearer ${JWT}`).expect(200)
  })

  test('PUT /projects/:_id/filter', async () => {
    const { _id } = await createSeedProject(JWT)
    const payload = [
      {
        operator: 'equal',
        field: 'annotated',
        value: true,
      },
    ]
    await supertest(app).post(`/api/projects/${_id}/filter`).set('Authorization', `Bearer ${JWT}`).send(payload)

    const update = [
      {
        operator: 'equal',
        field: 'annotated',
        value: false,
      },
    ]

    await supertest(app)
      .put(`/api/projects/${_id}/filter`)
      .set('Authorization', `Bearer ${JWT}`)
      .send(update)
      .expect(200)

    return supertest(app)
      .get(`/api/projects/${_id}/filter`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)
      .then((res) => {
        expect(res.body.payload[0]).toEqual(update[0])
      })
  })
  test('PUT /projects/:_id/filter update existing filter with empty payload', async () => {
    const { _id } = await createSeedProject(JWT)
    const payload = [
      {
        operator: 'equal',
        field: 'annotated',
        value: true,
      },
    ]
    await supertest(app).post(`/api/projects/${_id}/filter`).set('Authorization', `Bearer ${JWT}`).send(payload)

    const update: [] = []

    await supertest(app)
      .put(`/api/projects/${_id}/filter`)
      .set('Authorization', `Bearer ${JWT}`)
      .send(update)
      .expect(200)

    return supertest(app)
      .get(`/api/projects/${_id}/filter`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)
      .then((res) => {
        expect(res.body.payload).toHaveLength(0)
        expect(res.body.criteria).toEqual({ project: _id })
      })
  })

  test('PUT /projects/:_id/filter update filter without existing filter simply return 200', async () => {
    const { _id } = await createSeedProject(JWT)
    const payload = <[]>[]

    return supertest(app)
      .put(`/api/projects/${_id}/filter`)
      .set('Authorization', `Bearer ${JWT}`)
      .send(payload)
      .expect(200)
  })

  test('DELETE /projects/:_id/filter', async () => {
    const { _id } = await createSeedProject(JWT)
    return supertest(app).delete(`/api/projects/${_id}/filter`).set('Authorization', `Bearer ${JWT}`).expect(200)
  })

  test('GET /projects/:_id/filter/operators (2)', async () => {
    const { _id } = await createSeedProject(JWT)

    return supertest(app).get(`/api/projects/${_id}/filter/operators`).set('Authorization', `Bearer ${JWT}`).expect(200)
  })
})
