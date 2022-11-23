import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import { createStore } from 'redux-dynamic-modules'
import { render } from '@testing-library/react'
import React from 'react'

import theme from '__theme__'

import ConfigStepPage from 'modules/configurationProject/components/ConfigStepPage'

const initialState = {}
const getStore = (state) => createStore({ initialState: state })
const getInstance = (state = initialState) => (
	<Provider store={getStore(state)}>
		<ThemeProvider theme={theme}>
			<ConfigStepPage />
		</ThemeProvider>
	</Provider>
)

describe('ConfigStepPage', () => {
	it('matches snapshot', () => {
		const { asFragment } = render(getInstance())
		expect(asFragment()).toMatchSnapshot()
	})
})
