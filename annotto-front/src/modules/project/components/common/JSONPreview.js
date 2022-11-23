import { isEmpty } from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'

import { BOOLEAN, NUMBER, OBJECT, STRING } from 'shared/enums/rawTypes'

import * as Styled from 'modules/project/components/common/__styles__/JSONPreview.styles'

const JSONPreview = ({ json }) => {
	const highlightedJSON = (jsonObj) =>
		Object.keys(jsonObj).map((key) => {
			const value = jsonObj[key]
			let valueType = typeof value

			const isSimpleValue = [STRING, NUMBER, BOOLEAN].includes(valueType) || !value
			if (isSimpleValue && valueType === 'object') {
				valueType = 'null'
			}

			const resolveNotationStart = valueType === OBJECT ? (Array.isArray(value) ? '[' : '{') : ''
			const resolveNotationEnd = valueType === OBJECT ? (Array.isArray(value) ? ']' : '}') : ''

			return (
				<Styled.Container key={key}>
					<Styled.KeyLabel>{`${key}: ${resolveNotationStart}`}</Styled.KeyLabel>
					{!(valueType === OBJECT && isEmpty(value)) ? (
						isSimpleValue ? (
							<Styled.ValueLabel $valueType={valueType}>{JSON.stringify(value)}</Styled.ValueLabel>
						) : (
							<Styled.ValueContent>{highlightedJSON(value)}</Styled.ValueContent>
						)
					) : null}
					{`${resolveNotationEnd},`}
				</Styled.Container>
			)
		})

	return <Styled.Root>{highlightedJSON(json)}</Styled.Root>
}

export default JSONPreview

JSONPreview.propTypes = {
	/** The Json to display. */
	json: PropTypes.object,
}

JSONPreview.defaultProps = {
	json: {},
}
