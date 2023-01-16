import PropTypes from 'prop-types'
import React from 'react'

import { sanitizer } from 'shared/utils/htmlUtils'

import * as Styled from './__styles__/HtmlItem.styles'

const HtmlItem = ({ content }) => {
  return (
    <Styled.Root data-testid={'__html-item__'}>
      <Styled.Content dangerouslySetInnerHTML={{ __html: sanitizer(content) }} />
    </Styled.Root>
  )
}

export default HtmlItem

HtmlItem.propTypes = {
  /** Defines the content of the item. */
  content: PropTypes.string,
}

HtmlItem.defaultProps = {
  content: null,
}
