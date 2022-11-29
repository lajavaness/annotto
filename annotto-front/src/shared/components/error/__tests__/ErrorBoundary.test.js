import { act, render } from '@testing-library/react'
import React from 'react'

import ErrorBoundary from '../ErrorBoundary'

const getInstance = (props = {}) => <ErrorBoundary>{props.children}</ErrorBoundary>

const pauseErrorLogging = (codeToRun) => {
  const logger = console.error
  console.error = () => {}
  codeToRun()

  console.error = logger
}

describe('ErrorBoundary', () => {
  it('matches snapshot', () => {
    const { asFragment } = render(getInstance())
    expect(asFragment()).toMatchSnapshot()
  })

  test('act works in this case', async () => {
    await act(async () => {
      const { getByText } = render(getInstance({ children: <div>ErrorBoundary</div> }))
      expect(getByText('ErrorBoundary')).toBeVisible()
    })
  })

  it('renders children', () => {
    const { getByText } = render(getInstance({ children: <div>ErrorBoundary</div> }))
    expect(getByText('ErrorBoundary')).toBeVisible()
  })

  it('renders error message', () => {
    const Child = () => {
      throw new Error('Errored!')
    }

    pauseErrorLogging(() => {
      const { getByText } = render(getInstance({ children: <Child /> }))

      expect(getByText('Sorry, something went wrong.')).toBeVisible()
    })
  })
})
