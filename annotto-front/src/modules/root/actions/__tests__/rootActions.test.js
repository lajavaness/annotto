import {
	FETCH_CLIENTS,
	FETCH_CLIENTS_FAILURE,
	FETCH_CLIENTS_SUCCESS,
	FETCH_PROJECT,
	FETCH_PROJECT_FAILURE,
	FETCH_PROJECT_SUCCESS,
	FETCH_USERS,
	FETCH_USERS_FAILURE,
	FETCH_USERS_SUCCESS,
	LOGOUT,
	LOGOUT_FAILURE,
	LOGOUT_SUCCESS,
	SET_EXPIRATION_DATE,
	SET_EXPIRATION_DATE_FAILURE,
	SET_EXPIRATION_DATE_SUCCESS,
	STARTUP,
	STARTUP_FAILURE,
	STARTUP_SUCCESS,
	fetchClients,
	fetchClientsFailure,
	fetchClientsSuccess,
	fetchProject,
	fetchProjectFailure,
	fetchProjectSuccess,
	fetchUsers,
	fetchUsersFailure,
	fetchUsersSuccess,
	logout,
	logoutFailure,
	logoutSuccess,
	setExpirationDate,
	setExpirationDateFailure,
	setExpirationDateSuccess,
	startup,
	startupFailure,
	startupSuccess,
} from 'modules/root/actions/rootActions'

describe('rootActions', () => {
	describe('startup', () => {
		it('returns type', () => {
			const { type } = startup()
			expect(type).toBe(STARTUP)
		})
	})

	describe('startupSuccess', () => {
		it('returns type', () => {
			const { type } = startupSuccess()
			expect(type).toBe(STARTUP_SUCCESS)
		})
	})

	describe('startupFailure', () => {
		it('returns type', () => {
			const { type } = startupFailure()
			expect(type).toBe(STARTUP_FAILURE)
		})

		it('returns payload', () => {
			const err = new Error('root')
			const { payload } = startupFailure(err)
			expect(payload).toEqual({ error: err, errorString: err && err.toString() })
		})
	})

	describe('setExpirationDate', () => {
		it('returns type', () => {
			const { type } = setExpirationDate()
			expect(type).toBe(SET_EXPIRATION_DATE)
		})

		it('returns payload', () => {
			const { payload } = setExpirationDate('foo')
			expect(payload).toEqual({ expirationDate: 'foo' })
		})
	})

	describe('setExpirationDateSuccess', () => {
		it('returns type', () => {
			const { type } = setExpirationDateSuccess()
			expect(type).toBe(SET_EXPIRATION_DATE_SUCCESS)
		})

		it('returns payload', () => {
			const { payload } = setExpirationDateSuccess('foo')
			expect(payload).toEqual({ expirationDate: 'foo' })
		})
	})

	describe('setExpirationDateFailure', () => {
		it('returns type', () => {
			const { type } = setExpirationDateFailure()
			expect(type).toBe(SET_EXPIRATION_DATE_FAILURE)
		})

		it('returns payload', () => {
			const err = new Error('error')
			const { payload } = setExpirationDateFailure(err)
			expect(payload).toEqual({ error: err, errorString: err && err.toString() })
		})
	})

	describe('logout', () => {
		it('returns type', () => {
			const { type } = logout()
			expect(type).toBe(LOGOUT)
		})
	})

	describe('logoutSuccess', () => {
		it('returns type', () => {
			const { type } = logoutSuccess()
			expect(type).toBe(LOGOUT_SUCCESS)
		})
	})

	describe('logoutFailure', () => {
		it('returns type', () => {
			const { type } = logoutFailure()
			expect(type).toBe(LOGOUT_FAILURE)
		})

		it('returns payload', () => {
			const err = new Error('error')
			const { payload } = logoutFailure(err)
			expect(payload).toEqual({ error: err, errorString: err && err.toString() })
		})
	})

	describe('fetchUsers', () => {
		it('returns type', () => {
			const { type } = fetchUsers()
			expect(type).toBe(FETCH_USERS)
		})

		it('returns payload', () => {
			const query = 'foo'
			const { payload } = fetchUsers(query)
			expect(payload).toEqual({ query })
		})
	})

	describe('fetchUsersSuccess', () => {
		it('returns type', () => {
			const { type } = fetchUsersSuccess()
			expect(type).toBe(FETCH_USERS_SUCCESS)
		})

		it('returns payload', () => {
			const users = ['Foo']
			const { payload } = fetchUsersSuccess(users)
			expect(payload).toEqual({ users })
		})
	})

	describe('fetchUsersFailure', () => {
		it('returns type', () => {
			const { type } = fetchUsersFailure()
			expect(type).toBe(FETCH_USERS_FAILURE)
		})

		it('returns payload', () => {
			const error = new Error('foo')
			const { payload } = fetchUsersFailure(error)
			expect(payload).toEqual({ error, errorString: error.toString() })
		})
	})

	describe('fetchProject', () => {
		it('returns type', () => {
			const { type } = fetchProject()
			expect(type).toBe(FETCH_PROJECT)
		})

		it('returns payload', () => {
			const projectId = 1
			const { payload } = fetchProject(projectId)
			expect(payload).toEqual({ projectId })
		})
	})

	describe('fetchProjectSuccess', () => {
		it('returns type', () => {
			const { type } = fetchProjectSuccess()
			expect(type).toBe(FETCH_PROJECT_SUCCESS)
		})

		it('returns payload', () => {
			const project = 'Foo'
			const { payload } = fetchProjectSuccess(project)
			expect(payload).toEqual({ project })
		})
	})

	describe('fetchProjectFailure', () => {
		it('returns type', () => {
			const { type } = fetchProjectFailure()
			expect(type).toBe(FETCH_PROJECT_FAILURE)
		})

		it('returns payload', () => {
			const error = new Error('foo')
			const { payload } = fetchProjectFailure(error)
			expect(payload).toEqual({ error, errorString: error.toString() })
		})

		describe('fetchClients', () => {
			it('returns type', () => {
				const { type } = fetchClients()
				expect(type).toBe(FETCH_CLIENTS)
			})

			it('returns payload', () => {
				const query = 'foo'
				const { payload } = fetchClients(query)
				expect(payload).toEqual({ query })
			})
		})

		describe('fetchClientsSuccess', () => {
			it('returns type', () => {
				const { type } = fetchClientsSuccess()
				expect(type).toBe(FETCH_CLIENTS_SUCCESS)
			})

			it('returns payload', () => {
				const clients = ['Foo']
				const { payload } = fetchClientsSuccess(clients)
				expect(payload).toEqual({ clients })
			})
		})

		describe('fetchClientsFailure', () => {
			it('returns type', () => {
				const { type } = fetchClientsFailure()
				expect(type).toBe(FETCH_CLIENTS_FAILURE)
			})

			it('returns payload', () => {
				const error = new Error('foo')
				const { payload } = fetchClientsFailure(error)
				expect(payload).toEqual({ error, errorString: error.toString() })
			})
		})
	})
})
