import { Request } from 'express'
import Keycloak from 'keycloak-connect'
import config from '../../config'

/**
 * By default, all unauthorized requests will be redirected to the Keycloak login page unless your client is bearer-only.
 * However, a confidential or public client may host both browsable and API endpoints.
 * To prevent redirects on unauthenticated API requests and instead return an HTTP 401,
 * You can override the redirectToLogin function.
 *
 * For example, this override checks if the URL contains /api/ and disables login redirects.
 * @param {express.Request} req .
 * @returns {boolean} .
 */
Keycloak.prototype.redirectToLogin = (req: Request) => {
  const apiReqMatcher = /\/api\//i
  return !apiReqMatcher.test(req.originalUrl || req.url)
}

export const keycloak = new Keycloak({}, config.keycloak)
