import { Button, Col, Form, Row, Typography, Divider as _Divider } from 'antd'
import styled from '@xstyled/styled-components'

export const Root = styled.div``

export const Header = styled.div`
	height: 63px;
	line-height: 63px;
	padding: 0 20px;
	border-bottom: regular;
	display: flex;
	align-items: center;
	justify-content: space-between;
`

export const Divider = styled(_Divider)`
	margin: 0;
	height: 32px;
`

export const Title = styled(Typography.Text)`
	${(props) => ({ ...props.theme.fonts.h3 })};
`

export const ResetButton = styled(Button)`
	padding: 4px 0;
`

export const FormContainer = styled(Form.Item)`
	&& {
		padding: 20px 20px 0;
		border-bottom: regular;
	}
`

export const FormItem = styled.div`
	max-width: 600px;
`

export const FormFooter = styled(Form.Item)`
	text-align: center;
	padding: 18px;
`

export const DeleteButton = styled(Button)`
	display: none;
	padding-top: 33px;
`

export const FormListRow = styled(Row)`
	&:hover ${DeleteButton} {
		display: block;
	}
`

export const FormListCol = styled(Col)`
	display: flex;
	flex: 1;
`

export const FormListSelectItem = styled.div`
	width: 100%;
	max-width: 435px;
	margin-right: 24px;
`

export const TextAreaContainer = styled.div`
	width: 100%;
	max-width: 38%;
	margin-right: 24px;
`

export const InputNumberContainer = styled.div`
	margin-right: 24px;
`
