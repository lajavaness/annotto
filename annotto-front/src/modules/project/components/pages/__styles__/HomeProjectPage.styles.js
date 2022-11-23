import { Button, Badge as _Badge, Divider as _Divider } from 'antd'
import {
	FunnelPlotOutlined,
	MoreOutlined as _MoreOutlined,
	QuestionCircleOutlined as _QuestionCircleOutlined,
} from '@ant-design/icons'
import { Link as _Link } from '@reach/router'
import styled from '@xstyled/styled-components'

import { default as _Table } from 'shared/components/table/Table'

export const Root = styled.div`
	padding: 20px;
	height: 100%;
`

export const Table = styled(_Table)`
	.ant-table {
		border-top: regular;
		border-right: none;
		border-left: none;
		border-bottom: none;
	}
`

export const StartAnnotationButton = styled(_Link)`
	cursor: pointer;
	${({ theme }) => ({ ...theme.fonts.medium })}
`

export const Link = styled(StartAnnotationButton)`
	color: primary;
`

export const TextRight = styled.span`
	display: block;
	text-align: right;
`

export const LeftContainer = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;

	& > div:last-child {
		flex: 1;
		margin-top: 16px;
	}
`

export const RightContainer = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;

	& > div:last-child {
		flex: 1;
		margin-top: 16px;
	}
`

export const ActionsContainer = styled.div`
	&& {
		justify-content: flex-start;
		display: flex;
		align-items: center;
	}
`

export const Badge = styled(_Badge)`
	.ant-badge-count {
		background-color: primary;
	}
`

export const FunnelPlotOutlinedIcon = styled(FunnelPlotOutlined)`
	font-size: 16px;
	color: icon;
`

export const EditButton = styled(Button)`
	padding-left: 8px;
`

export const Divider = styled(_Divider)`
	height: 100%;
	margin: 0 20px;
`

export const QuestionCircleOutlined = styled(_QuestionCircleOutlined)`
	font-size: 20px;
	color: primary;
	cursor: pointer;
`

export const MoreOutlined = styled(_MoreOutlined)`
	font-size: 20px;
	margin-left: 20px;
	color: primary;
	cursor: pointer;
`

export const MenuButton = styled.button`
	border: none;
	background: unset;
`
