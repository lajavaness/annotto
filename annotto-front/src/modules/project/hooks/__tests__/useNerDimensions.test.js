import { renderHook } from '@testing-library/react-hooks'

import useNerDimensions from 'modules/project/hooks/useNerDimensions'

describe('useNerDimensions', () => {
  let rootRef
  let contentRef
  let rootDiv
  let contentDiv

  const width = 100
  const height = 50
  const contentBoundingClientRect = {
    x: 0,
    y: 0,
    width,
    height,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  }

  beforeEach(() => {
    rootDiv = document.createElement('div')
    document.body.appendChild(rootDiv)

    rootDiv.style.width = `${width}px`
    rootDiv.style.height = `${height}px`
    rootDiv.style.paddingLeft = '10px'
    rootDiv.style.paddingRight = '10px'
    rootDiv.style.paddingTop = '10px'
    rootDiv.style.paddingBottom = '10px'
    rootDiv.style.borderLeftWidth = '10px'
    rootDiv.style.borderRightWidth = '10px'
    rootDiv.style.borderTopWidth = '10px'
    rootDiv.style.borderBottomWidth = '10px'

    contentDiv = rootDiv.appendChild(document.createElement('div'))

    contentDiv.getBoundingClientRect = jest.fn(() => contentBoundingClientRect)

    rootRef = { current: rootDiv }
    contentRef = { current: contentDiv }
  })

  afterEach(() => {
    document.body.removeChild(rootDiv)
    rootRef = null
    contentRef = null
    // rootDiv = null
    contentDiv = null
  })

  it('should return the root and content dimensions', async () => {
    const { result } = renderHook(() => useNerDimensions(rootRef, contentRef, []))

    expect(result.current).toEqual([
      {
        height: 10,
        width: 60,
      },
      contentBoundingClientRect,
    ])
  })

  it('should return undefined for root and content dimensions if rootRef and contentRef are undefined', async () => {
    const { result } = renderHook(() => useNerDimensions())

    expect(result.current).toEqual([undefined, undefined])
  })

  it('should rerender when deps change', async () => {
    const { result, rerender } = renderHook(() => useNerDimensions(rootRef, contentRef, []))

    expect(result.current).toEqual([
      {
        height: 10,
        width: 60,
      },
      contentBoundingClientRect,
    ])

    rerender({
      rootRef,
      contentRef,
      deps: undefined,
    })

    expect(result.current).toEqual([
      {
        height: 10,
        width: 60,
      },
      contentBoundingClientRect,
    ])

    rerender({
      rootRef,
      contentRef,
      deps: ['foo'],
    })
  })
})
