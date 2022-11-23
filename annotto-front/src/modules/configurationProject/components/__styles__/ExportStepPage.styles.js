import { Button as _Button, Form as _Form } from 'antd'
import styled from '@xstyled/styled-components'

export const Root = styled.div`
	background-color: backgroundSecondary;
	border: regular;
	border-radius: regular;
	padding: 32px;
	margin-bottom: 12px;
	text-align: left;
	height: 100%;
	overflow: auto;
	.ant-form-item-label > label {
		color: formLabel;
	}

	.ant-form-item {
		margin-bottom: 0;
	}
`

export const Form = styled(_Form)`
	height: 100%;

	& > div:first-child {
		margin-bottom: 0;
	}

	& > div > div:last-child {
		margin-top: 24px;
	}
`

export const Button = styled(_Button)`
	border-color: primary;
	color: primary;
`
