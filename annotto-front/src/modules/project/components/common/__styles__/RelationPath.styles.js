import { Button } from 'antd'
import styled from '@xstyled/styled-components'

export const Root = styled.g`
	stroke: ${({ theme, isSelected, stroke }) => (isSelected ? stroke : theme.colors.primary)};

	${({ isSelected, stroke }) =>
		isSelected &&
		`marker {
			fill: ${stroke};
		}`}

	&:hover {
		cursor: pointer;
		stroke: ${({ stroke }) => stroke};

		marker {
			fill: ${({ stroke }) => stroke};
		}
	}
`

export const Text = styled.text`
	fill: black;
	stroke: none;
	${(props) => ({ ...props.theme.fonts.small })}
`

export const Marker = styled.marker`
	fill: ${({ theme }) => theme.colors.primary};
`

export const RemoveButton = styled(Button)`
	position: absolute;
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
