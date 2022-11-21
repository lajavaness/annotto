import express from 'express'
import mongoose from 'mongoose'
import supertest from 'supertest'
import { Item } from '../../src/db/models/items'
import { Task } from '../../src/db/models/tasks'
import createServer from '../../src/__tests__/create-server'
import getToken from '../../src/__tests__/get-oauth-token'
import { adminOauth, userOauth } from './seed/seed'
import config from '../../config'

let JWT: string
let projectUserJWT: string
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
  projectUserJWT = await getToken(userOauth)
}, 20000)

afterAll(() => mongoose.disconnect())

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections()

  for (const collection of collections) {
    await collection.deleteMany({})
  }
})

describe('stats', () => {
  test('GET /projects/:_id/stats/items Annotating updates items stats', async () => {
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

    return supertest(app)
      .get(`/api/projects/${_id}/stats/items`)
      .set('Authorization', `Bearer ${JWT}`)
      .then((res) => {
        expect(res.body.count).toBeDefined()
        expect(res.body.index).toBeDefined()
        expect(res.body.limit).toBeDefined()
        expect(res.body.pageCount).toBeDefined()
        expect(res.body.total).toBeDefined()
        expect(res.body.data).toBeDefined()

        const annotatedItemWithStats = (<Item[]>res.body.data).some(
          (item) =>
            item.logCount === 1 &&
            item.annotated === true &&
            item.annotationValues.length === 1 &&
            item.annotatedAt &&
            item.velocity &&
            item.lastAnnotator
        )

        expect(annotatedItemWithStats).toBe(true)
      })
  })

  test('GET /projects/:_id/stats/tasks Annotating updates classifications stats', async () => {
    const { _id } = await createSeedProject(JWT)

    const itemToAnnotateId = await supertest(app)
      .get(`/api/projects/${_id}/items/next`)
      .set('Authorization', `Bearer ${projectUserJWT}`)
      .expect(200)
      .then((res) => res.body._id)

    const itemToAnnotateId2 = await supertest(app)
      .get(`/api/projects/${_id}/items/next`)
      .set('Authorization', `Bearer ${projectUserJWT}`)
      .expect(200)
      .then((res) => res.body._id)

    await supertest(app)
      .post(`/api/projects/${_id}/items/${itemToAnnotateId}/annotate`)
      .set('Authorization', `Bearer ${projectUserJWT}`)
      .send({
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
      })
      .expect(200)

    await supertest(app)
      .post(`/api/projects/${_id}/items/${itemToAnnotateId2}/annotate`)
      .set('Authorization', `Bearer ${projectUserJWT}`)
      .send({
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
      })
      .expect(200)

    return supertest(app)
      .get(`/api/projects/${_id}/stats/tasks`)
      .set('Authorization', `Bearer ${JWT}`)
      .then((res) => {
        const annotatedClassification = (<Task[]>res.body.data).filter((classif) => classif.annotationPourcent > 0)

        expect(annotatedClassification).toHaveLength(2)
        expect(annotatedClassification.every((classif) => classif.annotationPourcent === 50)).toBe(true)
        expect(annotatedClassification.every((classif) => classif.annotationCount === 1)).toBe(true)
        expect(annotatedClassification.some((classif) => classif.value === 'bbox_skill')).toBe(true)
        expect(annotatedClassification.some((classif) => classif.value === 'bbox_name')).toBe(true)
      })
  })

  test('GET /projects/:_id/stats/items Annotating updates project stats', async () => {
    const project = await createSeedProject(JWT)

    const { _id } = project
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

    return supertest(app)
      .get(`/api/projects/${_id}`)
      .set('Authorization', `Bearer ${JWT}`)
      .then((res) => {
        expect(res.body.progress).toBe(33)
        expect(res.body.velocity).toBe(1)
        expect(res.body.remainingWork).toBe(1)
      })
  })
})
