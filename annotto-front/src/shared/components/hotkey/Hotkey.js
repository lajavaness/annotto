import PropTypes from 'prop-types'
import React from 'react'

import * as Styled from './__styles__/Hotkey.styles'

const Hotkey = ({ isSelected, label }) => <Styled.Root $isSelected={isSelected}>{label}</Styled.Root>

export default Hotkey

Hotkey.propTypes = {
  label: PropTypes.string.isRequired,
  /** Manages background color depending on whether it selected. */
  isSelected: PropTypes.bool,
}

Hotkey.defaultProps = {
  isSelected: false,
}
