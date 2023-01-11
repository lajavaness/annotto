import React from 'react'
import { render } from '@testing-library/react'

import AudioItem from 'modules/project/components/common/AudioItem'

const getInstance = (props = {}) => render(<AudioItem {...props} />)

jest.mock('react-i18next', () => ({
  Trans: ({ components }) => {
    return components
  },
  useTranslation: () => ({ t: (key) => key }),
}))

describe('AudioItem', () => {
  const content = 'https://example.com/audio.mp3'
  it('renders the audio element with the correct src', () => {
    const { getByTestId } = getInstance({ content })

    const audioElement = getByTestId('__audio-item__').firstChild
    expect(audioElement).toHaveAttribute('src', content)
  })

  it('renders a fallback message when the audio is not supported', () => {
    const { getByText } = getInstance({ content })

    const fallbackElement = getByText('project:errors.audioUnsupportedLink')
    expect(fallbackElement).toBeInTheDocument()
    expect(fallbackElement).toHaveAttribute('href', content)
    expect(fallbackElement).toHaveAttribute('rel', 'noopener noreferrer')
    expect(fallbackElement).toHaveAttribute('target', '_blank')
  })
})
