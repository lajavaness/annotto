import Icon from '@ant-design/icons'

import React from 'react'

import theme from '__theme__'

const FourPointsIcon = () => {
  return (
    <Icon
      component={() => (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0 0H6V2H12V0H18V6H16V12H18V18H12V16H6V18H0V12H2V6H0V0ZM4 12H6V14H12V12H14V6H12V4H6V6H4V12ZM2 2V4H4V2H2ZM14 4V2H16V4H14ZM14 14V16H16V14H14ZM2 16V14H4V16H2Z"
            fill={theme.colors.fontPrimary}
          />
        </svg>
      )}
    />
  )
}

export default FourPointsIcon
