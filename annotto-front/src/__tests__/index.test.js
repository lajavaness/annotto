import { render } from 'react-dom'
import React from 'react'
import Root from 'shared/components/Root'

jest.mock('react-dom', () => ({ render: jest.fn() }))

describe('Application root', () => {
  it('should render without crashing', () => {
    const div = document.createElement('div')
    div.id = 'root'
    document.body.appendChild(div)
    // eslint-disable-next-line global-require
    require('../index.js')
    expect(render).toHaveBeenCalledWith(<Root />, div)
  })
})
