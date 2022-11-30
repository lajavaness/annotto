import styled from '@xstyled/styled-components'

export const Root = styled.kbd`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme, $isSelected }) => ($isSelected ? theme.colors.keyboardSelected : theme.colors.lightGrey)};
  border: ${({ theme, $isSelected }) => ($isSelected ? theme.borders.mediumSelected : theme.borders.medium)};
  border-bottom: ${({ theme, $isSelected }) => ($isSelected ? theme.borders.semiBoldSelected : theme.borders.semiBold)};
  border-radius: regular;
  color: fontPrimary;
  transition: cubicBezier;
`
