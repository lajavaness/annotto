import { Col } from 'antd'
import styled from 'styled-components'

export const Root = styled(Col)`
  height: ${({ height }) => height || '100%'};
`
