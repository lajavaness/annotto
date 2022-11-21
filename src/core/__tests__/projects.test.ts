import mongoose from 'mongoose'
import crypto from 'crypto'
import ItemModel from '../../db/models/items'
import LogModel from '../../db/models/logs'
import ProjectModel, { Project } from '../../db/models/projects'
import { getProjectTags, saveProject, validateTasksAndAddObject } from '../projects'
import { logProject } from '../logs'
import { saveItem } from '../items'
import mongoSetupTeardown from './mongoSetupTeardown'

mongoSetupTeardown()

describe('logs', () => {
  const createProject = () => {
    const project = new ProjectModel({ name: 'myProject' })

    return saveProject(project, {
      _id: new mongoose.Types.ObjectId().toString(),
      email: `${crypto.randomBytes(10).toString('hex')}@lajavaness.com`,
      firstName: `${crypto.randomBytes(10).toString('hex')}`,
      lastName: `${crypto.randomBytes(10).toString('hex')}@lajavaness.com`,
    })
  }

  test('logProject - new', async () => {
    const project = await createProject()
    project._wasNew = true

    const res = await logProject(project)
    expect(res && res._id).toBeDefined()
    expect(res && res.type).toBe('project-add')
    expect(res && res.user).toEqual(project._user)
  })

  test('logProject - not new', async () => {
    const project = await createProject()

    project._wasNew = false
    const res = await logProject(project)
    expect(res).toBeFalsy()
  })

  describe('tags', () => {
    test('$addToSet', async () => {
      const project = await createProject()

      const newItem = new ItemModel({ tags: ['a', 'b'], project: project._id })
      await saveItem(newItem)

      expect(await getProjectTags(project._id)).toEqual(['a', 'b'])

      const item = await ItemModel.findById(newItem._id)
      if (item) {
        item.tags = ['b', 'c']
        await saveItem(item)
      }
      expect(await getProjectTags(project._id)).toEqual(['a', 'b', 'c'])
    })
  })
})

describe('Project creation', () => {
  const user = {
    _id: new mongoose.Types.ObjectId().toString(),
    firstName: 'Taylor',
    lastName: 'Durden',
    email: 'taylor@theclub.com',
  }
  const createProject = () => {
    const payload = {
      name: crypto.randomBytes(10).toString('hex'),
      description: crypto.randomBytes(10).toString('hex'),
      active: true,
    }

    const newProject = new ProjectModel(payload)
    return saveProject(newProject, user)
  }

  test('create', async () => {
    const project = await createProject()

    expect(project._id).toBeDefined()
    expect(project.name).toBeDefined()
    expect(project.description).toBeDefined()
    expect(project.active).toBeDefined()
  })

  test('project logs', async () => {
    const project = await createProject()

    const logs = await LogModel.find({ project: project._id })

    expect(logs[0]._id).toBeDefined()
    expect(logs[0].type).toBe('project-add')
    expect(logs[0].user._id).toEqual(user._id)
    expect(logs[0].user.email).toEqual(user.email)
    expect(logs[0].user.firstName).toEqual(user.firstName)
    expect(logs[0].user.lastName).toEqual(user.lastName)
  })
})

describe('Projects statics', () => {
  const parent = {
    _id: new mongoose.Types.ObjectId(),
    value: 'RA',
  }

  const child = {
    _id: new mongoose.Types.ObjectId(),
    value: 'RA_01',
  }

  const tasks = [parent, child]

  test('validateIdsWithProject - valid', () => {
    const annotations = {
      annotations: [{ value: 'RA' }],
    }

    expect(() => validateTasksAndAddObject(<Project>{ tasks }, annotations)).not.toThrow()
  })

  test('validateIdsWithProject - invalid', () => {
    const annotations = {
      annotations: [{ value: 'RA' }, { value: 'FOO' }],
    }

    expect(() => validateTasksAndAddObject(<Project>{ tasks }, annotations)).toThrow()
  })
})
