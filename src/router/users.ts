import { Router } from 'express'
import auth from '../auth/service'
import users from '../middleware/user'

const init = (router: Router) => {
  /**
   * Get current user.
   * @route GET /me
   * @group me
   * @security Bearer
   * @returns {User} 200 - Success.
   * @returns {AnnottoError.model} 400 - Invalid Credentials Error.
   * @returns {AnnottoError.model} 500 - Failed to get user.
   */
  router.get('/me', auth.isAuthenticated({}), users.me)

  /**
   * List users.
   * @route GET /users
   * @group users
   * @security Bearer
   * @returns {Array.<User>} 200 - Success.
   * @returns {AnnottoError.model}  400 - Invalid Credentials Error.
   * @returns {AnnottoError.model}  500 - Failed to list users.
   */

  router.get('/users', auth.isAuthenticated({}), users.index)

  /**
   * Create an account.
   * @route POST /users
   * @group users
   * @param {Auth.model} Auth.body.required Create account body.
   * @returns {User.model} 200 - Success.
   * @returns {AnnottoError.model} 400 - Invalid Credentials Error.
   * @returns {AnnottoError.model} 500 - Failed to register.
   */

  router.post('/users', auth.isAuthenticated({ realmRole: 'admin' }), users.register)

  /**
   * Get user.
   * @route GET /users/:idUser
   * @param {number} idUser.path.required User id.
   * @group users
   * @security Bearer
   * @returns {User.model} 200 - Success.
   * @returns {AnnottoError.model}  400 - Invalid Credentials Error.
   * @returns {AnnottoError.model}  500 - Failed to get user.
   */

  router.get('/users/:idUser', auth.isAuthenticated({}), users.getById)

  /**
   * Update user.
   * @route PUT /users/:idUser
   * @param {number} idUser.path.required User id.
   * @param {UserUpdate.model} UserUpdate.body.required User body.
   * @group users
   * @security Bearer
   * @returns {User.model} 200 - Success.
   * @returns {AnnottoError.model}  400 - Invalid Credentials Error.
   * @returns {AnnottoError.model}  401 - Malformed login payload.
   * @returns {AnnottoError.model}  500 - Failed to update user.
   */

  router.put('/users/:idUser', auth.isAuthenticated({}), users.update)

  /**
   * Remove user.
   * @route DELETE /users/:idUser
   * @param {number} idUser.path.required User id.
   * @group users
   * @security Bearer
   * @returns {object} 200 - Success.
   * @returns {AnnottoError.model}  400 - Invalid Credentials Error.
   * @returns {AnnottoError.model}  500 - User delete error.
   */
  router.delete('/users/:idUser', auth.isAuthenticated({}), users.destroy)

  /**
   * Forgot password.
   * @route POST /forgotpassword
   * @group auth
   * @param {string} email.body.required Forgot password body.
   * @returns {object} 200 - Success.
   * @returns {AnnottoError.model} 400 - Invalid Credentials Error.
   * @returns {AnnottoError.model} 500 - Failed to login.
   */

  router.post('/forgotpassword', users.forgotPassword)

  /**
   * Reset password.
   * @route PUT /resetpassword
   * @group auth
   * @param {Auth.model} Auth.body.required Reset password body.
   * @returns {object} 200 - Success.
   * @returns {AnnottoError.model} 400 - Invalid Credentials Error.
   * @returns {AnnottoError.model} 500 - Failed to login.
   */

  router.put('/resetpassword', users.resetPassword)
}

export default init
