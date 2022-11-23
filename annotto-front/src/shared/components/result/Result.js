import { Button } from 'antd'
import { navigate } from '@reach/router'
import { useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'
import React from 'react'

import * as Styled from './__styles__/Result.styles'

const Result = ({ status }) => {
	const { t } = useTranslation('root')

	const _onClick = () => navigate('/', { replace: true })

	return (
		<Styled.Root
			data-testid={'__result__'}
			status={status}
			title={status}
			subTitle={t(`root:errors.label.${status}`)}
			extra={
				<Button type="primary" onClick={_onClick}>
					{t(`root:errors.backButton`)}
				</Button>
			}
		/>
	)
}

Result.propTypes = {
	/** Defines the status the error (403, 404, 500). Decide icons, colors, title and subTitle of the Result . */
	status: PropTypes.string.isRequired,
}

Result.defaultProps = {
	status: null,
}

export default Result
