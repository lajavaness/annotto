import styled from '@xstyled/styled-components'

export const Root = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  overflow: auto;
  ${(props) => ({ ...props.theme.fonts.regular })}
`

export const Content = styled.div``
