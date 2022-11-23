import { Tooltip } from 'antd'
import PropTypes from 'prop-types'
import React, { useRef, useState } from 'react'

import * as Styled from './__styles__/Table.styles'

const EllipsisTableTooltip = ({ title, children }) => {
	const [isVisible, setIsVisible] = useState(false)
	const containerRef = useRef()

	const _onVisibleChange = (isVisible) => {
		if (containerRef.current && containerRef.current.clientWidth < containerRef.current.scrollWidth) {
			setIsVisible(isVisible)
		}
	}

	return (
		<Tooltip visible={isVisible} onVisibleChange={_onVisibleChange} title={title}>
			<Styled.Container ref={containerRef}>{children}</Styled.Container>
		</Tooltip>
	)
}

export default EllipsisTableTooltip

EllipsisTableTooltip.propTypes = {
	children: PropTypes.node,
	title: PropTypes.string,
}
