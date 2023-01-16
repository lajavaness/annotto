import { ThemeProvider } from 'styled-components'
import { render } from '@testing-library/react'
import React from 'react'

import theme from '__theme__'

import HtmlItem from 'modules/project/components/common/HtmlItem'

const defaultProps = {}
const getInstance = (props = {}) => (
  <ThemeProvider theme={theme}>
    <HtmlItem {...defaultProps} {...props} />
  </ThemeProvider>
)

describe('HtmlItem', () => {
  it('matches snapshot', () => {
    const { asFragment } = render(getInstance())
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders content', () => {
    const content = '<div data-testid="__foo__">Foo</div>'
    const { getByTestId } = render(getInstance({ content: `${content}` }))
    expect(getByTestId('__foo__')).toBeVisible()
  })
})
