import { Card as _Card } from 'antd'
import styled from 'styled-components'

export const Root = styled(_Card)`
	display: flex;
	flex-direction: column;

	& > div:first-child {
		padding: 24px 24px 16px;
		border: none;
		${({ theme }) => ({ ...theme.fonts.title })}
	}

	& > div:last-child {
		padding: ${({ $isContentFullSize }) => ($isContentFullSize ? 0 : '0px 24px 24px 24px;')};
		flex: 1;
	}

	.ant-card-head-title {
		flex: unset;
	}

	.ant-card-extra {
		flex: 1;
		margin-left: 12px;
	}

	border: ${({ theme }) => theme.borders.regular};
	box-shadow: ${({ theme }) => theme.shadows.medium};
`
