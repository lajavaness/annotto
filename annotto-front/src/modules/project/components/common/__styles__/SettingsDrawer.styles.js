import { Drawer as _Drawer, Row as _Row, Select as _Select } from 'antd'
import { LeftCircleFilled as _LeftCircleFilled } from '@ant-design/icons'
import styled from '@xstyled/styled-components'

export const Drawer = styled(_Drawer)`
	&& {
		position: absolute;
	}
	.ant-drawer-body {
		padding: 28px 20px;
	}
	.ant-drawer-content {
		background-color: backgroundPrimary;
	}
	.ant-drawer-mask {
		background-color: rgba(0, 0, 0, 0.1);
	}
	.ant-form-item {
		margin-bottom: 12px;
	}
	.ant-form-item-label > label {
		color: formLabel;
		padding-bottom: 0;
	}
`

export const Row = styled(_Row)`
	padding-bottom: 28px;
	align-items: center;
	justify-content: space-between;
`

export const Header = styled.div`
	${(props) => ({ ...props.theme.fonts.h4 })};
`

export const LeftCircleFilled = styled(_LeftCircleFilled)`
	color: primary;
	cursor: pointer;
`

export const Select = styled(_Select)`
	.ant-select-selector {
		padding: 6px 24px 6px 10px;
		min-height: 230px;
		align-items: flex-start;
		align-content: start;
	}
	.ant-select-clear {
		top: 15px;
	}
	.ant-select-selection-item {
		border: regular;
	}
	.ant-select-selection-search {
		margin-top: 2px;
	}
`
