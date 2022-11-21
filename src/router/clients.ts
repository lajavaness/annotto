import { Router } from 'express'
import auth from '../auth/service'
import clients from '../middleware/clients'
import { schemaValidationMiddleware } from '../middleware/schema-validation-middleware'
import { createClientSchema } from './validation/client'

const init = (router: Router) => {
  /**
   * @typedef ClientPayload
   * @property {string} name.required - Client name.
   * @property {string} description - Client Description.
   * @property {boolean} isActive - Client status.
   */

  /**
   * @typedef Client
   * @property {string} name - Client name.
   * @property {string} description - Client Description.
   * @property {string} id - Client id.
   * @property {boolean} isActive - Client status.
   */

  /**
   * List clients ( realmRole : dataScientist ) - Check List Model for pagination details.
   * @route GET /clients
   * @group clients
   * @security Bearer
   * @param {string} index.query Page index to fetch ( Pages are arrays of data with a length set by limit ).
   * @param {string} limit.query Page length ( default : 10 ). *.
   * @returns {List.model} 200 - Success.
   * @returns {AnnottoError.model}  401 - Unauthorized.
   * @returns {AnnottoError.model}  403 - Forbidden.
   * @returns {AnnottoError.model}  500 - Server Error.
   */
  router.get('/clients', auth.isAuthenticated({}), clients.index)

  /**
   * Get a specific client  ( realmRole : dataScientist ).
   * @route GET /clients/:clientId
   * @group clients
   * @security Bearer
   * @param {string} clientId.path.required Client id.
   * @returns {Client.model} 200 - Success.
   * @returns {AnnottoError.model}  401 - Not authorized.
   * @returns {AnnottoError.model}  403 - Forbidden.
   * @returns {AnnottoError.model}  404 - Client not found.
   * @returns {AnnottoError.model}  500 - Fail to get client.
   */

  router.get('/clients/:clientId', auth.isAuthenticated({ realmRole: 'dataScientist' }), clients.getById)

  /**
   * Create client ( realmRole : dataScientist ).
   * @route POST /clients
   * @group clients
   * @security Bearer
   * @param {ClientPayload.model} ClientPayload.body.required .
   * @returns {Client.model} 200 - Success.
   * @returns {AnnottoError.model}  400 - Invalid Payload.
   * @returns {AnnottoError.model}  401 - Not authorized.
   * @returns {AnnottoError.model}  403 - Forbidden.
   * @returns {AnnottoError.model}  500 - Fail to create client.
   */

  router.post(
    '/clients',
    auth.isAuthenticated({ realmRole: 'dataScientist' }),
    schemaValidationMiddleware({ schemaBody: createClientSchema }),
    clients.create
  )

  /**
   * Update a specific client  ( realmRole : dataScientist ).
   * @route PUT /clients/:clientId
   * @param {string} clientId.path.required Client id.
   * @param {ClientPayload.model} ClientPayload.body.required .
   * @group clients
   * @security Bearer
   * @returns {Client.model} 200 - Success.
   * @returns {AnnottoError.model}  400 - Invalid Payload.
   * @returns {AnnottoError.model}  401 - Not authorized.
   * @returns {AnnottoError.model}  403 - Forbidden.
   * @returns {AnnottoError.model}  404 - Client not found.
   * @returns {AnnottoError.model}  500 - Fail to update client.
   */

  router.put(
    '/clients/:clientId',
    auth.isAuthenticated({ realmRole: 'dataScientist' }),
    schemaValidationMiddleware({ schemaBody: createClientSchema }),
    clients.update
  )

  /**
   * Delete a specific client  ( realmRole : admin ).
   * @route DELETE /clients/:clientId
   * @param {string} clientId.path.required Client id.
   * @group clients
   * @security Bearer
   * @returns {} 200 - Success.
   * @returns {AnnottoError.model}  401 - Not authorized.
   * @returns {AnnottoError.model}  403 - Forbidden.
   * @returns {AnnottoError.model}  404 - Client not found.
   * @returns {AnnottoError.model}  500 - Fail to delete client.
   */

  router.delete('/clients/:clientId', auth.isAuthenticated({ realmRole: 'admin' }), clients.destroy)
}

export default init
