import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import { createStore } from 'redux-dynamic-modules'
import { render } from '@testing-library/react'
import React, { Suspense } from 'react'

import 'assets/locales'

import theme from '__theme__'

import ProjectPage from 'modules/project/components/pages/ProjectPage'

const initialState = {}
const getStore = (state) => createStore({ initialState: state })
const getInstance = (state = initialState) => (
  <Provider store={getStore(state)}>
    <ThemeProvider theme={theme}>
      <Suspense path="/" fallback="Loading">
        <ProjectPage />
      </Suspense>
    </ThemeProvider>
  </Provider>
)

describe('ProjectPage', () => {
  it('matches snapshot', () => {
    const { asFragment } = render(getInstance())
    expect(asFragment()).toMatchSnapshot()
  })
})
