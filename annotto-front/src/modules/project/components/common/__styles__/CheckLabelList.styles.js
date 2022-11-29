import { Checkbox, Col, Row, Typography } from 'antd'
import { TagsTwoTone } from '@ant-design/icons'
import styled from '@xstyled/styled-components'

export const Root = styled.div`
  height: 100%;
`

export const CheckboxGroup = styled(Checkbox.Group)`
  && {
    width: 100%;
    margin: 8px 0 16px 0;
  }
`

export const ItemRow = styled(Row)`
  display: flex;
  justify-content: space-between;
  & > div {
    border-bottom: regular;
  }
  ${({ $hasBelowSevenChildren, theme }) =>
    $hasBelowSevenChildren
      ? `
					& > div {
						width: 100%;
					}

					& > div:last-child {
						border-bottom-left-radius: ${theme.radii.regular};
						border-bottom-right-radius: ${theme.radii.regular};
					}

					& > div:first-child {
						border-top-left-radius: ${theme.radii.regular};
						border-top-right-radius: ${theme.radii.regular};
					}
			  `
      : `
					& > div {
						width: calc(50% - 4px);
					}

					& > div:first-child {
						border-top-left-radius: ${theme.radii.regular};
					}

					& > div:nth-child(2){
						border-top-right-radius: ${theme.radii.regular};
					}

					& > div:last-child {
						border-bottom-right-radius: ${theme.radii.regular};
					}

					& > div:nth-last-child(2):nth-child(odd) {
						 border-bottom-left-radius: ${theme.radii.regular};
					}

					`}
`

export const ItemCol = styled(Col)`
  background-color: backgroundSecondary;
`

export const Label = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  padding: 4px 8px;
  cursor: pointer;
  height: 100%;
  align-items: center;
  .ant-tag {
    margin-right: 0;
  }
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`

export const LabelText = styled(Typography.Text)`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const PredictionIcon = styled(TagsTwoTone)``

export const CheckboxLabel = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  .ant-checkbox-wrapper {
    margin-right: 8px;
    margin-left: 16px;
  }
`
export const IconHotkey = styled.div`
  display: flex;
  align-items: center;
  .anticon {
    margin-right: 18px;
    color: darkgray;
  }
`

export const ColoredLeftSection = styled.div`
  width: 16px;
  height: 100%;
  background-color: ${({ background }) => background || 'transparent'};
  position: absolute;
  left: 0;
`
