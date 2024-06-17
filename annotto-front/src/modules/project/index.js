import { DynamicModuleLoader } from 'redux-dynamic-modules'

import { startup } from 'modules/project/actions/projectActions'

import projectReducer from 'modules/project/reducers/projectReducer'

import ProjectPage from 'modules/project/components/pages/ProjectPage'

import projectSagas from 'modules/project/sagas/projectSagas'

const moduleToLoad = {
  id: 'project',
  reducerMap: {
    project: projectReducer,
  },
  sagas: [projectSagas],
  initialActions: [startup()],
}

export default function DynamicProjectPage(props) {
  return (
    <DynamicModuleLoader modules={[moduleToLoad]}>
      <ProjectPage {...props} />
    </DynamicModuleLoader>
  )
}
