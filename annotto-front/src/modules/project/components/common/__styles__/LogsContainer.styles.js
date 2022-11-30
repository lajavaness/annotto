import { Button, Form, Radio, Divider as _Divider } from 'antd'
import { Link as _Link } from '@reach/router'
import styled from '@xstyled/styled-components'

import _theme from '__theme__'

export const Root = styled.div`
  width: 100%;
  display: flex;
  height: 100%;
  flex-direction: column;
  ${(props) => ({ ...props.theme.fonts.small })};
`

export const LogContent = styled.div`
  display: flex;
  margin-bottom: 8px;
  align-items: center;
`

export const IconContainer = styled.div`
  font-size: ${({ theme }) => theme.fonts.regular.fontSize}px;
  margin-right: 8px;
  color: icon;
`

export const LogSpan = styled.span`
  font-weight: ${({ $isBold }) => $isBold && 'bold'};
`
export const LogLinkSpan = styled(_Link)`
  color: primary;
  cursor: pointer;
`

export const LogCreateAtSpan = styled.span`
  color: icon;
  &:first-letter {
    text-transform: capitalize;
  }
`

export const LogWrapper = styled.div``
export const LogContainer = styled.div``

export const Divider = styled(_Divider)`
  margin: 12px 0;
  ${({ $isBold }) => !!$isBold && { border: _theme.borders.regular }};
`

export const LogDate = styled.div`
  margin-top: 16px;
  margin-bottom: 8px;
  ${(props) => ({ ...props.theme.fonts.small })};
  color: ${({ theme }) => theme.colors.icon};
`

export const Container = styled.div`
  background-color: ${({ theme, $isProjectContext }) => !$isProjectContext && theme.colors.backgroundSecondary};
  border: ${({ theme, $isProjectContext }) => !$isProjectContext && theme.borders.regular};
  box-sizing: border-box;
  border-radius: ${({ theme, $isProjectContext }) => !$isProjectContext && theme.radii.regular};
  padding: ${({ $isProjectContext }) => !$isProjectContext && '12px'};
  flex: 1;
  display: flex;
  height: 0;
  flex-direction: column;
  overflow: ${({ $isProjectContext }) => (!$isProjectContext ? 'auto' : 'hidden')};
  ${({ $isProjectContext }) => !$isProjectContext && `& > div { margin-right: 28px; }`};
`

export const RadioGroup = styled(Radio.Group)`
  margin-bottom: 12px;
`

export const Log = styled.div``

export const ListLogContainer = styled.div`
  flex: 1 1 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
`

export const PostMessageForm = styled(Form)`
  && {
    display: flex;
    margin-top: 12px;
  }

  .ant-form-item:first-child {
    flex: 1;
  }
`

export const PostMessageFormItem = styled(Form.Item)`
  && {
    margin-bottom: 0;
  }
`

export const SendButton = styled(Button)`
  width: 43px;
  height: 32px;
  margin-left: 12px;
`

export const CommentContainer = styled.div`
  display: flex;
  margin-bottom: 8px;
  flex-direction: column;
  width: 100%;
`

export const CommentContent = styled.div`
  margin-bottom: 4px;
  display: flex;
  align-items: center;
`

export const MessageContent = styled.div`
  padding: 8px;
  margin-left: 28px;
  border-radius: regular;
  background-color: primaryLight;
`

export const LoadMoreButton = styled(Button)`
  width: 100px;
  align-self: center;
`
