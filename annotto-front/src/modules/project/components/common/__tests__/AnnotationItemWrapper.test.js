import React, { Suspense } from 'react'
import { render } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'

import { IMAGE as PROJECT_IMAGE, TEXT as PROJECT_TEXT } from 'shared/enums/projectTypes'
import { NER, TEXT, ZONE } from 'shared/enums/annotationTypes'

import theme from '__theme__'

import AnnotationItemWrapper from 'modules/project/components/common/AnnotationItemWrapper'

const defaultProps = {
  projectType: PROJECT_TEXT,
  currentItem: { body: 'some text', highlights: [] },
  tasks: [{ type: TEXT }],
}

const getInstance = (props = {}) => (
  <ThemeProvider theme={theme}>
    <Suspense path="/" fallback="Loading">
      <AnnotationItemWrapper {...defaultProps} {...props} />
    </Suspense>
  </ThemeProvider>
)

describe('AnnotationItemWrapper component', () => {
  it('should render text container for text annotation type', () => {
    const { getByTestId } = render(getInstance())
    const textContainer = getByTestId('__text-item__')

    expect(textContainer).toBeInTheDocument()
  })

  it('should render ner container for ner annotation type', () => {
    const text = 'some value'
    const props = { tasks: [{ type: NER, value: 'foo', label: 'foo' }], options: { someOption: text } }
    const { getByTestId } = render(getInstance(props))
    const nerContainer = getByTestId('__ner-item__')

    expect(nerContainer).toBeInTheDocument()
  })

  it('should render image marker component for zone annotation type', () => {
    const props = {
      projectType: PROJECT_IMAGE,
      tasks: [{ type: ZONE, value: 'foo', label: 'foo' }],
      currentItem: { data: { url: 'some image url' }, highlights: [] },
      options: { someOption: 'some value' },
    }
    const { getByTestId } = render(getInstance(props))

    const imageMarker = getByTestId('__image-item__')

    expect(imageMarker).toBeInTheDocument()
  })
})
