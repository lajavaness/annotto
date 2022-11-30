import { ThemeProvider } from 'styled-components'
import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { TWO_POINTS } from 'shared/enums/markerTypes'

import theme from '__theme__'

import ImageMarker from '../ImageMarker'

const defaultProps = {}
const getInstance = (props = {}) => (
  <ThemeProvider theme={theme}>
    <ImageMarker {...defaultProps} {...props} />
  </ThemeProvider>
)

describe('ImageMarker', () => {
  const annotations = [
    {
      value: 'Zone1',
      zone: [
        { x: 0.2, y: 0.2 },
        { x: 0.2, y: 0.4 },
        { x: 0.4, y: 0.2 },
        { x: 0.4, y: 0.4 },
      ],
    },
    {
      value: 'NER2',
      zone: [
        { x: 0.1, y: 0.1 },
        { x: 0.1, y: 0.4 },
        { x: 0.4, y: 0.1 },
        { x: 0.4, y: 0.4 },
      ],
    },
  ]

  const tasks = [
    {
      parents: [],
      type: 'ner',
      _id: '5f61ebcdd15130001ba9a1fb',
      value: 'NER2',
      hotkey: 'n',
      label: 'NER2',
      category: 'ner',
      updatedAt: '2020-09-16T10:41:17.017Z',
      createdAt: '2020-09-16T10:41:17.017Z',
      color: '#ff7a45',
    },
    {
      parents: [],
      type: 'zone',
      _id: '5f61ebcdd15130001ba9a202',
      value: 'Zone1',
      hotkey: 'z',
      label: 'Zone1',
      category: 'Meta',
      color: '#FFD8BF',
      updatedAt: '2020-09-16T10:41:17.018Z',
      createdAt: '2020-09-16T10:41:17.018Z',
    },
  ]

  const selectedSection = {
    value: 'Zone1',
    label: 'Zone1',
    hotkey: 'z',
    color: '#FFD8BF',
    _id: '5f61ebcdd15130001ba9a202',
  }

  it('matches snapshot', () => {
    const { asFragment } = render(getInstance({ tasks }))
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders annotations', () => {
    const { getAllByTestId } = render(getInstance({ annotations, tasks }))

    expect(getAllByTestId('__markers__')).toHaveLength(annotations.length)
  })

  it('renders loader', () => {
    const { getByTestId } = render(getInstance())

    expect(getByTestId('__loader__')).toBeVisible()
  })

  it('triggers onChange callback with mode 2points', () => {
    const onChange = jest.fn()
    const { getByTestId } = render(getInstance({ annotations, tasks, selectedSection, mode: TWO_POINTS, onChange }))

    const firstMouseup = new MouseEvent('mouseup', { bubbles: true, cancelable: true })
    const secondMouseup = new MouseEvent('mouseup', { bubbles: true, cancelable: true })

    Object.defineProperty(firstMouseup, 'offsetX', { get: () => 10 })
    Object.defineProperty(firstMouseup, 'offsetY', { get: () => 10 })
    Object.defineProperty(secondMouseup, 'offsetX', { get: () => 20 })
    Object.defineProperty(secondMouseup, 'offsetY', { get: () => 20 })

    fireEvent(getByTestId('__markers-container__'), firstMouseup)
    fireEvent(getByTestId('__markers-container__'), secondMouseup)

    expect(onChange).toHaveBeenCalled()
  })
})
