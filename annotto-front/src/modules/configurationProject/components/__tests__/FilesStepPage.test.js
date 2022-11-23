import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import { createStore } from 'redux-dynamic-modules'
import { render } from '@testing-library/react'
import React from 'react'

import theme from '__theme__'

import FilesStepPage from 'modules/configurationProject/components/FilesStepPage'

const initialState = {}
const getStore = (state) => createStore({ initialState: state })
const getInstance = (state = initialState) => (
	<Provider store={getStore(state)}>
		<ThemeProvider theme={theme}>
			<FilesStepPage />
		</ThemeProvider>
	</Provider>
)

describe('FilesStepPage', () => {
	it('matches snapshot', () => {
		const { asFragment } = render(getInstance())
		expect(asFragment()).toMatchSnapshot()
	})
})
