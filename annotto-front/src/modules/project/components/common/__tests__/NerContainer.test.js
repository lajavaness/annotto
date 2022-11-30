import { ThemeProvider } from 'styled-components'
import { render } from '@testing-library/react'
import React from 'react'

import theme from '__theme__'

import NerContainer from 'modules/project/components/common/NerContainer'

const defaultProps = {}
const getInstance = (props = {}) => (
  <ThemeProvider theme={theme}>
    <NerContainer {...defaultProps} {...props} />
  </ThemeProvider>
)

describe('NerContainer', () => {
  it('matches snapshot', () => {
    const { asFragment } = render(getInstance())
    expect(asFragment()).toMatchSnapshot()
  })
})
