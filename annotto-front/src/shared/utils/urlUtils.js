import { isEmpty } from 'lodash'

/**
 * Returns the environment url based on endpoint key.
 * @param key       Endpoint key.
 * @param options   Optional object that contains key/value pairs to replace endpoint dynamic properties.
 * @returns {*} Url.
 */
export const resolveApiUrl = (key, options = null) => {
  let endpoint = process.env[key]
  if (endpoint) {
    if (options) {
      Object.keys(options).forEach((key) => {
        const value = options[key]
        endpoint = endpoint.replace(new RegExp(`{{${key}}}`, 'g'), value)
      })
    }
    const baseUrl = !isEmpty(process.env.REACT_APP_BASE_URL) ? process.env.REACT_APP_BASE_URL : window.location.origin
    return `${baseUrl}${process.env.REACT_APP_API_ROUTE}${endpoint}`
  }
  throw new Error(`${key} not found in env variables`)
}
