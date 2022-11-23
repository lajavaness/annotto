import produce from 'immer'

import {
	FETCH_CLIENTS_SUCCESS,
	FETCH_USERS_SUCCESS,
	FETCH_USER_SUCCESS,
	LOGOUT_SUCCESS,
	SET_EXPIRATION_DATE_SUCCESS,
	STARTUP_FAILURE,
	STARTUP_SUCCESS,
} from 'modules/root/actions/rootActions'
import { REQUEST_FAILURE, REQUEST_SUCCESS } from 'shared/actions/apiActions'

const initialState = {
	isReady: false,
	user: null,
	users: null,
	expirationDate: null,
	httpError: null,
	isHighlightAllowed: process.env.REACT_APP_ALLOW_EXTERNAL_API_HIGHLIGHT === 'true',
	isSimilarityAllowed: process.env.REACT_APP_ALLOW_EXTERNAL_API_SIMILARITY === 'true',
	clients: null,
}

export default (state, action) => {
	return produce(state || initialState, (draft) => {
		switch (action.type) {
			case STARTUP_FAILURE:
			case STARTUP_SUCCESS: {
				draft.isReady = true
				break
			}

			case SET_EXPIRATION_DATE_SUCCESS: {
				draft.expirationDate = action.payload.expirationDate
				break
			}

			case FETCH_USER_SUCCESS: {
				draft.user = action.payload.user
				break
			}

			case FETCH_USERS_SUCCESS: {
				draft.users = action.payload.users
				break
			}

			case FETCH_CLIENTS_SUCCESS: {
				draft.clients = action.payload.clients
				break
			}

			case LOGOUT_SUCCESS: {
				draft.user = null
				draft.expirationDate = null
				break
			}

			case REQUEST_FAILURE: {
				draft.httpError = action.payload.error
				break
			}

			case REQUEST_SUCCESS: {
				draft.httpError = null
				break
			}

			default: {
				//do nothing
			}
		}
	})
}
