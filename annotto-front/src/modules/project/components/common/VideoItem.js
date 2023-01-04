import PropTypes from 'prop-types'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'

import * as Styled from 'modules/project/components/common/__styles__/VideoItem.styles'

const VideoItem = ({ content }) => {
  const { t } = useTranslation('project')

  return (
    <Styled.Root data-testid="__video_item__">
      <Styled.Video loop controls src={content}>
        <Trans
          t={t}
          i18nKey="project:errors.videoUnsupported"
          components={[
            <a key="link" target="_blank" href={content} rel="noreferrer">
              {t('project:errors.videoUnsupportedLink')}
            </a>,
          ]}
        />
      </Styled.Video>
    </Styled.Root>
  )
}

export default VideoItem

VideoItem.propTypes = {
  /** Defines the path of the video. */
  content: PropTypes.string,
}

VideoItem.defaultProps = {
  content: null,
}
