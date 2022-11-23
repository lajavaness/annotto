import { renderHook } from '@testing-library/react-hooks'
import { useSelector } from 'react-redux'

import useProjectPrivileges from 'shared/hooks/useProjectPrivileges'

import { ADMIN, USER } from 'shared/enums/rolesTypes'
import { DELETE_PROJECT, EDIT_PROJECT_EXPORT, VIEW_PROJECT } from 'shared/enums/privilegesTypes'

jest.mock('react-redux', () => ({
	...jest.requireActual('react-redux'),
	useSelector: jest.fn(),
}))

describe('hooks - useProjectPrivileges', () => {
	const consoleError = console.error
	beforeEach(() => {
		console.error = () => {}
	})

	afterEach(() => {
		useSelector.mockClear()
		console.error = consoleError
	})

	it('returns false if privilege is not passed in argument of the return function', () => {
		const email = 'foo@lajavaness.com'
		const state = {
			auth: {
				userInfo: {
					_id: 'foo',
					email,
					profile: {
						_id: 'foo',
						roles: [ADMIN],
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
		} = renderHook(() => useProjectPrivileges())

		expect(hasPrivilege()).toBeFalsy()
	})

	it('returns true if the user is admin of the app', () => {
		const email = 'foo@lajavaness.com'
		const state = {
			auth: {
				userInfo: {
					_id: 'foo',
					email,
					profile: {
						_id: 'foo',
						roles: [ADMIN],
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
		} = renderHook(() => useProjectPrivileges())

		expect(hasPrivilege(DELETE_PROJECT)).toBeTruthy()
	})

	it('returns true if the role of the user in the current project have the privilege', () => {
		const email = 'foo@lajavaness.com'
		const state = {
			auth: {
				userInfo: {
					_id: 'foo',
					email,
					profile: {
						_id: 'foo',
						roles: [USER],
						user: 'bar',
					},
				},
			},
			project: {
				data: {
					admins: [email],
					dataScientists: ['bar@lajavaness.com'],
					users: ['zog@lajavaness.com'],
				},
			},
		}

		useSelector.mockImplementation((callback) => {
			return callback(state)
		})

		const {
			result: { current: hasPrivilege },
		} = renderHook(() => useProjectPrivileges())

		expect(hasPrivilege(DELETE_PROJECT)).toBeTruthy()
	})

	it('returns false if the role of the user in the current project does not have the privilege', () => {
		const email = 'foo@lajavaness.com'
		const state = {
			auth: {
				userInfo: {
					_id: 'foo',
					email,
					profile: {
						_id: 'foo',
						roles: USER,
						user: 'bar',
					},
				},
			},
			project: {
				data: {
					admins: ['zog@lajavaness.com'],
					dataScientists: ['bar@lajavaness.com'],
					users: [email],
				},
			},
		}

		useSelector.mockImplementation((callback) => {
			return callback(state)
		})

		const {
			result: { current: hasPrivilege },
		} = renderHook(() => useProjectPrivileges())

		expect(hasPrivilege(DELETE_PROJECT)).toBeFalsy()
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
		} = renderHook(() => useProjectPrivileges())

		expect(hasPrivilege(VIEW_PROJECT)).toBeFalsy()
	})

	it('returns false if the user does not have email', () => {
		const state = {
			root: {
				user: {
					_id: 'foo',
					email: null,
				},
			},
		}

		useSelector.mockImplementation((callback) => {
			return callback(state)
		})

		const {
			result: { current: hasPrivilege },
		} = renderHook(() => useProjectPrivileges())

		expect(hasPrivilege(VIEW_PROJECT)).toBeFalsy()
	})

	it('returns project role  if the role of the user is not in the roles of the current project', () => {
		const email = 'foo@lajavaness.com'
		const state = {
			auth: {
				userInfo: {
					_id: 'foo',
					email,
					profile: {
						_id: 'foo',
						roles: [USER],
						user: 'bar',
					},
				},
			},
			project: {
				data: {
					admins: ['zog@lajavaness.com'],
					dataScientists: ['bar@lajavaness.com'],
					users: ['anotherEmail@lajavaness.com'],
				},
			},
		}

		useSelector.mockImplementation((callback) => {
			return callback(state)
		})

		const {
			result: { current: hasPrivilege },
		} = renderHook(() => useProjectPrivileges())

		expect(hasPrivilege(VIEW_PROJECT)).toBeTruthy()
		expect(hasPrivilege(EDIT_PROJECT_EXPORT)).toBeFalsy()
	})
})
