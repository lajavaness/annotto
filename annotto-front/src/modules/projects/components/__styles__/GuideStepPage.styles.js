import { Space } from 'antd'
import styled from '@xstyled/styled-components'

export const Root = styled.div`
  background-color: backgroundSecondary;
  border: regular;
  border-radius: regular;
  padding: 12px;
  margin-bottom: 12px;
  text-align: left;
  overflow: auto;
  height: 100%;
`

export const SwitchContainer = styled(Space)`
  margin-bottom: 12px;
`

export const MarkdownContainer = styled.div`
  border: regular;
  padding: 16px;
  height: 100%;
`
