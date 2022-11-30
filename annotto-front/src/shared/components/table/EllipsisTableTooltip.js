import { Tooltip } from 'antd'
import PropTypes from 'prop-types'
import React, { useRef, useState } from 'react'

import * as Styled from './__styles__/Table.styles'

const EllipsisTableTooltip = ({ title, children }) => {
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef()

  const _onVisibleChange = (isOpen) => {
    if (containerRef.current && containerRef.current.clientWidth < containerRef.current.scrollWidth) {
      setIsVisible(isOpen)
    }
  }

  return (
    <Tooltip open={isVisible} onOpenChange={_onVisibleChange} title={title}>
      <Styled.Container ref={containerRef}>{children}</Styled.Container>
    </Tooltip>
  )
}

export default EllipsisTableTooltip

EllipsisTableTooltip.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
}
