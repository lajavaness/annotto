import { useSelector } from 'react-redux'

import PropTypes from 'prop-types'

import { selectIsReady } from 'modules/projects/selectors/projectsSelectors'

import Loader from 'shared/components/loader/Loader'

import * as Styled from 'modules/projects/components/__styles__/ProjectsPage.styles'

const ProjectsPage = ({ children }) => {
  const isReady = useSelector(selectIsReady)

  return isReady ? <Styled.Root>{children}</Styled.Root> : <Loader />
}

export default ProjectsPage

ProjectsPage.propTypes = {
  children: PropTypes.node,
}
