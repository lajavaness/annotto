import styled from '@xstyled/styled-components'

export const Root = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
	${(props) => ({ ...props.theme.fonts.small })};
	padding: 10px 20px 6px;

	span:first-child {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
`

export const Label = styled.span``
