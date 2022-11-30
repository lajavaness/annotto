import { ThemeProvider } from 'styled-components'
import { render } from '@testing-library/react'
import React from 'react'

import theme from '__theme__'

import Card from 'shared/components/card/Card'

const defaultProps = {}
const getInstance = (props = {}) => (
  <ThemeProvider theme={theme}>
    <Card {...defaultProps} {...props} />
  </ThemeProvider>
)

describe('Card', () => {
  it('matches snapshot ', () => {
    const title = 'Foo'
    const { asFragment } = render(getInstance({ title }))
    expect(asFragment()).toMatchSnapshot()
  })
})
