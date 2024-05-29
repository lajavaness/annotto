import styled from '@xstyled/styled-components'
import { Line as _Line } from 'react-konva'

export const Root = styled.div`
  height: 100%;
  overflow: auto;
`

export const Line = styled(_Line)`
  transition: cubicBezier;
  stroke-width: 2px;
  fill: ${({ $isHovered, $isSelected, $isPrediction, $isPrefill, fill, index }) => {
    if ($isPrediction && !$isPrefill) {
      return `${`url(#pattern_${index})`}`
    }
    return `${$isHovered || $isSelected ? fill : 'transparent'}`
  }};
  fill-opacity: ${({ $isHovered, $isSelected, $isPrediction }) => {
    if ($isHovered) {
      return 0.3
    }
    if ($isPrediction || $isSelected) {
      return 0.5
    }
    return 1
  }};
  stroke-opacity: ${({ $isHovered }) => `${$isHovered ? 0.6 : 1}`};
  stroke-dasharray: ${({ $isPrediction, $isPrefill }) => ($isPrediction || $isPrefill) && 3};
`
