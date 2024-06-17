import { render } from '@testing-library/react'

import Root from '../Root'

const getInstance = () => <Root />

describe('Root', () => {
  it('matches snapshot', () => {
    const { asFragment } = render(getInstance())
    expect(asFragment()).toMatchSnapshot()
  })
})
