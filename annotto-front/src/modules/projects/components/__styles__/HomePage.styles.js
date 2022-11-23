import { Link as _Link } from '@reach/router'
import styled from '@xstyled/styled-components'

export const Root = styled.div`
	display: flex;
	height: 100%;
	justify-content: center;
`
export const CreateButtonLink = styled(_Link)`
	cursor: pointer;
	${({ theme }) => ({ ...theme.fonts.medium })}
`

export const Link = styled(CreateButtonLink)`
	color: primary;
`

export const TextRight = styled.span`
	display: block;
	text-align: right;
`

export const TableContainer = styled.div`
	position: relative;
	display: flex;
	justify-content: center;
	padding: 24px;
	width: 85%;
	height: 100%;
	background-color: backgroundSecondary;
`
