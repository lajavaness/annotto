import express from 'express'
import mongoose from 'mongoose'
import supertest from 'supertest'
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
}, 10000)

afterAll(() => mongoose.disconnect())

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections()

  for (const collection of collections) {
    await collection.deleteMany({})
  }
})

describe('predictions', () => {
  describe('valid predictions upload', () => {
    test('POST /projects/:_id/items/predictionsUpload zone + classification', async () => {
      const { _id } = await createSeedProject(JWT, { config: DEMOS[5].config, items: DEMOS[5].items })

      return supertest(app)
        .post(`/api/projects/${_id}/items/predictionsUpload`)
        .attach('prediction', DEMOS[5].predictions || '')
        .set('Authorization', `Bearer ${JWT}`)
        .expect(200)
    })

    test('POST /projects/:_id/items/predictionsUpload classification', async () => {
      const { _id } = await createSeedProject(JWT, { config: DEMOS[3].config, items: DEMOS[3].items })

      return supertest(app)
        .post(`/api/projects/${_id}/items/predictionsUpload`)
        .attach('prediction', DEMOS[3].predictions || '')
        .set('Authorization', `Bearer ${JWT}`)
        .expect(200)
    })

    test('POST /projects/:_id/items/predictionsUpload ner', async () => {
      const { _id } = await createSeedProject(JWT, { config: DEMOS[2].config, items: DEMOS[2].items })

      return supertest(app)
        .post(`/api/projects/${_id}/items/predictionsUpload`)
        .attach('prediction', DEMOS[2].predictions || '')
        .set('Authorization', `Bearer ${JWT}`)
        .expect(200)
    })

    test('POST /projects/:_id/items/predictionsUpload ner + classif', async () => {
      const { _id } = await createSeedProject(JWT, { config: DEMOS[4].config, items: DEMOS[4].items })

      return supertest(app)
        .post(`/api/projects/${_id}/items/predictionsUpload`)
        .attach('prediction', DEMOS[4].predictions || '')
        .set('Authorization', `Bearer ${JWT}`)
        .expect(200)
    })

    test('POST /projects/:_id/items/predictionsUpload zone + text', async () => {
      const { _id } = await createSeedProject(JWT, { config: DEMOS[0].config, items: DEMOS[0].items })

      return supertest(app)
        .post(`/api/projects/${_id}/items/predictionsUpload`)
        .attach('prediction', DEMOS[0].predictions || '')
        .set('Authorization', `Bearer ${JWT}`)
        .expect(200)
    })
  })

  describe('invalid predictions upload', () => {
    test('POST /projects/:_id/items/predictionsUpload ner prediction with no uuid', async () => {
      const { _id } = await createSeedProject(JWT, { config: DEMOS[2].config, items: DEMOS[2].items })
      const predictionsPath = `${process.cwd()}/tests/integration/seed/predictions/invalid/ner1.jsonlines`

      return supertest(app)
        .post(`/api/projects/${_id}/items/predictionsUpload`)
        .attach('prediction', predictionsPath)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(400)
        .then((res) => expect(res.body.infos.includes('"uuid" is required')).toBeTruthy())
    })

    test('POST /projects/:_id/items/predictionsUpload classif prediction with no uuid', async () => {
      const { _id } = await createSeedProject(JWT, { config: DEMOS[4].config, items: DEMOS[4].items })
      const predictionsPath = `${process.cwd()}/tests/integration/seed/predictions/invalid/classification1.jsonlines`

      return supertest(app)
        .post(`/api/projects/${_id}/items/predictionsUpload`)
        .attach('prediction', predictionsPath)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(400)
        .then((res) => expect(res.body.infos.includes('"uuid" is required')).toBeTruthy())
    })

    test('POST /projects/:_id/items/predictionsUpload ner prediction with wrong category', async () => {
      const { _id } = await createSeedProject(JWT, { config: DEMOS[2].config, items: DEMOS[2].items })
      const predictionsPath = `${process.cwd()}/tests/integration/seed/predictions/invalid/ner2.jsonlines`

      return supertest(app)
        .post(`/api/projects/${_id}/items/predictionsUpload`)
        .attach('prediction', predictionsPath)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(400)
        .then((res) => expect(res.body.infos.includes('is not in project tasks')).toBeTruthy())
    })

    test('POST /projects/:_id/items/predictionsUpload ner and classif prediction with wrong classif category', async () => {
      const { _id } = await createSeedProject(JWT, { config: DEMOS[4].config, items: DEMOS[4].items })
      const predictionsPath = `${process.cwd()}/tests/integration/seed/predictions/invalid/ner+classif1.jsonlines`

      return supertest(app)
        .post(`/api/projects/${_id}/items/predictionsUpload`)
        .attach('prediction', predictionsPath)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(400)
        .then((res) => expect(res.body.infos.includes('is not in project tasks')).toBeTruthy())
    })

    test('POST /projects/:_id/items/predictionsUpload ner and classif prediction with wrong ner category', async () => {
      const { _id } = await createSeedProject(JWT, { config: DEMOS[4].config, items: DEMOS[4].items })
      const predictionsPath = `${process.cwd()}/tests/integration/seed/predictions/invalid/ner+classif2.jsonlines`

      return supertest(app)
        .post(`/api/projects/${_id}/items/predictionsUpload`)
        .attach('prediction', predictionsPath)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(400)
        .then((res) => expect(res.body.infos.includes('is not in project tasks')).toBeTruthy())
    })

    test('POST /projects/:_id/items/predictionsUpload ner and classif prediction with wrong ner value', async () => {
      const { _id } = await createSeedProject(JWT, { config: DEMOS[5].config, items: DEMOS[5].items })
      const predictionsPath = `${process.cwd()}/tests/integration/seed/predictions/invalid/ner+classif4.jsonlines`

      return supertest(app)
        .post(`/api/projects/${_id}/items/predictionsUpload`)
        .attach('prediction', predictionsPath)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(400)
        .then((res) => expect(res.body.infos.includes('is not in project tasks')).toBeTruthy())
    })

    test('POST /projects/:_id/items/predictionsUpload classif prediction with wrong category', async () => {
      const { _id } = await createSeedProject(JWT, { config: DEMOS[4].config, items: DEMOS[4].items })
      const predictionsPath = `${process.cwd()}/tests/integration/seed/predictions/invalid/classification2.jsonlines`

      return supertest(app)
        .post(`/api/projects/${_id}/items/predictionsUpload`)
        .attach('prediction', predictionsPath)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(400)
        .then((res) => expect(res.body.infos.includes('is not in project tasks')).toBeTruthy())
    })

    test('POST /projects/:_id/items/predictionsUpload zone prediction with wrong category', async () => {
      const { _id } = await createSeedProject(JWT, { config: DEMOS[0].config, items: DEMOS[0].items })
      const predictionsPath = `${process.cwd()}/tests/integration/seed/predictions/invalid/zone2.jsonlines`

      return supertest(app)
        .post(`/api/projects/${_id}/items/predictionsUpload`)
        .attach('prediction', predictionsPath)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(400)
        .then((res) => expect(res.body.infos.includes('is not in project tasks')).toBeTruthy())
    })

    test('POST /projects/:_id/items/predictionsUpload zone and classif prediction with wrong zone category', async () => {
      const { _id } = await createSeedProject(JWT, { config: DEMOS[5].config, items: DEMOS[5].items })
      const predictionsPath = `${process.cwd()}/tests/integration/seed/predictions/invalid/zone+classif1.jsonlines`

      return supertest(app)
        .post(`/api/projects/${_id}/items/predictionsUpload`)
        .attach('prediction', predictionsPath)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(400)
        .then((res) => expect(res.body.infos.includes('is not in project tasks')).toBeTruthy())
    })

    test('POST /projects/:_id/items/predictionsUpload zone and classif prediction with wrong classif category', async () => {
      const { _id } = await createSeedProject(JWT, { config: DEMOS[5].config, items: DEMOS[5].items })
      const predictionsPath = `${process.cwd()}/tests/integration/seed/predictions/invalid/zone+classif2.jsonlines`

      return supertest(app)
        .post(`/api/projects/${_id}/items/predictionsUpload`)
        .attach('prediction', predictionsPath)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(400)
        .then((res) => expect(res.body.infos.includes('is not in project tasks')).toBeTruthy())
    })

    test('POST /projects/:_id/items/predictionsUpload zone and classif prediction with wrong classif value', async () => {
      const { _id } = await createSeedProject(JWT, { config: DEMOS[5].config, items: DEMOS[5].items })
      const predictionsPath = `${process.cwd()}/tests/integration/seed/predictions/invalid/zone+classif3.jsonlines`

      return supertest(app)
        .post(`/api/projects/${_id}/items/predictionsUpload`)
        .attach('prediction', predictionsPath)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(400)
        .then((res) => expect(res.body.infos.includes('is not in project Classifications type tasks')).toBeTruthy())
    })

    test('POST /projects/:_id/items/predictionsUpload zone and classif prediction with wrong zone value', async () => {
      const { _id } = await createSeedProject(JWT, { config: DEMOS[5].config, items: DEMOS[5].items })
      const predictionsPath = `${process.cwd()}/tests/integration/seed/predictions/invalid/zone+classif4.jsonlines`

      return supertest(app)
        .post(`/api/projects/${_id}/items/predictionsUpload`)
        .attach('prediction', predictionsPath)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(400)
        .then((res) => expect(res.body.infos.includes('is not in project ZONE type tasks')).toBeTruthy())
    })

    test('POST /projects/:_id/items/predictionsUpload text prediction with wrong Classification value', async () => {
      const { _id } = await createSeedProject(JWT, { config: DEMOS[3].config, items: DEMOS[3].items })
      const predictionsPath = `${process.cwd()}/tests/integration/seed/predictions/invalid/text1.jsonlines`

      return supertest(app)
        .post(`/api/projects/${_id}/items/predictionsUpload`)
        .attach('prediction', predictionsPath)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(400)
        .then((res) => expect(res.body.infos.includes('(Text Recognition task) is not in project tasks')).toBeTruthy())
    })

    test('POST /projects/:_id/items/predictionsUpload text prediction with wrong TASK name', async () => {
      const { _id } = await createSeedProject(JWT, { config: DEMOS[3].config, items: DEMOS[3].items })
      const predictionsPath = `${process.cwd()}/tests/integration/seed/predictions/invalid/text2.jsonlines`

      return supertest(app)
        .post(`/api/projects/${_id}/items/predictionsUpload`)
        .attach('prediction', predictionsPath)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(400)
        .then((res) => expect(res.body.infos.includes('(FOO) is not in project tasks')).toBeTruthy())
    })
  })
})
