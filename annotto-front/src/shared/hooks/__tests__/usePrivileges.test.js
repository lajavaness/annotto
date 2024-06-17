import { renderHook } from '@testing-library/react-hooks/dom'
import { useSelector } from 'react-redux'

import usePrivileges from 'shared/hooks/usePrivileges'

import { CREATE_PROJECT, VIEW_PROJECT } from 'shared/enums/privilegesTypes'
import { USER } from 'shared/enums/rolesTypes'

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}))

describe('hooks - usePrivileges', () => {
  afterEach(() => {
    useSelector.mockClear()
  })

  it('returns true if the role of the user have the privilege', () => {
    const state = {
      auth: {
        userInfo: {
          _id: 'foo',
          email: 'foo',
          profile: {
            _id: 'foo',
            roles: [USER],
            user: 'bar',
          },
        },
      },
    }

    useSelector.mockImplementation((callback) => {
      return callback(state)
    })

    const {
      result: { current: hasPrivilege },
    } = renderHook(() => usePrivileges())

    expect(hasPrivilege(VIEW_PROJECT)).toBeTruthy()
  })

  it('returns if privilege is not passed in argument of the return function', () => {
    const state = {
      auth: {
        userInfo: {
          _id: 'foo',
          email: 'foo',
          profile: {
            _id: 'foo',
            roles: [USER],
            user: 'bar',
          },
        },
      },
    }

    useSelector.mockImplementation((callback) => {
      return callback(state)
    })

    const {
      result: { current: hasPrivilege },
    } = renderHook(() => usePrivileges())

    expect(hasPrivilege()).toBeFalsy()
  })

  it('returns false if the role of the user does not have the privilege', () => {
    const state = {
      auth: {
        userInfo: {
          _id: 'foo',
          email: 'foo',
          profile: {
            _id: 'foo',
            roles: [USER],
            user: 'bar',
          },
        },
      },
    }

    useSelector.mockImplementation((callback) => {
      return callback(state)
    })

    const {
      result: { current: hasPrivilege },
    } = renderHook(() => usePrivileges())

    expect(hasPrivilege(CREATE_PROJECT)).toBeFalsy()
  })

  it('returns false if no user', () => {
    const state = {
      root: {
        user: null,
      },
    }

    useSelector.mockImplementation((callback) => {
      return callback(state)
    })

    const {
      result: { current: hasPrivilege },
    } = renderHook(() => usePrivileges())

    expect(hasPrivilege(VIEW_PROJECT)).toBeFalsy()
  })

  it('returns false if the role of the user does not exist', () => {
    const role = 'foo'
    const state = {
      auth: {
        userInfo: {
          _id: 'foo',
          email: 'admin@lajavaness.com',
          profile: {
            _id: 'foo',
            roles: [role],
            user: 'bar',
          },
        },
      },
    }

    useSelector.mockImplementation((callback) => {
      return callback(state)
    })

    const {
      result: { current: hasPrivilege },
    } = renderHook(() => usePrivileges())

    expect(hasPrivilege(VIEW_PROJECT)).toBeFalsy()
  })

  it('returns false if the user does not have a role ', () => {
    const roles = null
    const state = {
      auth: {
        userInfo: {
          _id: 'foo',
          email: 'admin@lajavaness.com',
          profile: {
            _id: 'foo',
            roles,
            user: 'bar',
          },
        },
      },
    }

    useSelector.mockImplementation((callback) => {
      return callback(state)
    })

    const {
      result: { current: hasPrivilege },
    } = renderHook(() => usePrivileges())

    expect(hasPrivilege(VIEW_PROJECT)).toBeFalsy()
  })
})
