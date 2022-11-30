export const STARTUP = 'root/startup'
export const STARTUP_SUCCESS = 'root/startupSuccess'
export const STARTUP_FAILURE = 'root/startupFailure'

export const SET_EXPIRATION_DATE = 'root/setExpirationDate'
export const SET_EXPIRATION_DATE_SUCCESS = 'root/setExpirationDateSuccess'
export const SET_EXPIRATION_DATE_FAILURE = 'root/setExpirationDateFailure'

export const FETCH_USER = 'root/fetchUser'
export const FETCH_USER_SUCCESS = 'root/fetchUserSuccess'
export const FETCH_USER_FAILURE = 'root/fetchUserFailure'

export const FETCH_PROJECT = 'FETCH_PROJECT'
export const FETCH_PROJECT_SUCCESS = 'FETCH_PROJECT_SUCCESS'
export const FETCH_PROJECT_FAILURE = 'FETCH_PROJECT_FAILURE'

export const FETCH_CLIENTS = 'FETCH_CLIENTS'
export const FETCH_CLIENTS_SUCCESS = 'FETCH_CLIENTS_SUCCESS'
export const FETCH_CLIENTS_FAILURE = 'FETCH_CLIENTS_FAILURE'

export const FETCH_USERS = 'root/fetchUsers'
export const FETCH_USERS_SUCCESS = 'root/fetchUsersSuccess'
export const FETCH_USERS_FAILURE = 'root/fetchUsersFailure'

export const LOGOUT = 'root/logout'
export const LOGOUT_SUCCESS = 'root/logoutSuccess'
export const LOGOUT_FAILURE = 'root/logoutFailure'

export const startup = () => {
  return {
    type: STARTUP,
  }
}

export const startupSuccess = () => {
  return {
    type: STARTUP_SUCCESS,
  }
}

export const startupFailure = (err) => {
  return {
    type: STARTUP_FAILURE,
    payload: {
      error: err,
      errorString: err && err.toString(),
    },
  }
}

export const fetchUser = () => {
  return {
    type: FETCH_USER,
  }
}

export const fetchUserSuccess = (user) => {
  return {
    type: FETCH_USER_SUCCESS,
    payload: {
      user,
    },
  }
}

export const fetchUserFailure = (err) => {
  return {
    type: FETCH_USER_FAILURE,
    payload: {
      error: err,
      errorString: err && err.toString(),
    },
  }
}

export const fetchUsers = (query) => {
  return {
    type: FETCH_USERS,
    payload: {
      query,
    },
  }
}

export const fetchUsersSuccess = (users) => {
  return {
    type: FETCH_USERS_SUCCESS,
    payload: {
      users,
    },
  }
}

export const fetchUsersFailure = (err) => {
  return {
    type: FETCH_USERS_FAILURE,
    payload: {
      error: err,
      errorString: err && err.toString(),
    },
  }
}

export const setExpirationDate = (expirationDate) => {
  return {
    type: SET_EXPIRATION_DATE,
    payload: {
      expirationDate,
    },
  }
}

export const setExpirationDateSuccess = (expirationDate) => {
  return {
    type: SET_EXPIRATION_DATE_SUCCESS,
    payload: {
      expirationDate,
    },
  }
}

export const setExpirationDateFailure = (err) => {
  return {
    type: SET_EXPIRATION_DATE_FAILURE,
    payload: {
      error: err,
      errorString: err && err.toString(),
    },
  }
}

export const fetchProject = (projectId) => ({
  type: FETCH_PROJECT,
  payload: { projectId },
})

export const fetchProjectSuccess = (project) => ({
  type: FETCH_PROJECT_SUCCESS,
  payload: { project },
})

export const fetchProjectFailure = (err) => ({
  type: FETCH_PROJECT_FAILURE,
  payload: {
    error: err,
    errorString: err && err.toString(),
  },
})

export const fetchClients = (query) => {
  return {
    type: FETCH_CLIENTS,
    payload: {
      query,
    },
  }
}

export const fetchClientsSuccess = (clients) => {
  return {
    type: FETCH_CLIENTS_SUCCESS,
    payload: {
      clients,
    },
  }
}

export const fetchClientsFailure = (err) => {
  return {
    type: FETCH_CLIENTS_FAILURE,
    payload: {
      error: err,
      errorString: err && err.toString(),
    },
  }
}

export const logout = () => {
  return {
    type: LOGOUT,
  }
}

export const logoutSuccess = () => {
  return {
    type: LOGOUT_SUCCESS,
  }
}

export const logoutFailure = (err) => {
  return {
    type: LOGOUT_FAILURE,
    payload: {
      error: err,
      errorString: err && err.toString(),
    },
  }
}
