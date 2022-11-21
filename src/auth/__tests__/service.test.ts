import mongoose from 'mongoose'
import ProfileModel, { Profile, ProfileDocument } from '../../db/models/profiles'
import { Project } from '../../db/models/projects'
import { haveAccessRole } from '../service'

const mockFindOneLean = jest.fn()
jest.spyOn(ProfileModel, 'findOne').mockImplementation(
  () => <mongoose.Query<ProfileDocument, ProfileDocument, undefined, Profile>>(<unknown>{
      lean: mockFindOneLean,
    })
)

jest.spyOn(ProfileModel.prototype, 'save').mockImplementation(() => Promise.resolve())

describe('role/profile access', () => {
  test('haveAccessRole - projectRole not exist', () => {
    const projectRole = 'cooker'
    const email = 'user@test.com'
    const _project = <Project>(<unknown>{
      users: ['user@test.com'],
      dataScientists: [],
      admins: [],
    })
    expect(haveAccessRole(projectRole, email, _project)).toBeUndefined()
  })
  test('haveAccessRole - projectRole dataScientists as user', () => {
    const projectRole = 'dataScientist'
    const email = 'user@test.com'
    const _project = <Project>(<unknown>{
      users: ['user@test.com'],
      dataScientists: [],
      admins: [],
    })
    expect(haveAccessRole(projectRole, email, _project)).toBe(false)
  })
  test('haveAccessRole - projectRole user as dataScientist', () => {
    const projectRole = 'user'
    const email = 'user@test.com'
    const _project = <Project>(<unknown>{
      users: [],
      dataScientists: ['user@test.com'],
      admins: [],
    })
    expect(haveAccessRole(projectRole, email, _project)).toBe(true)
  })
  test('haveAccessRole - projectRole user as user', () => {
    const projectRole = 'user'
    const email = 'user@test.com'
    const _project = <Project>(<unknown>{
      users: ['user@test.com'],
      dataScientists: [],
      admins: [],
    })
    expect(haveAccessRole(projectRole, email, _project)).toBe(true)
  })
})
