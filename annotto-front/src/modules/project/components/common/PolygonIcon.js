import Icon from '@ant-design/icons'

import React from 'react'

import theme from '__theme__'

const PolygonIcon = () => (
	<Icon
		component={() => (
			<svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M2 0H8V2H12V0H18V6H16.5138L17.5138 12H20V18H14V16H6V18H0V12H2.48621L3.48621 6H2V0ZM5.51379 6L4.51379 12H6V14H14V12H15.4862L14.4862 6H12V4H8V6H5.51379ZM4 2V4H6V2H4ZM14 2V4H16V2H14ZM16 16V14H18V16H16ZM2 14V16H4V14H2Z"
					fill={theme.colors.fontPrimary}
				/>
			</svg>
		)}
	/>
)

export default PolygonIcon
