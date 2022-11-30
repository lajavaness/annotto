import { Table as _Table } from 'antd'
import styled from '@xstyled/styled-components'

export const Root = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const Table = styled(_Table)`
  height: 100%;

  .ant-spin-nested-loading {
    height: 100%;
  }

  .ant-spin-container {
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
  }

  .ant-table {
    overflow: hidden;
    border: ${({ theme }) => theme.borders.regular};
    display: flex;
    flex-direction: column;
  }
  .ant-table-container {
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
  }
  .ant-table-measure-row {
    visibility: collapse;
  }

  .ant-table-header {
    flex: none;
  }

  .ant-table-body {
    flex: auto;
    overflow: auto;
  }

  .ant-table-footer {
    background-color: backgroundSecondary;
    text-align: center;
  }

  .ant-table-cell {
    padding: 13px 16px !important;
    white-space: nowrap;
    text-align: left;

    & > div:first-child {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`

export const Container = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  color: primary;
`
