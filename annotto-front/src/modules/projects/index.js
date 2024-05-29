import { DynamicModuleLoader } from 'redux-dynamic-modules'

import { startup } from 'modules/projects/actions/projectsActions'

import projectsReducer from 'modules/projects/reducers/projectsReducer'

import ProjectsPage from 'modules/projects/components/ProjectsPage'

import projectsSagas from 'modules/projects/sagas/projectsSagas'

const moduleToLoad = {
  id: 'projects',
  reducerMap: {
    projects: projectsReducer,
  },
  sagas: [projectsSagas],
  initialActions: [startup()],
}

export default function DynamicProjectPage(props) {
  return (
    <DynamicModuleLoader modules={[moduleToLoad]}>
      <ProjectsPage {...props} />
    </DynamicModuleLoader>
  )
}
