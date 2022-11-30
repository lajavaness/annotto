import { Router as _Router } from '@reach/router'
import styled from '@xstyled/styled-components'

export const Root = styled.div`
  height: 100%;
`

export const Router = styled(_Router)`
  height: 100%;
  & > div:first-child {
    height: 100%;
  }
`
