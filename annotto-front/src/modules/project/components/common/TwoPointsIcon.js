import Icon from '@ant-design/icons'

import React from 'react'

import theme from '__theme__'

const TwoPointsIcon = () => {
	return (
		<Icon
			component={() => (
				<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M12 0H18V6H13.4141L6 13.4141V18H0V12H6V12H4.58574L12 4.58569V0ZM14 2V4H16V2H14ZM2 14V16H4V14H2Z"
						fill={theme.colors.fontPrimary}
					/>
				</svg>
			)}
		/>
	)
}

export default TwoPointsIcon
