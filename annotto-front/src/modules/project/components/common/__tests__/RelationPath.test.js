import { ThemeProvider } from 'styled-components'
import { render } from '@testing-library/react'

import theme from '__theme__'

import RelationPath from 'modules/project/components/common/RelationPath'

const defaultProps = {}
const getInstance = (props = {}) => (
  <ThemeProvider theme={theme}>
    <svg>
      <RelationPath {...defaultProps} {...props} />
    </svg>
  </ThemeProvider>
)

describe('RelationPath', () => {
  it('matches snapshot', () => {
    const { asFragment } = render(getInstance())
    expect(asFragment()).toMatchSnapshot()
  })
})
