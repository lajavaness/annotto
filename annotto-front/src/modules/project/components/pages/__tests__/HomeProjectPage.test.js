import { LocationProvider } from '@reach/router'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import { createStore } from 'redux-dynamic-modules'
import { render } from '@testing-library/react'
import React from 'react'

import theme from '__theme__'

import HomeProjectPage from 'modules/project/components/pages/HomeProjectPage'

const initialState = {}
const getStore = (state) => createStore({ initialState: state })
const getInstance = (state = initialState) => (
	<Provider store={getStore(state)}>
		<LocationProvider>
			<ThemeProvider theme={theme}>
				<HomeProjectPage />
			</ThemeProvider>
		</LocationProvider>
	</Provider>
)

describe('HomeProjectPage', () => {
	it('matches snapshot', () => {
		const { asFragment } = render(getInstance())
		expect(asFragment()).toMatchSnapshot()
	})
})
