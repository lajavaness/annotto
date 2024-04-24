import { Button } from 'antd'
import { TagsOutlined } from '@ant-design/icons'
import styled from '@xstyled/styled-components'

export const Root = styled.div`
  overflow: auto;
  position: relative;
  height: 100%;
  cursor: ${({ $haveDraggedMarker }) => ($haveDraggedMarker ? 'move' : 'auto')};
`

export const Img = styled.img`
  position: absolute;
  width: 100%;
  height: auto;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-drag: none;
  -webkit-user-select: none;
  -ms-user-select: none;
`

export const Svg = styled.svg`
  position: absolute;
  height: ${({ dimensions }) => `${dimensions.height}px`};
  width: ${({ dimensions }) => `${dimensions.width}px`};
`

export const Polygon = styled.polygon`
  cursor: auto;
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

export const DraggedPolygon = styled.polygon`
  opacity: 0.3;
  transition: cubicBezier;
  stroke-width: 2px;
`

export const MarkerHeaderContainer = styled.foreignObject`
  position: absolute;
  overflow: visible;
  height: 20px;
  z-index: 999;
  opacity: ${({ $isHovered, $isSelected }) => {
    if ($isHovered) {
      return `${0.8}`
    }
    return `${$isSelected ? 1 : 0}`
  }};
`

export const MarkerLabelContainer = styled.div`
  position: absolute;
  transform: ${({ $isRect }) => ($isRect ? 'none' : 'translateX(-50%)')};
`

export const MarkerLabel = styled.div`
  transition: cubicBezier;
  position: ${({ $isRect }) => ($isRect ? 'absolute' : 'relative')};
  max-width: 100%;
  height: 20px;
  padding: 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background-color: ${({ backgroundcolor }) => backgroundcolor};
  ${({ theme }) => ({ ...theme.fonts.medium })}
`

export const ActionButton = styled(Button)`
  position: absolute;
  top: -0.6em;
  right: -0.6em;
  background-color: black;
  border-color: black;
  min-width: 16px;
  width: 16px;
  height: 16px;

  span:first-child {
    display: flex;
    justify-content: center;
    font-size: 0.5em;
  }
`
export const PredictionIconContainer = styled.foreignObject`
  position: absolute;
  overflow: visible;
  height: 20px;
  z-index: 999;
  padding-left: 4px;
  padding-top: 4px;
`

export const PredictionIcon = styled(TagsOutlined)`
  color: ${({ color, theme }) => color || theme.colors.predictionIconSecondary};
`

export const PredictionRectPattern = styled.rect`
  height: 10;
  width: 10;
  fill: ${({ $isHovered, $isSelected, $color }) => ($isSelected || $isHovered ? $color : '#000000')};
  fill-opacity: ${({ $isHovered, $isSelected, $color }) => ($isSelected || $isHovered ? $color : 0.2)};
`
