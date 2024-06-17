import { fireEvent, render } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks/dom'
import { createRef } from 'react'

import useOutsideClick from 'shared/hooks/useOutsideClick'

const myRef = createRef()

const renderTest = () => {
  const { getByTestId } = render(
    <div data-testid="outer-container">
      <div data-testid="inner-container" ref={myRef} />
    </div>
  )
  const outerContainer = getByTestId('outer-container')
  const innerContainer = getByTestId('inner-container')
  const callback = jest.fn()

  return { callback, innerContainer, outerContainer }
}

describe('hooks - useOutsideClick', () => {
  it('fires event when outside container is clicked', () => {
    const { outerContainer, callback } = renderTest()
    renderHook(() => useOutsideClick(myRef, callback))

    fireEvent.click(outerContainer)
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('does not fire event when container itself is clicked', () => {
    const { innerContainer, callback } = renderTest()
    renderHook(() => useOutsideClick(myRef, callback))

    fireEvent.click(innerContainer)
    expect(callback).toHaveBeenCalledTimes(0)
  })
})
