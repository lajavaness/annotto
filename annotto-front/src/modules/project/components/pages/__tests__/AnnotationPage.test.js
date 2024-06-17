import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import { createStore } from 'redux-dynamic-modules'
import { render } from '@testing-library/react'
import { Suspense } from 'react'

import 'assets/locales'

import theme from '__theme__'

import AnnotationPage from 'modules/project/components/pages/AnnotationPage'

const initialState = {}
const getStore = (state) => createStore({ initialState: state })
const getInstance = (state = initialState) => (
  <Provider store={getStore(state)}>
    <ThemeProvider theme={theme}>
      <Suspense path="/" fallback="Loading">
        <AnnotationPage />
      </Suspense>
    </ThemeProvider>
  </Provider>
)

describe('AnnotationPage', () => {
  it('matches snapshot', () => {
    const { asFragment } = render(getInstance())
    expect(asFragment()).toMatchSnapshot()
  })
})
