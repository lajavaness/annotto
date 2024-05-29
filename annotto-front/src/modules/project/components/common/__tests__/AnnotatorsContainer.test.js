import { ThemeProvider } from 'styled-components'
import { render } from '@testing-library/react'
import { Suspense } from 'react'

import 'assets/locales'

import theme from '__theme__'

import AnnotatorsContainer from 'modules/project/components/common/AnnotatorsContainer'

const defaultProps = {}
const getInstance = (props = {}) => (
  <ThemeProvider theme={theme}>
    <Suspense path="/" fallback="Loading">
      <AnnotatorsContainer {...defaultProps} {...props} />
    </Suspense>
  </ThemeProvider>
)

describe('AnnotatorsContainer', () => {
  it('matches snapshot', () => {
    const { asFragment } = render(getInstance())
    expect(asFragment()).toMatchSnapshot()
  })
})
