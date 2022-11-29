import {
  FETCH_PROJECT_FILTER,
  FETCH_PROJECT_FILTER_FAILURE,
  FETCH_PROJECT_FILTER_OPERATORS,
  FETCH_PROJECT_FILTER_OPERATORS_FAILURE,
  FETCH_PROJECT_FILTER_OPERATORS_SUCCESS,
  FETCH_PROJECT_FILTER_SUCCESS,
  POST_PROJECT_FILTER,
  POST_PROJECT_FILTER_FAILURE,
  POST_PROJECT_FILTER_SUCCESS,
  fetchProjectFilter,
  fetchProjectFilterFailure,
  fetchProjectFilterOperators,
  fetchProjectFilterOperatorsFailure,
  fetchProjectFilterOperatorsSuccess,
  fetchProjectFilterSuccess,
  postProjectFilter,
  postProjectFilterFailure,
  postProjectFilterSuccess,
} from 'modules/project/actions/filterActions'

describe('fetchProjectFilter', () => {
  it('returns type', () => {
    const { type } = fetchProjectFilter()
    expect(type).toBe(FETCH_PROJECT_FILTER)
  })

  it('returns payload', () => {
    const projectId = 1
    const { payload } = fetchProjectFilter(projectId)
    expect(payload).toEqual({ projectId })
  })
})

describe('fetchProjectFilterSuccess', () => {
  it('returns type', () => {
    const { type } = fetchProjectFilterSuccess()
    expect(type).toBe(FETCH_PROJECT_FILTER_SUCCESS)
  })

  it('returns payload', () => {
    const filter = ['Foo']
    const { payload } = fetchProjectFilterSuccess(filter)
    expect(payload).toEqual({ filter })
  })
})

describe('fetchProjectFilterFailure', () => {
  it('returns type', () => {
    const { type } = fetchProjectFilterFailure()
    expect(type).toBe(FETCH_PROJECT_FILTER_FAILURE)
  })

  it('returns payload', () => {
    const error = new Error('foo')
    const { payload } = fetchProjectFilterFailure(error)
    expect(payload).toEqual({ error, errorString: error.toString() })
  })
})

describe('postProjectFilter', () => {
  it('returns type', () => {
    const { type } = postProjectFilter()
    expect(type).toBe(POST_PROJECT_FILTER)
  })

  it('returns payload', () => {
    const projectId = 1
    const filters = ['foo']
    const { payload } = postProjectFilter(projectId, filters)
    expect(payload).toEqual({ projectId, filters })
  })
})

describe('postProjectFilterSuccess', () => {
  it('returns type', () => {
    const { type } = postProjectFilterSuccess()
    expect(type).toBe(POST_PROJECT_FILTER_SUCCESS)
  })

  it('returns payload', () => {
    const filter = ['Foo']
    const { payload } = postProjectFilterSuccess(filter)
    expect(payload).toEqual({ filter })
  })
})

describe('postProjectFilterFailure', () => {
  it('returns type', () => {
    const { type } = postProjectFilterFailure()
    expect(type).toBe(POST_PROJECT_FILTER_FAILURE)
  })

  it('returns payload', () => {
    const error = new Error('foo')
    const { payload } = postProjectFilterFailure(error)
    expect(payload).toEqual({ error, errorString: error.toString() })
  })
})

describe('fetchProjectFilterOperators', () => {
  it('returns type', () => {
    const { type } = fetchProjectFilterOperators()
    expect(type).toBe(FETCH_PROJECT_FILTER_OPERATORS)
  })

  it('returns payload', () => {
    const projectId = 1
    const { payload } = fetchProjectFilterOperators(projectId)
    expect(payload).toEqual({ projectId })
  })
})

describe('fetchProjectFilterOperatorsSuccess', () => {
  it('returns type', () => {
    const { type } = fetchProjectFilterOperatorsSuccess()
    expect(type).toBe(FETCH_PROJECT_FILTER_OPERATORS_SUCCESS)
  })

  it('returns payload', () => {
    const operators = ['Foo']
    const { payload } = fetchProjectFilterOperatorsSuccess(operators)
    expect(payload).toEqual({ operators })
  })
})

describe('fetchProjectFilterOperatorsFailure', () => {
  it('returns type', () => {
    const { type } = fetchProjectFilterOperatorsFailure()
    expect(type).toBe(FETCH_PROJECT_FILTER_OPERATORS_FAILURE)
  })

  it('returns payload', () => {
    const error = new Error('foo')
    const { payload } = fetchProjectFilterOperatorsFailure(error)
    expect(payload).toEqual({ error, errorString: error.toString() })
  })
})
