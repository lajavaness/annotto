import { useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'
import React from 'react'

import * as Styled from './__styles__/HeaderItemContainer.styles'

const HeaderItemContainer = ({ id }) => {
	const { t } = useTranslation('project')

	return (
		<Styled.Root>
			<Styled.Label>{t('project:annotation.itemName', { id })}</Styled.Label>
		</Styled.Root>
	)
}

export default HeaderItemContainer

HeaderItemContainer.propTypes = {
	/** Defines the id of the item. */
	id: PropTypes.string,
}

HeaderItemContainer.defaultProps = {
	id: null,
}
