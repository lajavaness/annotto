import { Button, Typography } from 'antd'
import { TagsTwoTone } from '@ant-design/icons'
import styled from '@xstyled/styled-components'

export const Root = styled.div`
	height: 100%;
	& > div:last-child {
		margin-bottom: 0;
	}
`

export const Container = styled.div`
	display: flex;
	flex-direction: column;
	margin-bottom: 8px;
`

export const Label = styled(Typography.Text)``

export const LabelContainer = styled.div`
	margin-bottom: 8px;
`

export const TextAreaContainer = styled.div`
	position: relative;
	margin-bottom: 8px;
`

export const PredictionIcon = styled(TagsTwoTone)`
	margin-right: 4px;

	& > svg > path:nth-child(-n + 2) {
		fill: predictionIconPrimary;
	}

	& > svg > path:nth-last-child(-n + 2) {
		fill: backgroundSecondary;
	}
`

export const ValidateButton = styled(Button)`
	position: absolute;
	z-index: 1;
	right: 8px;
	top: 8px;
	border: none;
	width: unset;
	height: unset;
	padding: 0;
	background: unset;
	color: validateTextAreaButton;

	.anticon {
		display: flex;
		font-size: ${({ theme }) => `${theme.fonts.small.fontSize}px`};
	}
`
