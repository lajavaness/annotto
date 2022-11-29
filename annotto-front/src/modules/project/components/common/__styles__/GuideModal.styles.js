import { Col, Typography, Button as _Button, Divider as _Divider } from 'antd'
import styled from '@xstyled/styled-components'

export const Root = styled.div``

export const Header = styled.div`
  height: 63px;
  line-height: 63px;
  padding: 0 20px;
  border-bottom: regular;
`

export const Divider = styled(_Divider)`
  margin: 0;
  height: 32px;
`

export const Title = styled.span`
  ${(props) => ({ ...props.theme.fonts.h4 })};
  ${({ $isActive, theme }) => $isActive && `color: ${theme.colors.formLabel}`};
`

export const Button = styled(_Button)`
  padding: 4px 20px 4px 0;
  .anticon {
    font-size: 17px;
    vertical-align: bottom;
  }
`

export const LastCol = styled(Col)`
  flex: 1 1 auto;
  text-align: right;
  margin-right: 30px;
`

export const MarkdownContainer = styled.div`
  padding: 32px 40px;
  height: 100%;
`

export const GlossaryContainer = styled.div`
  padding: 24px 16px;
  height: 100%;
`

export const Group = styled.div`
  margin-bottom: 24px;

  & > div:last-child {
    border-bottom: unset;
    margin-bottom: unset;
  }
`

export const Task = styled.div`
  border-bottom: regular;
  margin-bottom: 24px;
`

export const Description = styled(Typography.Text)`
  margin-bottom: 16px;
  color: gray;
  display: inline-block;
  ${(props) => ({ ...props.theme.fonts.small })};
`
