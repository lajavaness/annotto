import { ThemeProvider } from 'styled-components'
import { render } from '@testing-library/react'
import { Suspense } from 'react'

import 'assets/locales'

import theme from '__theme__'

import SettingsDrawer from 'modules/project/components/common/SettingsDrawer'

const defaultProps = {}
const getInstance = (props = {}) => (
  <ThemeProvider theme={theme}>
    <Suspense path="/" fallback="Loading">
      <SettingsDrawer {...defaultProps} {...props} />
    </Suspense>
  </ThemeProvider>
)

describe('SettingsDrawer', () => {
  it('matches snapshot', () => {
    const { asFragment } = render(getInstance())
    expect(asFragment()).toMatchSnapshot()
  })
})
