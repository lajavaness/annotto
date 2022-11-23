import {
	AutoComplete as _AutoComplete,
	DatePicker as _DatePicker,
	Form as _Form,
	Input as _Input,
	Select as _Select,
} from 'antd'
import styled from '@xstyled/styled-components'

export const Root = styled.div`
	background-color: backgroundSecondary;
	border: regular;
	border-radius: regular;
	padding: 32px;
	margin-bottom: 12px;
	text-align: left;
	.ant-form-item-label > label {
		color: formLabel;
	}
	height: 100%;
	overflow: auto;
`

export const Title = styled.div`
	${(props) => ({ ...props.theme.fonts.h4 })};
	padding-bottom: 16px;
`

export const Form = styled(_Form)`
	height: 100%;
`
export const ItemsContainer = styled.div`
	height: 100%;
	width: 50%;

	& > div:last-child {
		padding-bottom: 32px;
	}
`

export const Input = styled(_Input)`
	max-width: 286px;
`

export const Select = styled(_Select)`
	max-width: 286px;
`

export const AutoComplete = styled(_AutoComplete)`
	max-width: 286px;
`

export const DatePicker = styled(_DatePicker)`
	min-width: 286px;
`
