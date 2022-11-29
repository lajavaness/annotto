import { ExclamationCircleOutlined } from '@ant-design/icons'
import styled from 'styled-components'

export const Root = styled.span`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  ${(props) => ({ ...props.theme.fonts.regular })}
`

export const ExclamationCircle = styled(ExclamationCircleOutlined)`
  margin-right: 4px;
`
