import { ThemeProvider } from 'styled-components'
import { render } from '@testing-library/react'
import React from 'react'

import theme from '__theme__'

import SettingsDrawer from 'modules/project/components/common/SettingsDrawer'

const defaultProps = {}
const getInstance = (props = {}) => (
	<ThemeProvider theme={theme}>
		<SettingsDrawer {...defaultProps} {...props} />
	</ThemeProvider>
)

describe('SettingsDrawer', () => {
	it('matches snapshot', () => {
		const { asFragment } = render(getInstance())
		expect(asFragment()).toMatchSnapshot()
	})
})
