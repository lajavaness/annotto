import PropTypes from 'prop-types'
import React from 'react'

import * as Styled from './__styles__/Card.styles'

const Card = ({ title, isContentFullSize, extra, children, ...otherProps }) => (
  <Styled.Root
    title={title}
    data-testid={'__card__'}
    bordered={false}
    $isContentFullSize={isContentFullSize}
    extra={extra}
    {...otherProps}
  >
    {children}
  </Styled.Root>
)

export default Card

Card.propTypes = {
  /** Defines the title of the card. */
  title: PropTypes.string,
  /** Defines the content to render in the right of the title of the card. */
  extra: PropTypes.node,
  /** Defines if the content should have padding. */
  isContentFullSize: PropTypes.bool,
  /** Defines the title of the card. */
  children: PropTypes.node,
}

Card.defaultProps = {
  title: null,
  extra: null,
  children: null,
  isContentFullSize: false,
}
