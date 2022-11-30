import { render } from '@testing-library/react'
import React from 'react'

import Row from 'shared/components/grid/Row'

describe('Row', () => {
  it('matches snapshot', () => {
    const { asFragment } = render(<Row>Foo</Row>)
    expect(asFragment()).toMatchSnapshot()
  })
})
