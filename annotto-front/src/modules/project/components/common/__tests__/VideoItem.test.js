import React from 'react'
import { render } from '@testing-library/react'

import VideoItem from '../VideoItem'

const getInstance = (props = {}) => render(<VideoItem {...props} />)

jest.mock('react-i18next', () => ({
  Trans: ({ components }) => {
    return components
  },
  useTranslation: () => ({ t: (key) => key }),
}))

describe('VideoItem', () => {
  const content = 'https://example.com/video.mp4'
  it('renders the video element with the correct src', () => {
    const { getByTestId } = getInstance({ content })

    const videoElement = getByTestId('__video_item__').firstChild
    expect(videoElement).toHaveAttribute('src', 'https://example.com/video.mp4')
  })

  it('renders a fallback message when the video is not supported', () => {
    const { getByText } = getInstance({ content })

    const fallbackElement = getByText('project:errors.videoUnsupportedLink')
    expect(fallbackElement).toBeInTheDocument()
    expect(fallbackElement).toHaveAttribute('href', content)
    expect(fallbackElement).toHaveAttribute('rel', 'noreferrer')
    expect(fallbackElement).toHaveAttribute('target', '_blank')
  })
})
