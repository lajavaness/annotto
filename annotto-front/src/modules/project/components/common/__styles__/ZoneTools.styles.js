import { Radio, Space } from 'antd'
import styled from '@xstyled/styled-components'

export const Root = styled.div``

export const RadioGroup = styled(Radio.Group)`
  width: 100%;
  & > label {
    padding: 0;
  }

  & > label:last-child {
    margin-bottom: 0;
  }
`
export const RadioGroupMode = styled(RadioGroup)`
  && {
    display: flex;
    gap: 1rem;
  }
`

export const TitleContainer = styled(Space)`
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
  kbd {
    width: auto;
    padding: 0 4px;
  }
`

export const RadioGroupSection = styled(RadioGroup)`
  & > label:first-child {
    border-left: none;
  }

  & > label:last-child:not(.ant-radio-button-wrapper-checked) {
    border-bottom: none;
  }
`
export const RadioButton = styled(Radio.Button)`
  && {
    width: 100%;
    border-radius: regular !important;
    border: regular;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 40px;
    overflow: hidden;
    :hover {
      background-color: secondaryHover;
    }
  }
  .ant-tag {
    display: flex;
    margin: 0;
    justify-content: center;
    width: 22px;
    height: 24px;
  }

  & > span:last-child {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    width: 100%;
  }
`

export const RadioButtonSection = styled(RadioButton)`
  && {
    margin-bottom: 1px;
    padding-right: 16px;
    border: none;
    border-bottom: regular;

    .ant-radio-button-checked {
      border: regular;
      border-color: primary;
      border-bottom: none;
      z-index: 1;
    }
  }
`

export const RadioButtonMode = styled(RadioButton)`
  && {
    width: fit-content;
    margin-bottom: 8px;
    .anticon {
      margin-right: 10px;
    }
    display: flex;
  }
  & > span:last-child {
    padding: 0 16px;
    justify-content: flex-start;
    display: flex;
    gap: 1rem;
  }
`

export const SectionsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  width: 100%;
  kbd {
    margin-left: auto;
  }
`

export const ColoredLeftSection = styled.div`
  width: 16px;
  height: 100%;
  margin-right: 16px;
  background: ${({ background }) => background};
`
