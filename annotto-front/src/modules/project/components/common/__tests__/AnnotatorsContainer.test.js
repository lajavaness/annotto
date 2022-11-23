import { ThemeProvider } from 'styled-components'
import { render } from '@testing-library/react'
import React from 'react'

import theme from '__theme__'

import AnnotatorsContainer from 'modules/project/components/common/AnnotatorsContainer'

const defaultProps = {}
const getInstance = (props = {}) => (
	<ThemeProvider theme={theme}>
		<AnnotatorsContainer {...defaultProps} {...props} />
	</ThemeProvider>
)

describe('AnnotatorsContainer', () => {
	it('matches snapshot', () => {
		const { asFragment } = render(getInstance())
		expect(asFragment()).toMatchSnapshot()
	})
})
