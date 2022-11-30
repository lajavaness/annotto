import { Avatar as _Avatar } from 'antd'
import styled from '@xstyled/styled-components'

export const Root = styled.div`
  width: 100%;
  height: 100%;
`

export const Avatar = styled(_Avatar)`
  && {
    margin-right: 4px;
    background-color: ${({ $isSelected, theme }) => theme.colors[$isSelected ? 'avatarSelected' : 'primaryLight']};
    color: ${({ $isSelected, theme }) => theme.colors[$isSelected ? 'backgroundSecondary' : 'avatarSelected']};
  }
`

export const Span = styled.div`
  width: 100%;
  margin-right: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  ${(props) => ({ ...props.theme.fonts.regular })};
`
