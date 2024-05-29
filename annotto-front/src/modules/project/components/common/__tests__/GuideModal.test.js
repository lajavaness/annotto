import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import { createStore } from 'redux-dynamic-modules'
import { render } from '@testing-library/react'
import { Suspense } from 'react'

import 'assets/locales'

import theme from '__theme__'

import GuideModal from 'modules/project/components/common/GuideModal'

const initialState = {}
const defaultProps = {}

const getStore = (state) => createStore({ initialState: state })

const getInstance = (props = {}, state = initialState) => (
  <Provider store={getStore(state)}>
    <ThemeProvider theme={theme}>
      <Suspense path="/" fallback="Loading">
        <GuideModal {...defaultProps} {...props} />
      </Suspense>
    </ThemeProvider>
  </Provider>
)

describe('GuideModal', () => {
  it('matches snapshot', () => {
    const { asFragment } = render(getInstance())
    expect(asFragment()).toMatchSnapshot()
  })
})
