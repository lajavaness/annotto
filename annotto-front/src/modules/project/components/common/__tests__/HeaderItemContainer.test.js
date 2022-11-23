import { ThemeProvider } from 'styled-components'
import { render } from '@testing-library/react'
import React from 'react'

import theme from '__theme__'

import HeaderItemContainer from '../HeaderItemContainer'

const defaultProps = {}
const getInstance = (props = {}) => (
	<ThemeProvider theme={theme}>
		<HeaderItemContainer {...defaultProps} {...props} />
	</ThemeProvider>
)

describe('HeaderItemContainer', () => {
	it('matches snapshot', () => {
		const { asFragment } = render(getInstance())
		expect(asFragment()).toMatchSnapshot()
	})
})
