import { Divider as _Divider, Space as _Space } from 'antd'
import { QuestionCircleOutlined as _QuestionCircleOutlined } from '@ant-design/icons'
import styled, { css } from '@xstyled/styled-components'

export const Root = styled.div`
  position: relative;
  height: 100%;
  padding: 20px;
`
export const ItemContainer = styled.div`
  border: regular;
  border-radius: regular;
  height: 100%;
  background-color: backgroundSecondary;
  display: flex;
  flex-direction: column;
`

export const Divider = styled(_Divider)`
  margin: 0;
`

export const Space = styled(_Space)`
  height: 100%;
  width: 100%;

  & > div:nth-child(2) {
    ${({ $isTextContent }) =>
      $isTextContent &&
      css`
        height: 48%;
      `}
  }

  & > div:last-child {
    flex: 1;
    height: 0;
  }
`

export const ItemContent = styled.div`
  flex: 1;
  overflow: auto;
  height: 0;
`

export const TypeError = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

export const HeaderDivider = styled(_Divider)`
  height: 100%;
  margin: 0 20px;
`

export const QuestionCircleOutlined = styled(_QuestionCircleOutlined)`
  font-size: 20px;
  color: primary;
  cursor: pointer;
`

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`

export const RightContainer = styled(Container)`
  overflow: auto;
  max-height: calc(100vh - 64px - 40px);
  & > div:last-child {
    margin-bottom: 0;
  }
`
export const Content = styled.div`
  margin-bottom: 16px;
`
