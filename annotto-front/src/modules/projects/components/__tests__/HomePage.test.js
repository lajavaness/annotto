import { LocationProvider } from '@reach/router'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import { createStore } from 'redux-dynamic-modules'
import { render } from '@testing-library/react'
import React, { Suspense } from 'react'

import 'assets/locales'

import theme from '__theme__'

import HomePage from 'modules/projects/components/HomePage'

const initialState = {}
const getStore = (state) => createStore({ initialState: state })
const getInstance = (state = initialState) => (
  <Provider store={getStore(state)}>
    <ThemeProvider theme={theme}>
      <LocationProvider>
        <Suspense path="/" fallback="Loading">
          <HomePage />
        </Suspense>
      </LocationProvider>
    </ThemeProvider>
  </Provider>
)

describe('HomePage', () => {
  it('matches snapshot', () => {
    const { asFragment } = render(getInstance())
    expect(asFragment()).toMatchSnapshot()
  })
})
