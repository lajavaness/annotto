import express from 'express'
import mongoose from 'mongoose'
import supertest from 'supertest'
import createServer from '../../src/__tests__/create-server'
import getToken from '../../src/__tests__/get-oauth-token'
import { adminOauth, dataOauth, userOauth } from './seed/seed'
import config from '../../config'

let JWT: string
let dataScientistJWT: string
let userJWT: string
let projectUserJWT: string
let projectDatascientistJWT: string
let app: express.Application

const DEMO_WITH_USER_THAT_DONT_EXIST = {
  config: `${process.cwd()}/statics/demo/demo-zone+ocr_with_user_that_dont_exist/config.json`,
  items: `${process.cwd()}/statics/demo/demo-zone+ocr_with_user_that_dont_exist/items.jsonlines`,
  predictions: `${process.cwd()}/statics/demo/demo-zone+ocr_with_user_that_dont_exist/predictions.jsonlines`,
}

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
  dataScientistJWT = await getToken(dataOauth)
  userJWT = await getToken(userOauth)

  projectUserJWT = await getToken(userOauth)
  projectDatascientistJWT = await getToken(dataOauth)
}, 20000)

afterAll(() => mongoose.disconnect())

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections()

  for (const collection of collections) {
    await collection.deleteMany({})
  }
})

describe('permissions', () => {
  describe('on platform', () => {
    test('request with invalid token should return 403', async () => {
      return supertest(app).get('/api/projects').set('Authorization', `Bearer`).expect(403)
    })
    test('dataScientist should be able to create project', async () => {
      return supertest(app)
        .post('/api/projects/import')
        .set('Authorization', `Bearer ${dataScientistJWT}`)
        .attach('project', DEMOS[0].config)
        .attach('items', DEMOS[0].items)
        .expect(200)
    })
    test('user should not be able to create project', async () => {
      return supertest(app)
        .post('/api/projects/import')
        .set('Authorization', `Bearer ${userJWT}`)
        .attach('project', DEMOS[0].config)
        .attach('items', DEMOS[0].items)
        .expect(403)
    })
    test('user should be able to list project', async () => {
      return supertest(app).get('/api/projects').set('Authorization', `Bearer ${userJWT}`).expect(200)
    })
    test('admin should access any project', async () => {
      const { _id } = await createSeedProject(dataScientistJWT)

      return supertest(app).get(`/api/projects/${_id}`).set('Authorization', `Bearer ${JWT}`).expect(200)
    })
    test('dataScientist should not be able to access a project if not in user list', async () => {
      const { _id } = await createSeedProject(JWT, DEMO_WITH_USER_THAT_DONT_EXIST)

      return supertest(app).get(`/api/projects/${_id}`).set('Authorization', `Bearer ${dataScientistJWT}`).expect(403)
    })
    test('user should not be able to access a project if not in user list', async () => {
      const { _id } = await createSeedProject(JWT, DEMO_WITH_USER_THAT_DONT_EXIST)

      return supertest(app).get(`/api/projects/${_id}`).set('Authorization', `Bearer ${userJWT}`).expect(403)
    })
  })

  describe('per project', () => {
    test('projectDatascientist should be able to update project', async () => {
      const { _id } = await createSeedProject(JWT)

      return supertest(app)
        .put(`/api/projects/${_id}`)
        .set('Authorization', `Bearer ${projectDatascientistJWT}`)
        .send({
          description: 'FOO',
        })
        .expect(200)
    })

    test('projectUser should not be able to update project', async () => {
      const { _id } = await createSeedProject(JWT)

      return supertest(app)
        .put(`/api/projects/${_id}`)
        .set('Authorization', `Bearer ${projectUserJWT}`)
        .send({
          description: 'FOO',
        })
        .expect(403)
    })

    test('projectUser should be able to annotate', async () => {
      const { _id } = await createSeedProject(JWT)

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

      const itemToAnnotateId = await supertest(app)
        .get(`/api/projects/${_id}/items/next`)
        .set('Authorization', `Bearer ${projectUserJWT}`)
        .expect(200)
        .then((res) => res.body._id)

      await supertest(app)
        .post(`/api/projects/${_id}/items/${itemToAnnotateId}/annotate`)
        .set('Authorization', `Bearer ${projectUserJWT}`)
        .send(payload)
        .expect(200)
    })
  })
})
