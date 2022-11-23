import { useSelector } from 'react-redux'
import React from 'react'

import { selectIsReady } from 'modules/projects/selectors/projectsSelectors'

import Loader from 'shared/components/loader/Loader'

import * as Styled from 'modules/projects/components/__styles__/ProjectsPage.styles'

const ProjectsPage = (props) => {
	const isReady = useSelector(selectIsReady)

	return isReady ? <Styled.Root>{props.children}</Styled.Root> : <Loader />
}

export default ProjectsPage
