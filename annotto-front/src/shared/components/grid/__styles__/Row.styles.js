import { Row } from 'antd'
import styled from 'styled-components'

export const Root = styled(Row)`
  height: ${({ height }) => height || '100%'};
`
