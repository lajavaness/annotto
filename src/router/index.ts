import express from 'express'
import control from '../middleware/control'
import addUsersRoutes from './users'
import addProjectsRoutes from './projects'
import addItemsRoutes from './items'
import addClientsRoutes from './clients'
import addFilterRoutes from './filters'
import addProfilesRoutes from './profiles'
import { keycloak } from '../auth'

const apiRouter = () => {
  const r = express.Router()

  /**
   * Get health status.
   * @route GET /health
   * @group health-api
   * @security Bearer
   * @returns {Health.model} 200 - Success.
   * @returns {AnnottoError.model} 400 - Invalid Credentials Error.
   * @returns {AnnottoError.model} 500 - Place get error.
   */
  r.get('/health', control.health)

  // After this line, every routes are keycloak dependant.
  r.use(keycloak.middleware())

  addUsersRoutes(r)
  addProjectsRoutes(r)
  addItemsRoutes(r)
  addClientsRoutes(r)
  addFilterRoutes(r)
  addProfilesRoutes(r)

  /**
   * @typedef List
   * @property {number} count Page length ( to set page max length to other value than default 10, use limit query param ).
   * @property {number} index Index of the page ( to access specific index use index query param ).
   * @property {number} pageCount Number of Page ( data length / page length ).
   * @property {number} total Total data length.
   * @property {Array.<object>} data
   */

  /**
   * @typedef UserExtern
   * @property {string} _id _id.
   * @property {string} firstName FirstName of the item.
   * @property {string} lastName LastName of the user.
   * @property {string} email Email.
   */

  /**
   * @typedef AnnottoError
   * @property {number} code Error code - eg: 401.
   * @property {string} message - Error message.
   */

  /**
   * @typedef Health
   * @property {string} status Status of the server.
   * @property {string} version Current version of the API.
   * @property {string} environment Current environment of the API.
   */

  /**
   * @typedef User
   * @property {string} firstName FirstName of the user.
   * @property {string} lastName LastName of the user.
   * @property {number} userId Id of the user.
   * @property {boolean} isActive User can login or not.
   * @property {string} email Email address of the user.
   */

  /**
   * @typedef UserUpdate
   * @property {string} firstName FirstName of the user.
   * @property {string} lastName LastName of the user.
   */

  /**
   * @typedef Auth
   * @property{string} email
   * @property {string} password Password.
   */

  /**
   * @typedef LoginCred
   * @property {number} userId Id of the user.
   * @property {string} token Token to provide.
   */

  return r
}

export default apiRouter
