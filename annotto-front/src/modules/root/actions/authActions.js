export const LOGIN = 'root/login'
export const LOGIN_SUCCESS = 'root/loginSuccess'
export const LOGIN_FAILURE = 'root/loginFailure'
export const LOGOUT = 'root/logout'
export const LOGOUT_SUCCESS = 'root/logoutSuccess'
export const LOGOUT_FAILURE = 'root/logoutFailure'

export const login = () => {
	return {
		type: LOGIN,
	}
}

export const loginSuccess = (userInfo, keycloakInstance) => {
	return {
		type: LOGIN_SUCCESS,
		payload: {
			userInfo,
			keycloakInstance,
		},
	}
}

export const loginFailure = (err) => {
	return {
		type: LOGIN_FAILURE,
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
