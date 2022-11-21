import express from 'express'
import mongoose from 'mongoose'
import supertest from 'supertest'
import { Profile } from '../../src/db/models/profiles'
import createServer from '../../src/__tests__/create-server'
import getToken from '../../src/__tests__/get-oauth-token'
import { adminOauth, userOauth } from './seed/seed'
import config from '../../config'

let JWT: string
let userJWT: string
let app: express.Application

beforeAll(async () => {
  app = await createServer(config)
  await mongoose.connect(config.mongo.url, config.mongo.options)

  JWT = await getToken(adminOauth)
  userJWT = await getToken(userOauth)
}, 20000)

afterAll(() => mongoose.disconnect())

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections()

  for (const collection of collections) {
    await collection.deleteMany({})
  }
})

describe('profiles', () => {
  test('GET api/profiles', () => {
    return supertest(app)
      .get('/api/profiles/')
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)
      .then((res) => res.body.data)
      .then((profiles: Profile[]) => expect(profiles).toHaveLength(1))
  })

  test('First request creates a profile', async () => {
    await supertest(app).get('/api/projects').set('Authorization', `Bearer ${userJWT}`).expect(200)

    const profiles: Profile[] = await supertest(app)
      .get('/api/profiles/')
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)
      .then((res) => res.body.data)

    expect(profiles).toHaveLength(2)
    const profile = profiles.find((p) => p.role === 'user')
    expect(profile).toBeTruthy()
  })

  test('PUT api/profiles/:id', async () => {
    // request to create a second non admin profile
    await supertest(app).get('/api/projects').set('Authorization', `Bearer ${userJWT}`).expect(200)

    const profiles: Profile[] = await supertest(app)
      .get('/api/profiles/')
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)
      .then((res) => res.body.data)

    const userProfile = profiles.find((profile) => profile.role === 'user')

    return supertest(app)
      .put(`/api/profiles/${userProfile ? userProfile._id : ''}?role=dataScientist`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)
      .then((res) => res.body)
      .then((profile) => expect(profile.role).toBe('dataScientist'))
  })
})
