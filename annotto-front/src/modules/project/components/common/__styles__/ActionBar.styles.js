import { Button, Select, Badge as _Badge, Tag as _Tag } from 'antd'
import {
	FunnelPlotOutlined,
	EyeOutlined as _EyeOutlined,
	HighlightOutlined as _HighlightOutlined,
} from '@ant-design/icons'
import styled from '@xstyled/styled-components'

export const TagsSelect = styled(Select)`
	width: 100%;
`

export const DisplaySelect = styled(Select)`
	min-width: 115px;
`

export const Tag = styled(_Tag)`
	background-color: backgroundTag;
	color: icon;
`

export const EyeOutlined = styled(_EyeOutlined)`
	font-size: 20px;
	color: icon;
`

export const HighlightOutlined = styled(_HighlightOutlined)`
	font-size: 20px;
	color: icon;
`

export const Badge = styled(_Badge)`
	.ant-badge-count {
		background-color: primary;
	}
`

export const FunnelPlotOutlinedIcon = styled(FunnelPlotOutlined)`
	font-size: 20px;
	color: icon;
`

export const EditButton = styled(Button)`
	padding-left: 8px;
`

export const ToolButton = styled(Button)`
	padding-left: 0;
	padding-right: 8px;
`
