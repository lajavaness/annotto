import { Modal as _Modal } from 'antd'
import styled from '@xstyled/styled-components'

export const Root = styled.div`
  height: 100%;
  background-color: backgroundPrimary;
  & > div:first-child {
    height: 100%;
  }
`

export const Modal = styled(_Modal)`
  margin: 0 auto;
  top: 0;
  padding: 20px;

  .ant-modal-content {
    border: regular;
    height: 100%;
    overflow: auto;
  }
  .ant-modal-body {
    padding: 0;
  }
  .ant-modal-close-x {
    height: 64px;
    line-height: 64px;
    .anticon svg {
      font-size: 18px;
      color: primary;
    }
  }
`
