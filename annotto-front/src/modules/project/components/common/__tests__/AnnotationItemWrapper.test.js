import React, { Suspense } from 'react'
import { render } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'

import { PROJECT_IMAGE, PROJECT_TEXT, PROJECT_VIDEO, PROJECT_AUDIO, PROJECT_HTML } from 'shared/enums/projectTypes'
import { AUDIO, NER, TEXT, VIDEO, ZONE } from 'shared/enums/annotationTypes'

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

jest.mock('react-i18next', () => ({
  Trans: ({ components }) => {
    return components
  },
  useTranslation: () => ({ t: (key) => key }),
}))

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

  it('should render video component for video annotation type', () => {
    const props = {
      projectType: PROJECT_VIDEO,
      tasks: [{ type: VIDEO, value: 'foo', label: 'foo' }],
      currentItem: { data: { url: 'some video url' }, highlights: [] },
      options: { someOption: 'some value' },
    }
    const { getByTestId } = render(getInstance(props))

    const videoContainer = getByTestId('__video-item__')

    expect(videoContainer).toBeInTheDocument()
  })

  it('should render audio component for audio annotation type', () => {
    const props = {
      projectType: PROJECT_AUDIO,
      tasks: [{ type: AUDIO, value: 'foo', label: 'foo' }],
      currentItem: { data: { url: 'some audio url' }, highlights: [] },
      options: { someOption: 'some value' },
    }
    const { getByTestId } = render(getInstance(props))

    const audioContainer = getByTestId('__audio-item__')

    expect(audioContainer).toBeInTheDocument()
  })

  it('should render html component for html annotation type', () => {
    const props = {
      projectType: PROJECT_HTML,
      currentItem: { data: { html: '<div>some text</div>' } },
      options: { someOption: 'some value' },
    }
    const { getByTestId } = render(getInstance(props))

    const htmlContainer = getByTestId('__html-item__')

    expect(htmlContainer).toBeInTheDocument()
  })
})
