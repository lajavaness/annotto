import _ from 'lodash'
import coreConfig from './config'

import developementConfig from './development'
import testConfig from './test'

function getEnvConfig(forceEnv: string) {
  const envConfig = (() => {
    if (forceEnv === 'development') {
      return developementConfig
    }
    if (forceEnv === 'test') {
      return testConfig
    }
    throw new Error(`Load config failed : Environment file ${forceEnv} not found`)
  })()
  return _.merge({}, coreConfig, envConfig)
}

const config = getEnvConfig(process.env.NODE_ENV || 'development')

export type Config = typeof config
export default config
