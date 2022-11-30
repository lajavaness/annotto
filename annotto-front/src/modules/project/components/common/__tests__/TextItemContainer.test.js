import { ThemeProvider } from 'styled-components'
import { render } from '@testing-library/react'
import React from 'react'

import theme from '__theme__'

import TextItemContainer from '../TextItemContainer'

const defaultProps = {}
const getInstance = (props = {}) => (
  <ThemeProvider theme={theme}>
    <TextItemContainer {...defaultProps} {...props} />
  </ThemeProvider>
)

describe('TextItemContainer', () => {
  it('matches snapshot', () => {
    const { asFragment } = render(getInstance())
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders content', () => {
    const content = 'Foo'
    const { getByText } = render(getInstance({ content }))
    expect(getByText(content)).toBeVisible()
  })

  it('renders highlights', () => {
    const text = 'Foo'
    const content = `${text} Bar`
    const highlights = [{ start: 0, end: 3, text, score: 0.2 }]
    const { getByTestId } = render(getInstance({ content, highlights }))
    expect(getByTestId('__mark__')).toBeVisible()
    expect(getByTestId('__mark__')).toHaveTextContent(text)
  })
})
