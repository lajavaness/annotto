import mongoose from 'mongoose'
import supertest from 'supertest'
import createServer from '../server'
import config from '../../config'

beforeAll(async () => {
  await mongoose.connect(config.mongo.url, config.mongo.options)
})

afterAll(async () => {
  await mongoose.disconnect()
})

describe('Defaults and Login / Register', () => {
  test('GET /api/health', async () => {
    return supertest(await createServer(config))
      .get('/api/health')
      .expect(200)
      .then((res) => {
        expect(res.body.status).toBe('green')
        expect(res.body.environment).toBeDefined()
        expect(res.body.version).toBeDefined()
      })
  })

  test('GET /aninvalideroute', async () => {
    return supertest(await createServer(config))
      .get('/invalidroute')
      .expect(404)
  })
})
