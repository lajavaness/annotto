import * as React from 'react'
import { DynamicModuleLoader } from 'redux-dynamic-modules'

import { startup } from 'modules/configurationProject/actions/configurationProjectActions'

import configurationProjectReducer from 'modules/configurationProject/reducers/configurationProjectReducer'

import ConfigurationProjectPage from 'modules/configurationProject/components/ConfigurationProjectPage'

import configurationProjectSagas from 'modules/configurationProject/sagas/configurationProjectSagas'

const moduleToLoad = {
	id: 'configurationProject',
	reducerMap: {
		configuration: configurationProjectReducer,
	},
	sagas: [configurationProjectSagas],
	initialActions: [startup()],
}

export default function DynamicProjectPage(props) {
	return (
		<DynamicModuleLoader modules={[moduleToLoad]}>
			<ConfigurationProjectPage {...props} />
		</DynamicModuleLoader>
	)
}
