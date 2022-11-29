import { BOOLEAN, NUMBER, STRING } from 'shared/enums/rawTypes'
import styled from '@xstyled/styled-components'

export const Root = styled.div`
  overflow: auto;
  height: 100%;
  padding: 8px 16px;
  ${(props) => ({ ...props.theme.fonts.small })};
`
export const Container = styled.div``

export const KeyLabel = styled.span``

export const ValueLabel = styled.span`
  color: ${({ $valueType, theme }) =>
    ({
      [STRING]: theme.colors.primary,
      [NUMBER]: theme.colors.orange,
      [BOOLEAN]: theme.colors.secondary,
    }[$valueType])};
`
export const ValueContent = styled.div`
  margin-left: 8px;
`
