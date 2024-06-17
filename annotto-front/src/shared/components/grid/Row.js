import PropTypes from 'prop-types'

import * as Styled from './__styles__/Row.styles'

const Row = (props) => {
  const { children, ...otherProps } = props
  return <Styled.Root {...otherProps}>{children}</Styled.Root>
}

export default Row

Row.propTypes = {
  /** Defines the height of the row. */
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Defines the title of the card. */
  children: PropTypes.node,
}

Row.defaultProps = {
  height: null,
  children: null,
}
