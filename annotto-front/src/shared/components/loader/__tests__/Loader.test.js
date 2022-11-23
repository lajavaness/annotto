import { render } from '@testing-library/react'
import React from 'react'

import Loader from 'shared/components/loader/Loader'

const defaultProps = {}
const getInstance = (props = {}) => <Loader {...defaultProps} {...props} />

describe('AnimatedLoader', () => {
	it('matches snapshot', () => {
		const { asFragment } = render(getInstance())
		expect(asFragment()).toMatchSnapshot()
	})
})
