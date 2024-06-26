import { Provider } from 'react-redux'
import { createStore } from 'redux-dynamic-modules'
import { render } from '@testing-library/react'
import { Suspense } from 'react'

import 'assets/locales'

import App from 'shared/components/app/App'

const initialState = {}
const getStore = (state) => createStore({ initialState: state })
const getInstance = (state = initialState) => (
  <Provider store={getStore(state)}>
    <Suspense path="/" fallback="Loading">
      <App />
    </Suspense>
  </Provider>
)

describe('AuthPage', () => {
  it('matches snapshot', () => {
    const { asFragment } = render(getInstance())
    expect(asFragment()).toMatchSnapshot()
  })
})
