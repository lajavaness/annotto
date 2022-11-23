import {
	FETCH_PROJECTS,
	FETCH_PROJECTS_FAILURE,
	FETCH_PROJECTS_SUCCESS,
	STARTUP,
	STARTUP_FAILURE,
	STARTUP_SUCCESS,
	fetchProjects,
	fetchProjectsFailure,
	fetchProjectsSuccess,
	startup,
	startupFailure,
	startupSuccess,
} from 'modules/projects/actions/projectsActions'

describe('projectsActions', () => {
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
			const err = new Error('project')
			const { payload } = startupFailure(err)
			expect(payload).toEqual({ error: err, errorString: err && err.toString() })
		})
	})

	describe('fetchProjects', () => {
		it('returns type', () => {
			const { type } = fetchProjects()
			expect(type).toBe(FETCH_PROJECTS)
		})

		it('returns payload', () => {
			const index = 1
			const limit = 10
			const { payload } = fetchProjects(index, limit)
			expect(payload).toEqual({ index, limit })
		})
	})

	describe('fetchProjectsSuccess', () => {
		it('returns type', () => {
			const { type } = fetchProjectsSuccess()
			expect(type).toBe(FETCH_PROJECTS_SUCCESS)
		})

		it('returns payload', () => {
			const projects = ['Foo']
			const { payload } = fetchProjectsSuccess(projects)
			expect(payload).toEqual({ projects })
		})
	})

	describe('fetchProjectsFailure', () => {
		it('returns type', () => {
			const { type } = fetchProjectsFailure()
			expect(type).toBe(FETCH_PROJECTS_FAILURE)
		})

		it('returns payload', () => {
			const error = new Error('foo')
			const { payload } = fetchProjectsFailure(error)
			expect(payload).toEqual({ error, errorString: error.toString() })
		})
	})
})
