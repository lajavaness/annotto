import { LocationProvider } from '@reach/router'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import { createStore } from 'redux-dynamic-modules'
import { render } from '@testing-library/react'
import React from 'react'

import theme from '__theme__'

import ProjectsPage from 'modules/projects/components/ProjectsPage'

const initialState = {}
const getStore = (state) => createStore({ initialState: state })
const getInstance = (children, state = initialState) => (
  <Provider store={getStore(state)}>
    <ThemeProvider theme={theme}>
      <LocationProvider>
        <ProjectsPage>{children}</ProjectsPage>
      </LocationProvider>
    </ThemeProvider>
  </Provider>
)

describe('ProjectsPage', () => {
  it('matches snapshot', () => {
    const { asFragment } = render(getInstance())
    expect(asFragment()).toMatchSnapshot()
  })
})
