import { Spin } from 'antd'
import React from 'react'

import * as Styled from './__styles__/Loader.styles'

const Loader = () => (
	<Styled.Root data-testid={'__loader__'}>
		<Spin size="large" />
	</Styled.Root>
)

export default Loader
