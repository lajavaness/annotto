import { Button as _Button, Steps as _Steps, Tabs as _Tabs } from 'antd'
import { ExclamationCircleOutlined as _ExclamationCircleOutlined } from '@ant-design/icons'
import styled from '@xstyled/styled-components'

export const Root = styled.div`
	height: 100%;
	background-color: backgroundPrimary;
	padding: 20px;
	display: flex;
	flex-direction: column;

	&& {
		.ant-tabs-nav {
			margin: 0;
		}
	}
`

export const Steps = styled(_Steps)`
	&& {
		max-width: 930px;
		margin: auto auto 10px;
		.ant-steps-item-content {
			width: 120px;
			padding-left: 15px;
			.ant-steps-item-title {
				width: max-content;
			}
		}
	}
`

export const Tabs = styled(_Tabs)`
	height: 100%;
	.ant-tabs-content-holder {
		height: 0;
	}
	.ant-tabs-content {
		height: 100%;
	}
`

export const TabPane = styled(_Tabs.TabPane)`
	height: 100%;

	& > div:first-child {
		height: 100%;
	}
`

export const Content = styled.div`
	text-align: center;
	flex: 1;
	height: 0;

	& > div:first-child {
		height: 100%;
	}
`

export const Footer = styled.div`
	text-align: center;
`
export const ExportButton = styled(_Button)`
	margin-top: 12px;
	margin-bottom: 12px;
	display: block;
	margin-left: auto;
`
export const ExclamationCircleOutlined = styled(_ExclamationCircleOutlined)`
	color: warning;
`
