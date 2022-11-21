import crypto from 'crypto'
import express from 'express'
import { promises as fs } from 'fs'
import mongoose from 'mongoose'
import binaryParser from 'superagent-binary-parser'
import supertest from 'supertest'
import unzip from 'unzipper'
import { Log } from '../../src/db/models/logs'
import { Project } from '../../src/db/models/projects'
import createServer from '../../src/__tests__/create-server'
import getToken from '../../src/__tests__/get-oauth-token'
import { adminOauth } from './seed/seed'
import config from '../../config'

let JWT: string
let app: express.Application

const defaultTags = ['pose question', 'etrange', 'rigolo']

const cwd = process.cwd()

const DEMOS = [
  {
    // 0
    config: `${cwd}/statics/demo/demo-zone+ocr/config.json`,
    items: `${cwd}/statics/demo/demo-zone+ocr/items.jsonlines`,
    predictions: `${cwd}/statics/demo/demo-zone+ocr/predictions.jsonlines`,
  },
  {
    // 1
    config: `${cwd}/statics/demo/demo-zone+classification-public-image/config.json`,
    items: `${cwd}/statics/demo/demo-zone+classification-public-image/items.jsonlines`,
    predictions: `${cwd}/statics/demo/demo-zone+classification-public-image/predictions.jsonlines`,
  },
  {
    // 2
    config: `${cwd}/statics/demo/demo-nerWithRelations/config.json`,
    items: `${cwd}/statics/demo/demo-nerWithRelations/items.jsonlines`,
    predictions: `${cwd}/statics/demo/demo-nerWithRelations/predictions.jsonlines`,
  },
  {
    // 3
    config: `${cwd}/statics/demo/demo-classification-text-1/config.json`,
    items: `${cwd}/statics/demo/demo-classification-text-1/items.jsonlines`,
    predictions: `${cwd}/statics/demo/demo-classification-text-1/predictions.jsonlines`,
  },
  {
    // 4
    config: `${cwd}/statics/demo/demo-ner+classification-text/config.json`,
    items: `${cwd}/statics/demo/demo-ner+classification-text/items.jsonlines`,
    predictions: `${cwd}/statics/demo/demo-ner+classification-text/predictions.jsonlines`,
  },
  {
    // 5
    config: `${cwd}/statics/demo/demo-zone+classification-public-image/config.json`,
    items: `${cwd}/statics/demo/demo-zone+classification-public-image/items.jsonlines`,
    predictions: `${cwd}/statics/demo/demo-zone+classification-public-image/predictions.jsonlines`,
  },
  {
    // 6
    config: `${cwd}/statics/demo/demo-classification-public-image/config.json`,
    items: `${cwd}/statics/demo/demo-classification-public-image/items.jsonlines`,
  },
  {
    // 7
    config: `${cwd}/statics/demo/demo-zone+annotations/config.json`,
    items: `${cwd}/statics/demo/demo-zone+annotations/items.jsonlines`,
    annotations: `${cwd}/statics/demo/demo-zone+annotations/annotations.jsonlines`,
  },
  {
    // 8
    config: `${cwd}/statics/demo/demo-nerWithRelations-2/config.json`,
    items: `${cwd}/statics/demo/demo-nerWithRelations-2/items.jsonlines`,
    annotations: `${cwd}/statics/demo/demo-nerWithRelations-2/annotations.jsonlines`,
  },
]

const createSeedProject = (jwt: string, project = DEMOS[0]) => {
  return supertest(app)
    .post('/api/projects/import')
    .set('Authorization', `Bearer ${jwt}`)
    .attach('project', project.config)
    .attach('items', project.items)
    .attach('predictions', project.predictions || '')
    .attach('annotations', project.annotations || '')
    .expect(200)
    .then((res) => res.body.project)
}

const getFileFromZip = async (filename: string, res: { body: Buffer }) => {
  const zip = await unzip.Open.buffer(res.body)
  const annotations = zip.files.find((f: { path: string }) => f.path === filename)
  return (await (<unzip.File>annotations).buffer()).toString()
}

const getConfigFromZip = async (res: { body: Buffer }) => {
  const str = await getFileFromZip('config.json', res)
  return JSON.parse(str)
}

const getLinesFromZip = async (filename: string, res: { body: Buffer }) => {
  const str = await getFileFromZip(filename, res)
  return str.split('\n')
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

describe('server up', () => {
  test('GET /api/health', async () => {
    return supertest(app).get('/api/health/').expect(200)
  })

  test('GET /api/me', async () => {
    const res = await supertest(app).get('/api/me').set('Authorization', `Bearer ${JWT}`).expect(200)

    expect(res.body.email).toBe(adminOauth.email)
    expect(res.body.firstName).toBeDefined()
    expect(res.body.lastName).toBeDefined()
    expect(res.body._id).toBeDefined()
  })
})

describe('projects', () => {
  describe('POST /api/projects/import', () => {
    test('sets all the config properties to the project', async () => {
      const project = await createSeedProject(JWT)

      expect(project.admins).toBeDefined()
      expect(project.users).toBeDefined()
      expect(project.dataScientists).toBeDefined()
      expect(project.itemCount).toBeDefined()
      expect(project.commentCount).toBeDefined()
      expect(project.deadline).toBeDefined()
      expect(project.progress).toBeDefined()
      expect(project.velocity).toBeDefined()
      expect(project.remainingWork).toBeDefined()
      expect(project.lastAnnotationTime).toBeDefined()
      expect(project.name).toBeDefined()
      expect(project.guidelines).toBeDefined()
      expect(project._id).toBeDefined()
      expect(project.updatedAt).toBeDefined()
      expect(project.createdAt).toBeDefined()
      expect(project.status).toBeDefined()
      expect(project.defaultTags).toBeDefined()
      expect(project.itemTags).toBeDefined()
      expect(project.active).toBeDefined()
      expect(project.filterPredictionsMinimum).toBeDefined()
      expect(project.highlights).toBeDefined()
      expect(project.showPredictions).toBeDefined()
      expect(project.prefillPredictions).toBeDefined()
      expect(project.description).toBeDefined()
      expect(project.annotators).toBeDefined()
      expect(project.type).toBeDefined()
      expect(project.client).toBeDefined()
      expect(project.tasks).toBeDefined()
      expect(project.tasks.length).toBeTruthy()
      expect(typeof project.tasks[0]).toBe('string')

      const results: Project = await supertest(app)
        .get(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(200)
        .then((res) => res.body)

      const classWithColor = results.tasks.find((c) => c.value === 'bbox_name')
      expect(classWithColor.value).toBe('bbox_name')
      expect(classWithColor.label).toBe('Name')
      expect(classWithColor.hotkey).toBe('n')
      expect(classWithColor.color).toBe('123')
      expect(classWithColor.exposed).toBe(true)
    })

    test('create project with NER relations', async () => {
      const project = await createSeedProject(JWT, {
        config: DEMOS[2].config,
        items: DEMOS[2].items,
      })

      expect(project.entitiesRelationsGroup).toHaveLength(2)
      expect(project.entitiesRelationsGroup[0].name).toBeDefined()
      expect(project.entitiesRelationsGroup[0].values).toBeDefined()
      expect(project.entitiesRelationsGroup[0].values[0].value).toBeDefined()
    })

    test('save item tags', async () => {
      const project = await createSeedProject(JWT, {
        config: DEMOS[7].config,
        items: DEMOS[7].items,
        annotations: DEMOS[7].annotations || '',
      })

      const items = await supertest(app)
        .get(`/api/projects/${project._id}/items`)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(200)
        .then((res) => res.body.data)

      expect(items).toHaveLength(1)
      expect(items[0]).toHaveProperty('tags', ['tag1', 'tag2'])
    })

    describe('add new annotations', () => {
      /*
       * Check that:
       * - annotations have been written
       * - logs have been written
       *   - project-add
       *   - item-add -- not implemented
       *   - annotation-add
       * - the logCount property was updated
       * - the project stats have been updated
       * - classification 'annotationCount' and 'annotationPourcent' have been updated
       * - logTags have been updated -- no tags in first upload
       * - project velocity.
       */

      let projectId: string
      let item: { _id: string }
      let items: { _id: string }[]
      beforeEach(async () => {
        const project = await createSeedProject(JWT, {
          config: DEMOS[7].config,
          items: DEMOS[7].items,
          annotations: DEMOS[7].annotations || '',
        })
        projectId = project._id
        items = await supertest(app)
          .get(`/api/projects/${projectId}/items`)
          .set('Authorization', `Bearer ${JWT}`)
          .expect(200)
          .then((res) => res.body.data)
        item = items[0] // eslint-disable-line prefer-destructuring
      })

      test('project metadata should be correctly set', async () => {
        const project = await supertest(app)
          .get(`/api/projects/${projectId}`)
          .set('Authorization', `Bearer ${JWT}`)
          .expect(200)
          .then((res) => res.body)

        expect(project).toHaveProperty('itemCount', 1)
        expect(project).toHaveProperty('velocity', 26699)
        expect(project).toHaveProperty('progress', 100)
        expect(project).toHaveProperty('remainingWork', 0)
      })

      test('items should be inserted and metadata correctly set', async () => {
        expect(items).toHaveLength(1)
        expect(item).toHaveProperty('annotated', true)
        expect(item).toHaveProperty('logCount', 2)
      })

      test('annotations should be inserted and metadata correctly set', async () => {
        const annotations = await supertest(app)
          .get(`/api/projects/${projectId}/items/${item._id}/annotations`)
          .set('Authorization', `Bearer ${JWT}`)
          .expect(200)
          .then((res) => res.body)

        expect(annotations).toHaveLength(8)
        const annotation = annotations[0]
        expect(annotation).toHaveProperty('task')
        expect(annotation.task).toHaveProperty('annotationCount', 1)
        expect(annotation.task).toHaveProperty('annotationPourcent', 100)
      })

      test('logs should be created', async () => {
        const logs: Log[] = await supertest(app)
          .get(`/api/projects/logs/${projectId}`)
          .set('Authorization', `Bearer ${JWT}`)
          .expect(200)
          .then((res) => res.body.data)

        expect(logs).toHaveLength(2)

        const annotationLog = logs.find((l) => l.type === 'annotation-add')
        expect(annotationLog).toHaveProperty('annotations')
        expect((<Log>annotationLog).annotations).toHaveLength(8)
      })
    })

    test('create second public image project with same items', async () => {
      await createSeedProject(JWT)

      const project = await createSeedProject(JWT, {
        config: DEMOS[1].config,
        items: DEMOS[0].items,
      })
      expect(project._id).toBeDefined()

      expect(project.tasks).toBeDefined()
      expect(project.tasks.length).toBeTruthy()
      expect(typeof project.tasks[0]).toBe('string')
    })

    test('wrong Joi item type on project creation throws', async () => {
      const res = await supertest(app)
        .post('/api/projects/import')
        .set('Authorization', `Bearer ${JWT}`)
        .attach('project', DEMOS[0].config)
        .attach('items', DEMOS[2].items)
        .expect(400)

      expect(res.body.message).toBe('ERROR_PROJECT_VALIDATION')

      // validate transaction rollback
      const res2 = await supertest(app).get('/api/projects').set('Authorization', `Bearer ${JWT}`)

      expect(res2.body.count).toBe(0)
    })

    test('predictions Classifications does not match project', async () => {
      const res = await supertest(app)
        .post('/api/projects/import')
        .set('Authorization', `Bearer ${JWT}`)
        .attach('project', DEMOS[1].config)
        .attach('items', DEMOS[1].items)
        .attach('predictions', DEMOS[2].predictions || '')
        .expect(400)

      expect(res.body.message).toBe('ERROR_PROJECT_VALIDATION')
    })

    test('Project NER and relations with annotated items', async () => {
      const {
        body: { project },
      } = await supertest(app)
        .post('/api/projects/import')
        .set('Authorization', `Bearer ${JWT}`)
        .attach('project', DEMOS[8].config)
        .attach('items', DEMOS[8].items)
        .attach('annotations', DEMOS[8].annotations || '')
        .expect(200)

      const input = JSON.parse(await fs.readFile(DEMOS[8].annotations || '', 'utf8'))

      const res = await supertest(app)
        .get(`/api/projects/${project._id}/exports?annotationsAndComments=true`)
        .set('Authorization', `Bearer ${JWT}`)
        .set('content-type', 'application/json')
        .expect(200)
        .expect('Content-Type', 'application/zip')
        .parse(binaryParser)
        .buffer()

      const [line] = await getLinesFromZip('annotations.jsonlines', res)
      expect(line).toBeDefined()
      const output = JSON.parse(line)

      const keys = Object.keys(input.annotation.ner)
      expect(output).toHaveProperty('annotation')
      expect(output.annotation).toHaveProperty('ner')
      for (const key of keys) {
        expect(output.annotation.ner).toHaveProperty(key, input.annotation.ner[key])
      }
    })
  })

  describe('PUT /api/projects/:id', () => {
    test('add new NER relations', async () => {
      const project = await createSeedProject(JWT, {
        config: DEMOS[2].config,
        items: DEMOS[2].items,
      })

      const payload = {
        entitiesRelationsGroup: [
          ...project.entitiesRelationsGroup,
          {
            name: 'RelationsGroup3',
            min: 0,
            max: 0,
            values: [
              {
                value: 'foo',
                label: 'foo',
                color: '123',
                hotkey: 'n',
                description: 'le foo',
                exposed: true,
              },
              {
                value: 'bar',
                label: 'bar',
              },
            ],
          },
        ],
      }

      const updatedProject = await supertest(app)
        .put(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${JWT}`)
        .send(payload)
        .expect(200)
        .then((res) => res.body)

      expect(updatedProject.entitiesRelationsGroup).toHaveLength(3)
      expect(updatedProject.entitiesRelationsGroup[2].name).toBe('RelationsGroup3')
      expect(updatedProject.entitiesRelationsGroup[2].values).toHaveLength(2)
      expect(updatedProject.entitiesRelationsGroup[2].values[0].value).toBe('foo')
      expect(updatedProject.entitiesRelationsGroup[2].values[0].label).toBe('foo')
      expect(updatedProject.entitiesRelationsGroup[2].values[0].color).toBe('123')
      expect(updatedProject.entitiesRelationsGroup[2].values[0].description).toBe('le foo')
      expect(updatedProject.entitiesRelationsGroup[2].values[0].exposed).toBe(true)
      expect(updatedProject.entitiesRelationsGroup[2].values[1].value).toBe('bar')
    })

    test('Update project NER relations', async () => {
      const project = await createSeedProject(JWT, {
        config: DEMOS[2].config,
        items: DEMOS[2].items,
      })

      const payload = {
        entitiesRelationsGroup: [
          {
            _id: project.entitiesRelationsGroup[0]._id,
            name: 'relationsGroup1',
            values: [
              {
                value: 'FOO',
                label: 'FOO',
              },
              {
                value: 'BAR',
                label: 'BAR',
              },
            ],
          },
          {
            _id: project.entitiesRelationsGroup[1]._id,
            name: 'relationsGroup2',
            values: [
              {
                value: 'BAZ',
                label: 'BAZ',
              },
            ],
          },
        ],
      }

      const updatedProject: Project = await supertest(app)
        .put(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${JWT}`)
        .send(payload)
        .expect(200)
        .then((res) => res.body)

      const FOO = updatedProject.entitiesRelationsGroup[0].values.find((rel) => rel.value === 'FOO')
      const BAR = updatedProject.entitiesRelationsGroup[0].values.find((rel) => rel.value === 'BAR')
      const BAZ = updatedProject.entitiesRelationsGroup[1].values.find((rel) => rel.value === 'BAZ')

      expect(FOO).toBeTruthy()
      expect(BAR).toBeTruthy()
      expect(BAZ).toBeTruthy()
    })

    test('400 update project NER relations with wrong category id', async () => {
      const project = await createSeedProject(JWT, {
        config: DEMOS[2].config,
        items: DEMOS[2].items,
      })

      const payload = {
        entitiesRelationsGroup: [
          {
            _id: '123',
            name: 'relationsGroup1',
            values: [
              {
                value: 'FOO',
                label: 'FOO',
              },
              {
                value: 'BAR',
                label: 'BAR',
              },
            ],
          },
        ],
      }

      return supertest(app)
        .put(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${JWT}`)
        .send(payload)
        .expect(400)
    })

    test('400 Cannot update task value', async () => {
      const project = await createSeedProject(JWT)

      const updatedTask = {
        _id: project.tasks[0],
        value: 'bbox_name_FOO',
        label: 'Name',
        hotkey: 'n',
      }

      const payload = {
        name: 'myProject',
        defaultTags,
        tasks: [updatedTask],
      }

      return supertest(app)
        .put(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${JWT}`)
        .send(payload)
        .expect(400)
    })

    test('Update one task, and create 3 new', async () => {
      const project = await createSeedProject(JWT)
      const updatedTask = {
        _id: project.tasks[2],
        label: 'updatedNameLabel',
        category: 'bbox',
        hotkey: 'a',
        type: 'classifications',
        value: 'bbox_name',
      }
      // parent already existed
      const newTask = {
        label: 'foo',
        category: 'foo1',
        hotkey: 'b',
        value: 'foo',
        type: 'classifications',
        conditions: ['updatedNameLabel'],
      }
      // parent is one of new classifications
      const newTask2 = {
        label: 'bar',
        category: 'bar1',
        hotkey: 'c',
        value: 'bar',
        type: 'classifications',
        conditions: ['foo'],
      }
      // new classif with no parent
      const newTask3 = {
        label: 'baz',
        category: 'baz1',
        hotkey: 'd',
        value: 'baz',
        type: 'classifications',
      }

      const payload = {
        name: 'myProject',
        defaultTags,
        tasks: [updatedTask, newTask, newTask2, newTask3],
      }

      await supertest(app)
        .put(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${JWT}`)
        .send(payload)
        .expect(200)

      const res = await supertest(app)
        .get(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(200)

      const name = (<Project>res.body).tasks.find((obj) => obj.value === 'bbox_name')
      const foo = (<Project>res.body).tasks.find((obj) => obj.value === 'foo')
      const bar = (<Project>res.body).tasks.find((obj) => obj.value === 'bar')

      expect(name.label).toBe('updatedNameLabel')

      expect(foo.value).toBe('foo')
      expect(bar.value).toBe('bar')
    })

    test('Update only highlights', async () => {
      const project = await createSeedProject(JWT)

      const payload = {
        highlights: ['hello world'],
      }

      await supertest(app)
        .put(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${JWT}`)
        .send(payload)
        .expect(200)

      const res = await supertest(app)
        .get(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(200)

      expect(res.body.highlights).toEqual(payload.highlights)
    })

    test('Update client', async () => {
      const project = await createSeedProject(JWT)

      const payload = {
        client: 'FOO',
      }

      await supertest(app)
        .put(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${JWT}`)
        .send(payload)
        .expect(200)

      const res = await supertest(app)
        .get(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(200)

      expect(res.body.client.name).toEqual(payload.client)
    })

    test('400 - Invalid Payload', async () => {
      const { _id } = await createSeedProject(JWT)

      const payload = {
        toto: `${crypto.randomBytes(10).toString('hex')}`,
      }
      return supertest(app).put(`/api/projects/${_id}`).set('Authorization', `Bearer ${JWT}`).send(payload).expect(400)
    })

    test('404 unknown ObjectId', async () => {
      await createSeedProject(JWT)

      const payload = {
        defaultTags: ['ceci est un tag'],
      }
      return supertest(app)
        .put(`/api/projects/${mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${JWT}`)
        .send(payload)
        .expect(404)
    })
  })

  describe('POST /api/projects/:projectId/importAnnotations', () => {
    test('200 should accept new annotations', async () => {
      const project = await createSeedProject(JWT, {
        config: DEMOS[7].config,
        items: DEMOS[7].items,
      })

      await supertest(app)
        .post(`/api/projects/${project._id}/importAnnotations`)
        .set('Authorization', `Bearer ${JWT}`)
        .attach('annotations', DEMOS[7].annotations || '')
        .expect(200)
    })
  })

  test('GET /api/projects', async () => {
    await createSeedProject(JWT)

    const res = await supertest(app).get('/api/projects/').set('Authorization', `Bearer ${JWT}`).expect(200)

    expect(res.body.data.length).toBeDefined()
    expect(res.body.data).toMatchObject(
      expect.arrayContaining([
        expect.objectContaining({
          _id: expect.any(String),
          name: expect.any(String),
          client: expect.any(String),
          admins: expect.any(Array),
          users: expect.any(Array),
          dataScientists: expect.any(Array),
          itemCount: expect.any(Number),
          commentCount: expect.any(Number),
          deadline: expect.anything(),
          // lastAnnotationTime: expect.anything(),
          updatedAt: expect.anything(),
        }),
      ])
    )
    expect(res.body.count).toBeDefined()
    expect(res.body.limit).toBeDefined()
    expect(res.body.pageCount).toBeDefined()
    expect(res.body.total).toBeDefined()
  })

  test('GET /api/projects/:_id', async () => {
    const project = await createSeedProject(JWT)

    const res = await supertest(app)
      .get(`/api/projects/${project._id}`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)

    expect(res.body.admins).toBeDefined()
    expect(res.body.users).toBeDefined()
    expect(res.body.dataScientists).toBeDefined()
    expect(res.body.itemCount).toBeDefined()
    expect(res.body.commentCount).toBeDefined()
    expect(res.body.deadline).toBeDefined()
    expect(res.body.progress).toBeDefined()
    expect(res.body.velocity).toBeDefined()
    expect(res.body.remainingWork).toBeDefined()
    expect(res.body.lastAnnotationTime).toBeDefined()
    expect(res.body.name).toBeDefined()
    expect(res.body._id).toBeDefined()
    expect(res.body.updatedAt).toBeDefined()
    expect(res.body.createdAt).toBeDefined()
    expect(res.body.status).toBeDefined()
    expect(res.body.defaultTags).toBeDefined()
    expect(res.body.active).toBeDefined()
    expect(res.body.filterPredictionsMinimum).toBeDefined()
    expect(res.body.highlights).toBeDefined()
    expect(res.body.showPredictions).toBeDefined()
    expect(res.body.prefillPredictions).toBeDefined()
    expect(res.body.description).toBeDefined()
    expect(res.body.type).toBeDefined()
    expect(res.body.client).toBeDefined()

    expect(res.body.tasks).toBeDefined()
    expect(res.body.tasks.length).toBeTruthy()
    expect(typeof res.body.tasks[0]).toBe('object')
  })

  test('GET /api/projects/users/:_id', async () => {
    const project: Project = await createSeedProject(JWT)

    const { body: users }: { body: { email: string }[] } = await supertest(app)
      .get(`/api/projects/users/${project._id}`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)

    expect(users).toHaveLength(3)
    const foundAdmin = users.find((u) => u.email === project.admins[0])
    expect(foundAdmin).toHaveProperty('firstName', 'Admin')
    expect(foundAdmin).toHaveProperty('lastName', 'Test')
  })

  test('GET /api/projects/:_id/exports', async () => {
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
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)
      .then((res) => res.body._id)

    await supertest(app)
      .post(`/api/projects/${_id}/items/${itemToAnnotateId}/annotate`)
      .set('Authorization', `Bearer ${JWT}`)
      .send(payload)
      .expect(200)

    const res = await supertest(app)
      .get(`/api/projects/${_id}/exports`)
      .set('Authorization', `Bearer ${JWT}`)
      .set('content-type', 'application/json')
      .expect('Content-Type', 'application/zip')
      .expect(200)
      .parse(binaryParser)
      .buffer()

    const zip = await unzip.Open.buffer(res.body)
    expect(zip.files.find((f) => f.path === 'items.jsonlines')).toBeDefined()
  })

  test('GET /api/projects/:_id/exports?annotationsAndComments=true&withHistory=true should return ner historicAnnotations', async () => {
    const { _id } = await createSeedProject(JWT, DEMOS[2])

    const payload1 = {
      annotations: [
        {
          value: 'skill',
          ner: { start: 0, end: 10 },
        },
        {
          value: 'Exp',
          ner: { start: 30, end: 40 },
        },
      ],
    }

    const payload2 = {
      annotations: [
        {
          value: 'Exp',
          ner: { start: 30, end: 40 },
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
      .send(payload1)
      .expect(200)

    await supertest(app)
      .post(`/api/projects/${_id}/items/${itemToAnnotateId}/annotate`)
      .set('Authorization', `Bearer ${JWT}`)
      .send(payload2)
      .expect(200)

    const res = await supertest(app)
      .get(`/api/projects/${_id}/exports?annotationsAndComments=true&withHistory=true`)
      .set('Authorization', `Bearer ${JWT}`)
      .set('content-type', 'application/json')
      .expect('Content-Type', 'application/zip')
      .expect(200)
      .parse(binaryParser)
      .buffer()

    const [line] = await getLinesFromZip('annotations.jsonlines', res)
    const annotation = JSON.parse(line)

    expect(annotation).toBeTruthy()
    expect(annotation).toHaveProperty('annotation')
    // project seeds contains all a metadata field to test export
    expect(annotation).toHaveProperty('historicAnnotations')
    expect(annotation.historicAnnotations).toHaveProperty('length', 1)
    expect(annotation.historicAnnotations[0]).toHaveProperty('ner')
    expect(annotation.historicAnnotations[0].ner).toHaveProperty('Entities')
    expect(annotation.historicAnnotations[0].ner.Entities).toHaveProperty('entities')
    expect(annotation.historicAnnotations[0].ner.Entities.entities).toHaveProperty('length', 1)
    expect(annotation.historicAnnotations[0].ner.Entities.entities[0]).toHaveProperty('createdAt')
    expect(annotation.historicAnnotations[0].ner.Entities.entities[0]).toHaveProperty('updatedAt')
    expect(annotation.historicAnnotations[0].ner.Entities.entities[0]).toHaveProperty('end_char')
    expect(annotation.historicAnnotations[0].ner.Entities.entities[0]).toHaveProperty('start_char')
    expect(annotation.historicAnnotations[0].ner.Entities.entities[0]).toHaveProperty('ent_id')
    expect(annotation.historicAnnotations[0].ner.Entities.entities[0]).toHaveProperty('value')
  })

  test('GET /api/projects/:_id/exports?annotationsAndComments=true&withHistory=true should return zone historicAnnotations', async () => {
    const { _id } = await createSeedProject(JWT)

    const payload1 = {
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

    const payload2 = {
      annotations: [
        {
          value: 'bbox_name',
          zone: [
            { x: 0.1, y: 0.2 },
            { x: 0.2, y: 0.3 },
            { x: 0.3, y: 0.4 },
          ],
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
      .send(payload1)
      .expect(200)

    await supertest(app)
      .post(`/api/projects/${_id}/items/${itemToAnnotateId}/annotate`)
      .set('Authorization', `Bearer ${JWT}`)
      .send(payload2)
      .expect(200)

    const res = await supertest(app)
      .get(`/api/projects/${_id}/exports?annotationsAndComments=true&withHistory=true`)
      .set('Authorization', `Bearer ${JWT}`)
      .set('content-type', 'application/json')
      .expect('Content-Type', 'application/zip')
      .expect(200)
      .parse(binaryParser)
      .buffer()

    const [line] = await getLinesFromZip('annotations.jsonlines', res)
    const annotation = JSON.parse(line)

    expect(annotation).toBeTruthy()
    expect(annotation).toHaveProperty('annotation')
    // project seeds contains all a metadata field to test export
    expect(annotation).toHaveProperty('historicAnnotations')
    expect(annotation.historicAnnotations).toHaveProperty('length', 1)
    expect(annotation.historicAnnotations[0]).toMatchObject({
      zone: {
        bboxes: {
          entities: [
            {
              value: 'bbox_name',
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
              coords: [
                { x: 0.1, y: 0.1 },
                { x: 0.2, y: 0.2 },
                { x: 0.3, y: 0.3 },
              ],
            },
          ],
        },
      },
    })
  })

  test('GET /api/projects/:_id/exports Export should not contain superfluous properties', async () => {
    const { _id } = await createSeedProject(JWT)

    const res = await supertest(app)
      .get(`/api/projects/${_id}/exports?config=true`)
      .set('Authorization', `Bearer ${JWT}`)
      .set('content-type', 'application/json')
      .expect('Content-Type', 'application/zip')
      .expect(200)
      .parse(binaryParser)
      .buffer()

    const json = await getConfigFromZip(res)
    expect(json).toHaveProperty('tasks')
    expect(Array.isArray(json.tasks)).toBeTruthy()
    expect(json.tasks).toHaveLength(6)
  })

  test('GET /api/projects/:_id/exports?annotationsAndComments=true Export should contain OCR text', async () => {
    const { _id } = await createSeedProject(JWT)

    const payload = {
      annotations: [
        {
          value: 'textInput2',
          text: 'This is sehh',
        },
        {
          value: 'bbox_Exp',
          zone: [
            { x: 0.31386861313868614, y: 0.5480225988700564 },
            { x: 0.8686131386861314, y: 0.5480225988700564 },
            { x: 0.8686131386861314, y: 0.22598870056497175 },
            { x: 0.31386861313868614, y: 0.22598870056497175 },
          ],
        },
        {
          value: 'bbox_Exp',
          zone: [
            { x: 0.4845528455284553, y: 0.01264367816091954 },
            { x: 0.9707317073170731, y: 0.016091954022988506 },
            { x: 0.9739837398373984, y: 0.11609195402298851 },
            { x: 0.4878048780487805, y: 0.1103448275862069 },
          ],
        },
        {
          value: 'textInput1',
          text: 'This is a prediction',
        },
      ],
      entitiesRelations: <[]>[],
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

    const res = await supertest(app)
      .get(`/api/projects/${_id}/exports?annotationsAndComments=true`)
      .set('Authorization', `Bearer ${JWT}`)
      .set('content-type', 'application/json')
      .expect('Content-Type', 'application/zip')
      .expect(200)
      .parse(binaryParser)
      .buffer()

    const [line] = await getLinesFromZip('annotations.jsonlines', res)
    const json = JSON.parse(line)

    expect(json).toBeTruthy()
    expect(json).toHaveProperty('annotation')
    // project seeds contains all a metadata field to test export
    expect(json).toHaveProperty('metadata')
    expect(json.annotation).toHaveProperty('text')
    expect(json.annotation.text).toHaveProperty('Text Recognition task')
    expect(json.annotation.text['Text Recognition task']).toHaveProperty('entities')
    const { entities } = json.annotation.text['Text Recognition task']
    expect(entities).toBeInstanceOf(Array)
    expect(entities).toHaveLength(2)
    expect(entities).toEqual(
      expect.arrayContaining([
        { text: 'This is a prediction', value: 'textInput1' },
        { text: 'This is sehh', value: 'textInput2' },
      ])
    )
  })

  test('GET /api/projects/:_id/exports?annotationsAndComments=true Export should contain NER-relations annotations', async () => {
    const { _id } = await createSeedProject(JWT, DEMOS[2])
    const nerAndRelationAnnotation = {
      annotations: [
        {
          value: 'skill',
          ner: { start: 0, end: 10 },
        },
        {
          value: 'formation',
          ner: { start: 15, end: 20 },
        },
        {
          value: 'Exp',
          ner: { start: 30, end: 40 },
        },
      ],
      entitiesRelations: [
        {
          src: {
            value: 'Exp',
            ner: { start: 30, end: 40 },
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
            value: 'Exp',
            ner: { start: 30, end: 40 },
          },
          dest: {
            value: 'skill',
            ner: { start: 0, end: 10 },
          },
          value: 'is_unit',
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
      .send(nerAndRelationAnnotation)
      .expect(200)

    const res = await supertest(app)
      .get(`/api/projects/${_id}/exports?annotationsAndComments=true`)
      .set('Authorization', `Bearer ${JWT}`)
      .set('content-type', 'application/json')
      .expect('Content-Type', 'application/zip')
      .expect(200)
      .parse(binaryParser)
      .buffer()

    const [line] = await getLinesFromZip('annotations.jsonlines', res)
    const json = JSON.parse(line)

    expect(json).toBeTruthy()
    expect(json).toHaveProperty('annotation')

    const annotationsExport: { entities: { value: string; start_char: number; end_char: number; ent_id: number }[] } =
      json.annotation.ner.Entities
    const relationsExport: { label: string; src: number; dest: number }[] = json.annotation.ner.relations

    expect(annotationsExport.entities.length).toBeTruthy()
    expect(annotationsExport.entities).toHaveLength(nerAndRelationAnnotation.annotations.length)
    expect(relationsExport.length).toBeTruthy()
    expect(relationsExport).toHaveLength(nerAndRelationAnnotation.entitiesRelations.length)

    /*
			 Assert that for annotation payload :
			 {
						"src": {
								"value": "classif1",
								"ner": {
										"start": 230,
										"end": 241
								}
						},
						"dest": {
								"value": "classif2",
								"ner": {
										"start": 242,
										"end": 248
								}
						},
						"value": "is_line_extremity"
				}

				export .relations is :
				{
					"label": "is_line_extremity",
					"src": 0, // id of this classif1 ner annotation in export .annotations
					"dest": 1 // id of this classif2 ner annotation in export .annotations
				}
		*/
    const expectedRelationsExport = nerAndRelationAnnotation.entitiesRelations.map((relation) => {
      const src = annotationsExport.entities.find(
        (e) =>
          e.value === relation.src.value &&
          e.start_char === relation.src.ner.start &&
          e.end_char === relation.src.ner.end
      )

      const dest = annotationsExport.entities.find(
        (e) =>
          e.value === relation.dest.value &&
          e.start_char === relation.dest.ner.start &&
          e.end_char === relation.dest.ner.end
      )

      return {
        label: relation.value,
        src: src && src.ent_id,
        dest: dest && dest.ent_id,
      }
    })
    expect(relationsExport).toEqual(expectedRelationsExport)
  })

  test('GET 404 /api/projects/:_id', async () => {
    return supertest(app)
      .get(`/api/projects/${mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(404)
  })

  test('GET /api/projects/:_id/items/tags', async () => {
    const project = await createSeedProject(JWT)

    const res = await supertest(app)
      .get(`/api/projects/${project._id}/items/tags`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200)

    expect(res.body).toEqual(defaultTags)
  })

  test('DELETE /api/projects/:_id', async () => {
    const project = await createSeedProject(JWT)

    await supertest(app).delete(`/api/projects/${project._id}`).set('Authorization', `Bearer ${JWT}`).expect(200)

    return supertest(app).get(`/api/projects/${project._id}`).set('Authorization', `Bearer ${JWT}`).expect(404)
  })

  test('DELETE 404 /api/projects/:_id', async () => {
    return supertest(app)
      .delete(`/api/projects/${mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(404)
  })
})
