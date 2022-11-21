import { Router } from 'express'
import auth from '../auth/service'
import filters from '../middleware/filters'
import { schemaValidationMiddleware } from '../middleware/schema-validation-middleware'
import { filterBodySchema } from './validation/filter'

/**
 * @typedef Filter
 * @property { string } _id - Id of the filter.
 * @property { string } project - Id of the project associated.
 * @property { string } type - Type of the data.
 * @property { object } payload - Req.body of the filter creation.
 * @property { object } user - User that created filter.
 * @property { string } criteria - Actual query to be applied.
 */

/**
 * @typedef field
 * @property { Array.<string> } operators
 */
/**
 * @typedef filterOperators
 * @property { string } name - Operator name.
 * @property { object } param - Value format associated with operator.
 */
/**
 * @typedef filterFields
 * @property { field.model } fieldName
 */
/**
 * @typedef filterSpecs
 * @property { Array.<filterOperators> } operators
 * @property { Array.<filterFields> } fields
 */

/**
 * @typedef FilterPayload
 * @property { string } operator.required - Operator to apply.
 * @property { string } field.required - Field or Alias for DB path to apply operator on.
 * @property { string } value.required - Value to use for operator.
 */

/**
 * Initialize filter routes.
 * @param {*} router The router.
 */
const init = (router: Router) => {
  /**
   * Create a filter ( minimum project role : user ) - GET /filter/operators for FilterPayload possibilities
   * See confluence Doc for more details : https://lajavaness.atlassian.net/wiki/spaces/AN/pages/2088828992/Filtres.
   * @route POST /projects/:projectId/filter
   * @group filters
   * @security Bearer
   * @param {Array.<FilterPayload>} FilterPayloads.body.required
   * @returns {Filter.model} 200 - Success.
   * @returns {AnnottoError.model} 400 - Invalid Payload or ERROR_FILTER_EXIST_FOR_PROJECT_AND_USER.
   * @returns {AnnottoError.model}  401 - Not authorized.
   * @returns {AnnottoError.model}  403 - Forbidden.
   * @returns {AnnottoError.model}  500 - Server Error.
   */
  router.post(
    '/projects/:projectId/filter',
    auth.isAuthenticated({ projectRole: 'user' }),
    schemaValidationMiddleware({ schemaBody: filterBodySchema }),
    filters.create
  )

  /**
   * Get a user's filter for a project ( minimum project role : user ).
   * @route GET /projects/:projectId/filter
   * @group filters
   * @security Bearer
   * @returns {Filter.model} 200 - Success.
   * @returns {AnnottoError.model}  401 - Not authorized.
   * @returns {AnnottoError.model}  403 - Forbidden.
   * @returns {AnnottoError.model}  500 - Server Error.
   */
  router.get('/projects/:projectId/filter', auth.isAuthenticated({ projectRole: 'user' }), filters.getByProjectAndUser)

  /**
   * Update a user's filter for a project ( minimum project role : user ).
   * @route PUT /projects/:projectId/filter/:filterId
   * @group filters
   * @security Bearer
   * @returns {Filter.model}  200 - Success.
   * @returns {AnnottoError.model}  401 - Not authorized.
   * @returns {AnnottoError.model}  403 - Forbidden.
   * @returns {AnnottoError.model}  500 - Server Error.
   */
  router.put(
    '/projects/:projectId/filter',
    auth.isAuthenticated({ projectRole: 'user' }),
    schemaValidationMiddleware({ schemaBody: filterBodySchema }),
    filters.update
  )

  /**
   * Delete a user's filter for a project ( minimum project role : user ).
   * @route DELETE /projects/:projectId/filter
   * @group filters
   * @security Bearer
   * @returns { object }  200 - Success.
   * @returns {AnnottoError.model}  401 - Not authorized.
   * @returns {AnnottoError.model}  403 - Forbidden.
   * @returns {AnnottoError.model}  500 - Server Error.
   */

  router.delete('/projects/:projectId/filter', auth.isAuthenticated({ projectRole: 'user' }), filters.delete)

  /**
   * Get Specs for filter creation ( minimum project role : user ).
   *
   * Returns : fields array : ( possible operators to apply on each field ) and
   * operators array ( value property format for each operator ).
   *
   * For ex the format for "annotated" + "equal" is : { "operator": "equal", "field": "annotated", value: true }.
   * @route GET /projects/:projectId/filter/operators
   * @group filters
   * @security Bearer
   * @returns { filterSpecs.model }  200 - Success.
   * @returns {AnnottoError.model}  401 - Not authorized.
   * @returns {AnnottoError.model}  403 - Forbidden.
   * @returns {AnnottoError.model}  500 - Server Error.
   */

  router.get(
    '/projects/:projectId/filter/operators',
    auth.isAuthenticated({ projectRole: 'user' }),
    filters.getOperators
  )
}

export default init
