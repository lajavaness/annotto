import { useCallback, useEffect, useState } from 'react'

const useNerDimensions = (rootRef, contentRef, deps = []) => {
  const [rootDimensions, setRootDimensions] = useState()
  const [contentDimensions, setContentDimensions] = useState()

  const resizeRootDimensions = (node) => {
    const cs = getComputedStyle(node)

    const paddingX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)
    const paddingY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)

    const borderX = parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth)
    const borderY = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth)

    const width = parseFloat(cs.width) - paddingX - borderX
    const height = parseFloat(cs.height) - paddingY - borderY

    setRootDimensions({ width, height })
  }

  const _onWindowResize = useCallback(() => {
    if (rootRef?.current) {
      resizeRootDimensions(rootRef.current)
    }
  }, [])

  useEffect(() => {
    if (contentRef?.current) {
      setContentDimensions(contentRef.current.getBoundingClientRect())
    }
  }, [rootDimensions])

  useEffect(() => {
    if (rootRef?.current) {
      resizeRootDimensions(rootRef.current)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('resize', _onWindowResize)

    return () => window.removeEventListener('resize', _onWindowResize)
  }, [_onWindowResize])

  useEffect(() => {
    _onWindowResize()
  }, [_onWindowResize, ...deps])

  return [rootDimensions, contentDimensions]
}

export default useNerDimensions
