import PropTypes from 'prop-types'
import React from 'react'

import * as Styled from './__styles__/WarningMessage.styles'

const WarningMessage = ({ message }) => (
	<Styled.Root data-testid={'__warning-message__'}>
		<Styled.ExclamationCircle />
		{message}
	</Styled.Root>
)

export default WarningMessage

WarningMessage.propTypes = {
	/** Defines the message to display */
	message: PropTypes.string,
}

WarningMessage.defaultProps = {
	message: null,
}
