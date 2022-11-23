import { Button } from 'antd'
import { TagsOutlined } from '@ant-design/icons'
import { isNil } from 'lodash'
import styled from '@xstyled/styled-components'

export const Root = styled.div`
	width: 100%;
	height: 100%;
	padding: ${({ hasRelation }) => (!hasRelation ? '20px' : '10px')};
	position: relative;
`

export const ForeignObjectContent = styled.foreignObject`
	${(props) => ({ ...props.theme.fonts.regular })}

	& > p {
		padding: 10px;
		width: ${({ width }) => `${width}px`};
	}
`

export const Content = styled.p`
	${(props) => ({ ...props.theme.fonts.regular })}
`

export const Svg = styled.svg`
	overflow: auto !important;
	${({ dimensions }) => dimensions.height && `height: ${dimensions.height}px`};
	${({ dimensions }) => dimensions.width && `width: ${dimensions.width}px`};
`

export const MarkContainer = styled.span`
	cursor: pointer;
	${(props) => ({ ...props.theme.fonts.regular })};
	background-color: ${({ $isPrediction, backgroundColor }) => ($isPrediction ? '#00000024' : backgroundColor)};
	outline: ${({ $isPrediction, backgroundColor }) => $isPrediction && `1px dashed ${backgroundColor}`};
	outline-offset: ${({ $isPrediction }) => $isPrediction && `-1px`};
	padding: 2px 0;
	line-height: 20px;
	background-image: ${({ $isPrediction }) =>
		$isPrediction &&
		`linear-gradient(45deg, #ffffff 25%, transparent 25%, transparent 75%, #ffffff 75%, #ffffff),
		linear-gradient(45deg, #ffffff 26%, transparent 26%, transparent 74%, #ffffff 74%, #ffffff)`};
	background-size: ${({ $isPrediction }) => $isPrediction && '11px 11px'};
	background-position: ${({ $isPrediction }) => $isPrediction && '0 0, 5.5px 5.5px'};
	${({ $isHovered, theme, backgroundColor }) =>
		$isHovered && `color: ${theme.fonts.regular.color}; background-color: ${backgroundColor}CC`};
	display: inline-block;
	${({ margin }) => !isNil(margin) && `margin-${margin}: 50px;`};
	${({ isSourceRelation, theme }) => isSourceRelation && `box-shadow: inset 0px 0px 0px 1px ${theme.colors.primary};`};
`

export const Mark = styled.mark`
	color: ${({ theme }) => `${theme.fonts.regular.color}CC`};
	background-color: ${({ $isHighlight, theme }) => ($isHighlight ? theme.colors.highlight : 'unset')};
	padding: ${({ $isHighlight }) => ($isHighlight ? '2px 0;' : '0')};
	${({ $isFirstMarkSelected }) => $isFirstMarkSelected && `padding-left: 2px;`};
	${({ $isHovered, theme }) => $isHovered && `color: ${theme.fonts.regular.color};`};
`

export const Span = styled.span`
	${({ $isHighlight, theme }) => $isHighlight && `background-color: ${theme.colors.highlight}; padding: 2px 0;`};
`

export const TaskLabel = styled.span`
	position: relative;
	user-select: none;
	margin: 0 2px;
	${({ theme }) => ({ ...theme.fonts.superscript })}
`

export const Space = styled.span`
	user-select: none;
`

export const ActionButton = styled(Button)`
	position: absolute;
	top: -0.7em;
	right: -0.8em;
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

export const PredictionIcon = styled(TagsOutlined)`
	color: predictionIconSecondary;
`
