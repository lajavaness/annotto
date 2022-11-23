import { ThemeProvider } from 'styled-components'
import { render } from '@testing-library/react'
import React from 'react'

import theme from '__theme__'

import WarningMessage from 'shared/components/warning/WarningMessage'

const defaultProps = {}
const getInstance = (props = {}) => (
	<ThemeProvider theme={theme}>
		<WarningMessage {...defaultProps} {...props} />
	</ThemeProvider>
)

describe('WarningMessage', () => {
	it('matches snapshot', () => {
		const { asFragment } = render(getInstance())
		expect(asFragment()).toMatchSnapshot()
	})

	it('display message', () => {
		const message = 'foo'
		const { getByText } = render(getInstance({ message }))
		expect(getByText(message)).toBeVisible()
	})
})
