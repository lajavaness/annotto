import { startup } from 'modules/root/actions/rootActions'
import authReducer from 'modules/root/reducers/authReducer'
import authSaga from 'modules/root/sagas/authSaga'
import rootReducer from 'modules/root/reducers/rootReducer'
import rootSaga from 'modules/root/sagas/rootSaga'

const rootModule = {
	id: 'root',
	reducerMap: {
		root: rootReducer,
		auth: authReducer,
	},
	sagas: [rootSaga, authSaga],
	initialActions: [startup()],
}

export default rootModule
