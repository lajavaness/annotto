import { ThemeProvider } from 'styled-components'
import { render } from '@testing-library/react'

import theme from '__theme__'

import Table from 'shared/components/table/Table'

const getInstance = () => (
  <ThemeProvider theme={theme}>
    <Table />
  </ThemeProvider>
)

describe('Table', () => {
  it('matches snapshot', () => {
    const { asFragment } = render(getInstance())
    expect(asFragment()).toMatchSnapshot()
  })
})
