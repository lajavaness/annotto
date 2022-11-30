import { Form as _Form, Input as _Input, Select as _Select, Space as _Space } from 'antd'

import styled from '@xstyled/styled-components'

export const Root = styled.div`
  background-color: backgroundSecondary;
  border: regular;
  border-radius: regular;
  padding: 32px;
  margin-bottom: 12px;
  text-align: left;
  .ant-form-item-label > label {
    color: formLabel;
  }
  overflow: auto;
  height: 100%;
`

export const Title = styled.div`
  ${(props) => ({ ...props.theme.fonts.h4 })};
  padding-bottom: 16px;
`

export const Input = styled(_Input)`
  max-width: 286px;
`

export const Select = styled(_Select)`
  max-width: 286px;
`

export const Span = styled.span`
  height: 32px;
  display: flex;
  align-items: center;
`

export const Space = styled(_Space)`
  .ant-upload-list-item-info {
    & > span:first-child {
      position: absolute;
      display: flex;
      justify-content: flex-start;
      width: 286px;
    }
  }
  .ant-upload-list-item-card-actions {
    position: relative;
    right: unset;
  }

  .ant-upload-list-item-name {
    overflow: visible;
    width: unset;
  }
`

export const Form = styled(_Form)`
  height: 100%;
`

export const ItemsContainer = styled.div`
  height: 100%;
  width: 50%;

  & > div:last-child {
    padding-bottom: 32px;
  }
`

export const AlertContainer = styled.div`
  margin-bottom: 32px;
`
