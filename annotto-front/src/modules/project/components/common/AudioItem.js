import PropTypes from 'prop-types'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'

import * as Styled from 'modules/project/components/common/__styles__/AudioItem.styles'

const AudioItem = ({ content }) => {
  const { t } = useTranslation('project')

  return (
    <Styled.Root data-testid="__audio-item__">
      <Styled.Audio controls src={content}>
        <Trans
          t={t}
          i18nKey="project:errors.audioUnsupported"
          components={[
            <a key="link" target="_blank" href={content} rel="noopener noreferrer">
              {t('project:errors.audioUnsupportedLink')}
            </a>,
          ]}
        />
      </Styled.Audio>
    </Styled.Root>
  )
}

export default AudioItem

AudioItem.propTypes = {
  /** Defines the path of the audio. */
  content: PropTypes.string,
}

AudioItem.defaultProps = {
  content: null,
}
