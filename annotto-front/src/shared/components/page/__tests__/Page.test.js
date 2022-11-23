import React from 'react'

import { render } from '@testing-library/react'

import Page from '../Page'

const getInstance = () => <Page />

describe('Root', () => {
	it('matches snapshot', () => {
		const { asFragment } = render(getInstance())
		expect(asFragment()).toMatchSnapshot()
	})
})
