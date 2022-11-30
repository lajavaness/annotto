import { render } from '@testing-library/react'
import React from 'react'

import Col from 'shared/components/grid/Col'

describe('Col', () => {
  it('matches snapshot', () => {
    const { asFragment } = render(<Col>Foo</Col>)
    expect(asFragment()).toMatchSnapshot()
  })
})
