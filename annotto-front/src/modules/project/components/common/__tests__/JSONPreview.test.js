import { ThemeProvider } from 'styled-components'
import { render } from '@testing-library/react'
import React from 'react'

import theme from '__theme__'

import JSONPreview from 'modules/project/components/common/JSONPreview'

const defaultProps = {}
const getInstance = (props = {}) => (
  <ThemeProvider theme={theme}>
    <JSONPreview {...defaultProps} {...props} />
  </ThemeProvider>
)

describe('JSONPreview', () => {
  it('matches snapshot', () => {
    const { asFragment } = render(getInstance())
    expect(asFragment()).toMatchSnapshot()
  })
})
