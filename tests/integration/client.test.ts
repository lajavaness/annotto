import crypto from 'crypto'
import express from 'express'
import mongoose from 'mongoose'
import supertest from 'supertest'
import createServer from '../../src/__tests__/create-server'
import getToken from '../../src/__tests__/get-oauth-token'
import { adminOauth } from './seed/seed'
import config from '../../config'

let JWT: string
let app: express.Application

const createSeedClient = (jwt: string) => {
  const payload = {
    name: `${crypto.randomBytes(10).toString('hex')}`,
    description: `${crypto.randomBytes(10).toString('hex')}`,
  }

  return supertest(app)
    .post('/api/clients/')
    .set('Authorization', `Bearer ${jwt}`)
    .send(payload)
    .expect(201)
    .then((res) => {
      expect(res.body._id).toBeDefined()
      expect(res.body.name).toBe(payload.name)
      expect(res.body.description).toBe(payload.description)

      return res.body._id
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

describe('clients', () => {
  test('POST /api/clients', () => createSeedClient(JWT))

  test('GET /api/clients', async () => {
    await createSeedClient(JWT)

    return supertest(app)
      .get('/api/clients/')
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)
      .then((res) => expect(res.body.length === 1))
  })

  test('400 POST /api/clients', async () => {
    const payload = {}
    return supertest(app).post('/api/clients/').set('Authorization', `Bearer ${JWT}`).send(payload).expect(400)
  })

  test('PUT /api/clients/:clientId', async () => {
    const clientId = await createSeedClient(JWT)

    const payload = {
      name: `${crypto.randomBytes(10).toString('hex')}`,
      description: `${crypto.randomBytes(10).toString('hex')}`,
    }
    return supertest(app)
      .put(`/api/clients/${clientId}`)
      .set('Authorization', `Bearer ${JWT}`)
      .send(payload)
      .expect(200)
      .then((res) => {
        expect(res.body._id).toBeDefined()
        expect(res.body.name).toBe(payload.name)
        expect(res.body.description).toBe(payload.description)
      })
  })

  test('GET /api/clients/:clientId', async () => {
    const clientId = await createSeedClient(JWT)

    return supertest(app)
      .get(`/api/clients/${clientId}`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)
      .then((res) => {
        expect(res.body._id).toBe(clientId)
        expect(res.body.name).toBeDefined()
        expect(res.body.description).toBeDefined()
      })
  })

  test('DELETE /api/clients/:clientId', async () => {
    const clientId = await createSeedClient(JWT)

    await supertest(app).delete(`/api/clients/${clientId}`).set('Authorization', `Bearer ${JWT}`).expect(200)

    return supertest(app).get(`/api/clients/${clientId}`).set('Authorization', `Bearer ${JWT}`).expect(404)
  })

  test('GET 404 /api/clients/:clientId', async () => {
    return supertest(app)
      .get(`/api/clients/${mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(404)
  })

  test('DELETE 404 /api/clients/:clientId', async () => {
    return supertest(app)
      .delete(`/api/clients/${mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(404)
  })

  test('PUT 404 /api/clients/:clientId', async () => {
    return supertest(app)
      .put(`/api/clients/${mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${JWT}`)
      .send({
        name: 'test',
        description: 'test',
        isActive: true,
      })
      .expect(404)
  })

  test('PUT 400 /api/clients/:clientId', async () => {
    const clientId = await createSeedClient(JWT)

    const payload = {
      toto: `${crypto.randomBytes(10).toString('hex')}`,
    }
    return supertest(app)
      .put(`/api/clients/${clientId}`)
      .set('Authorization', `Bearer ${JWT}`)
      .send(payload)
      .expect(400)
  })
})
