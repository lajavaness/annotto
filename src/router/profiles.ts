import { Router } from 'express'
import auth from '../auth/service'
import profiles from '../middleware/profiles'
import { schemaValidationMiddleware } from '../middleware/schema-validation-middleware'
import { rolesSchema } from './validation/profile'

/**
 * @typedef ProfilesList
 * @property {number} count - Number of profiles.
 * @property {number} index - Index of the page.
 * @property {number} pageCount - Page quantity.
 * @property {number} total - Total number of profiles.
 * @property {Array.<Profile>} data - List of profiles.
 */

/**
 * @typedef Profile
 * @property {string} user.required - Profile user-api ID.
 * @property {boolean} role.required - Profile role.
 * @property {string} email.required - Profile email.
 */

const init = (router: Router) => {
  /**
   * List Profiles
   * See confluence Doc for more details : https://lajavaness.atlassian.net/wiki/spaces/AN/pages/2086371385/Permissions.
   * @route GET /profiles
   * @group profiles
   * @security Bearer
   * @returns {ProfilesList.model} 200 - Success.
   * @returns {AnnottoError.model}  401 - Not authorized.
   * @returns {AnnottoError.model}  403 - Forbidden.
   * @returns {AnnottoError.model}  500 Fail to list profiles.
   */
  router.get('/profiles', auth.isAuthenticated({ realmRole: 'admin' }), profiles.index)

  /**
   * Update Profile role.
   * @route PUT /profiles/:id
   * @group profiles
   * @security Bearer
   * @param {string} role.query.required Query param "role" to assign to user ( "user / dataScientist / admin" ).
   * @returns {ProfilesList.model} 200 - Success.
   * @returns {AnnottoError.model}  401 - Not authorized.
   * @returns {AnnottoError.model}  403 - Forbidden.
   * @returns {AnnottoError.model}  500 Fail to list profiles.
   */
  router.put(
    '/profiles/:profileId',
    auth.isAuthenticated({ realmRole: 'admin' }),
    schemaValidationMiddleware({ schemaQuery: rolesSchema }),
    profiles.update
  )
}

export default init
