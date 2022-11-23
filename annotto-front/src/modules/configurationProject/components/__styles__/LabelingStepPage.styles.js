import { Col, Collapse as _Collapse, Divider as _Divider, Form as _Form, Modal as _Modal, Tag as _Tag } from 'antd'
import {
	CloseCircleFilled as _CloseCircleFilled,
	DeleteFilled as _DeleteFilled,
	PlusOutlined as _PlusOutlined,
	StopOutlined as _StopOutlined,
} from '@ant-design/icons'
import styled from '@xstyled/styled-components'

export const Root = styled.div`
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

export const Header = styled.span`
	${(props) => ({ ...props.theme.fonts.h4 })};
	min-width: 230px;
`

export const DeleteFilled = styled(_DeleteFilled)`
	color: formLabel;
	font-size: 21px;
`

export const CloseCircleFilled = styled(_CloseCircleFilled)`
	color: formLabel;
	font-size: 18px;
	position: absolute;
	bottom: 11px;
`

export const LastCol = styled(Col)`
	position: relative;
`

export const DropdownMenu = styled.div`
	text-align: center;
	.ant-select-item-option {
		padding-right: 7px;
	}
`

export const Divider = styled(_Divider)`
	margin: 0 0 4px 0;
`

export const PlusOutlined = styled(_PlusOutlined)`
	display: block;
	font-size: 18px;
	cursor: pointer;
	color: icon;
`

export const Modal = styled(_Modal)`
	input {
		box-sizing: content-box;
	}
`

export const StopOutlined = styled(_StopOutlined)`
	color: primary;
	margin: 6px 8px 0 0;
	font-size: 18px;
`

export const Tag = styled(_Tag)`
	&& {
		height: 18px;
		width: 18px;
		margin-top: 6px;
		border-radius: 50%;
	}
`

export const Collapse = styled(_Collapse)`
	margin-bottom: 12px;
	.ant-space-align-center {
		align-items: start;
	}
	.ant-collapse-item {
		background-color: backgroundSecondary;
		border: regular;
		border-radius: regular;
		margin-bottom: 8px;
	}
	.ant-collapse-header {
		z-index: 1;
		height: 40px;
		display: flex;
		align-items: center;
		.ant-collapse-arrow svg {
			font-size: 18px;
		}
	}
	.ant-collapse-item-active {
		${DeleteFilled} {
			margin-top: 34px;
		}
		.ant-collapse-header {
			${Header} {
				display: none;
			}
			.ant-collapse-extra {
				display: none;
			}
			.ant-collapse-arrow {
				right: 30px;
				top: 60px;
			}
		}
		.ant-collapse-content {
			margin-top: -10px;
		}
	}
`

export const Labels = styled.div`
	padding: 20px 0 12px 0;
	.ant-form-item-label > label {
		color: dimGray;
	}
`

export const Form = styled(_Form)`
	height: 100%;
`

export const ButtonsContainer = styled.div`
	display: flex;
	width: 100%;
	justify-content: space-between;
`
