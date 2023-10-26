import express from 'express'
import { Token } from 'keycloak-connect'
import { AccessToken } from '../types'
import { logger } from '../utils/logger'
import ProfileModel, { ProfileRole } from '../db/models/profiles'
import ProjectModel, { Project } from '../db/models/projects'
import { keycloak } from './index'
import config from '../../config'

/**
 * Search projects groups, corresponding to route projectRole permission, for user email
 * ( eg : if projectRole on route is user, will look in all 3 project's user groups for user email ).
 * @param {string} projectRole .
 * @param {string} email .
 * @param {Project.model} project .
 * @returns {boolean} True or false the project is associated with a user that has the role we want.
 * @private
 */
export const haveAccessRole = (projectRole: string, email: string, project: Project) => {
  const roleAndGroups = [
    { value: 'user', groups: ['users', 'dataScientists', 'admins'] },
    { value: 'dataScientist', groups: ['dataScientists', 'admins'] },
    { value: 'admin', groups: ['admins'] },
  ].find((elem) => elem.value === projectRole)

  return (
    roleAndGroups &&
    roleAndGroups.groups.some((groupName) => {
      if (groupName === 'admins' || groupName === 'users' || groupName === 'dataScientists') {
        return project[groupName].includes(email)
      }

      return false
    })
  )
}

/**
 * Get the profile out of the token and save it if not found.
 * @param {express.Request} req Express Request.
 * @param {express.Response} res Express Response.
 * @param {express.NextFunction} next Next middleware to run.
 * @private
 * @returns {Promise<void>}
 */
const _getProfile = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    let profile = await ProfileModel.findOne({ user: req._user.email })
    const tokenRole = req.token.content && req.token.content.resource_access[config.keycloak.resource].roles[0]

    if (!profile) {
      const newProfile = new ProfileModel({
        user: req._user._id,
        email: req._user.email,
        // TODO : Warning about this. There can be multiple roles coming from OAuth. So either take the first one, or,
        // make sure the DB can hold an array of roles
        role: tokenRole || [],
      })
      profile = await newProfile.save()
    } else if (profile.role !== tokenRole) {
      profile.role = tokenRole as ProfileRole
      profile = await profile.save()
    }

    req._user.profile = profile
    next()
  } catch (err) {
    logger.info(err)
    logger.error(err instanceof Error ? err.stack : 'Invalid Error')

    res.status(500).json({
      code: 500,
      message: 'INTERNAL_SERVER_ERROR',
    })
  }
}

/**
 * Sets the project from the request by id into the request.
 * @param {express.Request} req .
 * @param {express.Response} res .
 * @param {express.NextFunction} next .
 * @returns {Promise<void>}
 * @private
 */
const _getProject = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    if (req.params.projectId) {
      const project = await ProjectModel.findById(req.params.projectId).select('+s3').populate('tasks')

      if (!project) {
        res.status(404).json({
          code: 404,
          message: 'ERROR_PROJECT_NOT_FOUND',
        })
        return
      }
      req._project = project
    }
    next()
  } catch (err) {
    logger.info(err)
    logger.error(err instanceof Error ? err.stack : 'Invalid Error')

    res.status(500).json({
      code: 500,
      message: 'INTERNAL_SERVER_ERROR',
    })
  }
}

/**
 * Express middleware
 * Verify the role wanted from the role in the token and the role associated with the project.
 * @param {string|null} projectRole Project role.
 * @param {string|null} realmRole Realm role.
 * @returns {express.RequestHandler} .
 * @private
 */
const _verifyPermissions =
  (projectRole?: string, realmRole?: string) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.token.hasRole('admin')) {
      // Test roles hierarchy admin > dataScientist > user
      if (realmRole) {
        if (realmRole === 'admin' && req.token.hasRole('admin')) {
          next()
          return
        }
        if (realmRole === 'dataScientist' && (req.token.hasRole('dataScientist') || req.token.hasRole('admin'))) {
          next()
          return
        }
        if (
          realmRole === 'user' &&
          (req.token.hasRole('dataScientist') || req.token.hasRole('admin') || req.token.hasRole('user'))
        ) {
          next()
          return
        }

        res.status(403).json({
          code: 403,
          message: 'FORBIDDEN_PROFILE_NOT_ALLOWED',
        })
        return
      }

      if (projectRole) {
        if (haveAccessRole(projectRole, (req._user.profile && req._user.profile.email) || '', req._project)) {
          next()
          return
        }
        res.status(403).json({
          code: 403,
          message: 'FORBIDDEN_ROLE_NOT_ALLOWED',
        })
        return
      }
    }

    // Let go
    next()
  }

/**
 * Retrieve the token from the request, save it to the request.
 * @returns {GuardFn} .
 * @private
 */
function _retrieveAndSaveToken() {
  return (token: Token, request: express.Request) => {
    // keycloak.d.ts doesn't have a property called "content". This is a bug. While its been fixed, we ignore this error
    const kcToken = token as AccessToken
    if (!kcToken.content) return false

    request._user = {
      _id: kcToken.content.sub,
      email: kcToken.content.email,
      firstName: kcToken.content.given_name,
      lastName: kcToken.content.family_name,
    }
    request.token = kcToken

    return true
  }
}

/**
 * Generates an authentication middleware.
 * @param {object} opts The options.
 * @param {string|undefined} [opts.projectRole] Role regarding a specific project.
 * @param {string|undefined} [opts.realmRole] Realm role (platform-wise).
 * @returns {Array<express.RequestHandler>} The middlewares.
 */
const isAuthenticated = ({
  projectRole = undefined,
  realmRole = undefined,
}: {
  projectRole?: string
  realmRole?: string
}) => {
  return [
    keycloak.protect(_retrieveAndSaveToken()),
    _getProfile,
    _getProject,
    _verifyPermissions(projectRole, realmRole),
  ]
}

export default {
  isAuthenticated,
  haveAccessRole,
}
