import { ThemeProvider } from 'styled-components'
import { render } from '@testing-library/react'
import React, { Suspense } from 'react'

import 'assets/locales'

import theme from '__theme__'

import HeaderItemContainer from '../HeaderItemContainer'

const defaultProps = {}
const getInstance = (props = {}) => (
  <ThemeProvider theme={theme}>
    <Suspense path="/" fallback="Loading">
      <HeaderItemContainer {...defaultProps} {...props} />
    </Suspense>
  </ThemeProvider>
)

describe('HeaderItemContainer', () => {
  it('matches snapshot', () => {
    const { asFragment } = render(getInstance())
    expect(asFragment()).toMatchSnapshot()
  })
})
