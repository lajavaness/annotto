import { ThemeProvider } from 'styled-components'
import { render } from '@testing-library/react'
import React from 'react'

import theme from '__theme__'

import Hotkey from 'shared/components/hotkey/Hotkey'

const getInstance = (props = {}) => (
	<ThemeProvider theme={theme}>
		<Hotkey label={props.label} isSelected={props.isSelected} />
	</ThemeProvider>
)

describe('Hotkey', () => {
	it('matches snapshot', () => {
		const label = 'bar'
		const { asFragment } = render(getInstance({ label }))
		expect(asFragment()).toMatchSnapshot()
	})
	it('matches snapshot when component is selected', () => {
		const label = 'bar'
		const isSelected = true

		const { asFragment } = render(getInstance({ label, isSelected }))
		expect(asFragment()).toMatchSnapshot()
	})
})
