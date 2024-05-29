import PropTypes from 'prop-types'

import * as Styled from './__styles__/Col.styles'

const Col = (props) => {
  const { children, ...otherProps } = props
  return <Styled.Root {...otherProps}>{children}</Styled.Root>
}

export default Col

Col.propTypes = {
  /** Defines the height of the Col. */
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Defines the title of the card. */
  children: PropTypes.node,
}

Col.defaultProps = {
  height: null,
  children: null,
}
