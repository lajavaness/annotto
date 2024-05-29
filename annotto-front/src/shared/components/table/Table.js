import { useCallback, useEffect, useRef, useState } from 'react'

import Loader from 'shared/components/loader/Loader'

import * as Styled from './__styles__/Table.styles'

const Table = (props) => {
  const rootRef = useRef(null)

  const [height, setHeight] = useState(0)
  const [headerHeight, setHeaderHeight] = useState(0)
  const [footerHeight, setFooterHeight] = useState(0)
  const [isResized, setIsResized] = useState(false)

  const _onWindowResize = useCallback(() => setIsResized(false), [])

  const getHeight = (node) => (node ? node.getBoundingClientRect().height : 0)

  useEffect(() => {
    _onWindowResize()
    window.addEventListener('resize', _onWindowResize)
    return () => window.removeEventListener('resize', _onWindowResize)
  }, [_onWindowResize])

  useEffect(() => {
    if (rootRef?.current) {
      if (!isResized) {
        setHeight(getHeight(rootRef.current))
        setIsResized(true)
      } else {
        const header = rootRef.current.querySelector('thead.ant-table-thead')
        const footer = rootRef.current.querySelector('div.ant-table-footer')
        setHeaderHeight(getHeight(header))
        setFooterHeight(getHeight(footer))
      }
    }
  }, [rootRef, isResized, height])

  return (
    <Styled.Root ref={rootRef}>
      {isResized ? (
        <Styled.Table
          size="middle"
          tableLayout="auto"
          scroll={{ x: 'max-content', y: headerHeight ? height - headerHeight - footerHeight : 0 }}
          pagination={false}
          {...props}
        />
      ) : (
        <Loader />
      )}
    </Styled.Root>
  )
}

export default Table
