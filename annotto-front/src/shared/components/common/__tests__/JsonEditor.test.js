import { render } from '@testing-library/react'
import React from 'react'

import JsonEditor from 'shared/components/common/JsonEditor'

const defaultProps = {}
const getInstance = (props = {}) => (
	<div>
		<JsonEditor {...defaultProps} {...props} />
	</div>
)

describe('JsonEditor', () => {
	document.createRange = () => {
		const range = new Range()

		range.getBoundingClientRect = jest.fn()

		range.getClientRects = () => {
			return {
				item: () => null,
				length: 0,
				[Symbol.iterator]: jest.fn(),
			}
		}

		range.startContainer.getBoundingClientRect = jest.fn()

		return range
	}

	it('matches snapshot', () => {
		const { asFragment } = render(getInstance())
		expect(asFragment()).toMatchSnapshot()
	})
})
