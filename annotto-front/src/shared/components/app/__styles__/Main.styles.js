import { Layout, Menu, Button as _Button, Divider as _Divider } from 'antd'
import styled from '@xstyled/styled-components'

export const Root = styled(Layout)`
  height: 100%;
`

export const Content = styled(Layout.Content)`
  flex: 1;
  background-color: backgroundSecondary;
  min-height: unset;

  & > div:first-child {
    height: 100%;
  }
`

export const Header = styled(Layout.Header)`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: backgroundSecondary;
  padding: 0;
  box-shadow: medium;
`

export const NavigationContainer = styled.div`
  height: 100%;
  position: relative;
  display: flex;
`

export const NavigationContent = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  margin-left: 12px;
  line-height: 22px;
`

export const Title = styled.h1`
  ${({ theme }) => ({ ...theme.fonts.title })}
`

export const BackButton = styled(_Button)`
  ${({ theme }) => ({ ...theme.fonts.small })};
  padding-left: 0;
  color: primary;
`

export const BreadCrumb = styled.span`
  ${({ theme }) => ({ ...theme.fonts.small })};
  color: formLabel;
`

export const ActionContainer = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
`

export const Logo = styled.img`
  height: 100%;
  display: block;
`

export const Divider = styled(_Divider)`
  height: 100%;
  margin: 0 0 0 20px;
`

export const LogoContainer = styled.div`
  position: relative;
  height: 100%;
`

export const LogoContent = styled.div`
  position: relative;
  height: 100%;
  padding: 12px;
  width: 64px;
  background-color: primary;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;

  &:hover {
    cursor: pointer;
    background-color: primaryHover;
  }
  &:active {
    background-color: primaryActive;
  }
`

export const Border = styled.div`
  width: 100%;
  background: #f63c55;
  border-radius: 3px;
  height: 100%;
  position: absolute;
  top: 0;
  left: 4px;
`

export const UserButton = styled(_Button)`
  display: flex;
  justify-content: space-between;
  flex-direction: row-reverse;
  align-items: center;
  height: 100%;
  padding: 20px;

  & > span:last-child {
    margin-left: 0;
    margin-right: 8px;
  }
`

export const MenuItem = styled(Menu.Item)`
  padding: 0;
`

export const MenuItemButton = styled(_Button)`
  display: flex;
  justify-content: center;
  flex-direction: row-reverse;
  align-items: center;
  width: 100%;

  & > span:first-child {
    display: flex;
  }

  & > span:last-child {
    margin-left: 0;
    margin-right: 8px;
  }
`
