import { Router } from 'express'
import auth from '../auth/service'
import projects from '../middleware/projects'
import comments from '../middleware/comments'
import logs from '../middleware/logs'
import tasks from '../middleware/tasks'
import { schemaValidationMiddleware } from '../middleware/schema-validation-middleware'
import { updateProjectSchema, statsViewsQuerySchema } from './validation/project'
import { createCommentSchema } from './validation/comment'

const init = (router: Router) => {
  /**
   * @typedef Project
   * @property {string} name.required - Project name.
   * @property {boolean} active.required - Project is active.
   * @property {string} description.required - Project description.
   * @property {string} client - ClientId of project owner.
   */

  /**
   * @typedef Import
   * @property {Project.model} project.required - Project model.
   * @property {object} items.required - Informations about items import.
   * @property {object} predictions - Informations about predictions import.
   * @property {object} annotations - Annotations to import.
   */

  /**
   * @typedef ProjectCreated
   * @property {string} name - Project name.
   * @property {boolean} active - Project is active.
   * @property {string} description - Project description.
   * @property {string} client - ClientId of project owner.
   * @property {string} _id - Project id.
   */

  /**
   * @typedef Log
   * @property {string} type.required - Type of the log.
   * @property {string} comment - Comment concerned by the log.
   * @property {string} project - Project concerned by the log.
   * @property {string} mission - Mission concerned by the log.
   * @property {string} annotation - Annotation concerned by the log.
   * @property {object} task - Classification concerned by the log.
   * @property {string} item - Item concerned by the log.
   * @property {UserExtern.model} user - Project concerned by the log.
   * @property {string} commentMessage - Content of comment.
   * @property {Array.<string>} tags - Tags.
   */

  /**
   * List projects with stats ( min profile : user ( default ) )
   * See confluence Doc for more details : https://lajavaness.atlassian.net/wiki/spaces/AN/pages/2086371385/Permissions.
   * @route GET /projects
   * @group projects
   * @security Bearer
   * @returns {List.model} 200 - Success.
   * @returns {AnnottoError.model}  401 - Not authorized.
   * @returns {AnnottoError.model}  500 Fail to list projects.
   */
  router.get('/projects', auth.isAuthenticated({}), projects.index)

  /**
   * Get a specific project ( min project role : user ).
   * @route GET /projects/:projectId
   * @group projects
   * @security Bearer
   * @returns {ProjectCreated.model} 200 - Success.
   * @returns {AnnottoError.model}  401 - Not authorized.
   * @returns {AnnottoError.model}  404 - Client not found.
   * @returns {AnnottoError.model}  500 Fail to get project.
   */

  router.get('/projects/:projectId', auth.isAuthenticated({ projectRole: 'user' }), projects.getById)

  /**
   * Update a specific project ( min project role : dataScientist ).
   * @route PUT /projects/:projectId
   * @group projects
   * @security Bearer
   * @returns {ProjectCreated.model} 200 - Success.
   * @returns {AnnottoError.model}  401 - Not authorized.
   * @returns {AnnottoError.model}  403 - Forbidden.
   * @returns {AnnottoError.model}  500 Fail to update project.
   */

  router.put(
    '/projects/:projectId',
    auth.isAuthenticated({ projectRole: 'dataScientist' }),
    schemaValidationMiddleware({ schemaBody: updateProjectSchema }),
    projects.update
  )

  /**
   * Delete a specific project and all the data linked to it.
   * @route DELETE /projects/:projectId
   * @group projects
   * @security Bearer
   * @returns {} 200 - Success.
   * @returns {AnnottoError.model}  401 - Not authorized.
   * @returns {AnnottoError.model}  403 - Forbidden.
   * @returns {AnnottoError.model}  500 Fail to update project.
   */

  router.delete('/projects/:projectId', auth.isAuthenticated({ projectRole: 'admin' }), projects.remove)

  /**
   * Create project ( min profile: dataScientist )
   * FORM POST.
   *
   * Required : "project" and "items" files
   * optionnal : "predictions" and "annotations" files.
   *
   * For items file format : See /items/upload description
   * for predictions file format : See /items/predictionsUpload description
   * for annotations file format : See /project/:id/importAnnotations description.
   *
   * @route POST /projects/import
   * @group projects
   * @security Bearer
   * @returns {Import.model} 200 - Success.
   * @returns {AnnottoError.model}  401 - Not authorized.
   * @returns {AnnottoError.model}  403 - Forbidden.
   * @returns {AnnottoError.model}  500 Fail to create project.
   */

  router.post('/projects/import', auth.isAuthenticated({ realmRole: 'dataScientist' }), projects.createProject)
  /**
   * Extract Annotations from a projects  ( min project role : dataScientist ).
   * @route GET /projects/:projectId/exports
   * @group projects
   * @security Bearer
   * @return { Error } 401 - Not authorized.
   * @returns {AnnottoError.model}  403 - Forbidden.
   * @return { file } 200 - File with annotations.
   */
  router.get('/projects/:projectId/exports', auth.isAuthenticated({ projectRole: 'dataScientist' }), projects.download)

  /**
   * Imports jsonlines annotations file into a project ( min project role : dataScientist ).
   *
   * File jsonlines example :
   * ```{"item":{"uuid":"e1c7b817-7f20","datatype":"image","data":{"url":"myImageUrl"}},"markers":[],"comments":[],"itemMetadata":{"createdAt":"2020-11-16T13:43:56.370Z","updated":"2020-11-16T13:57:22.387Z","seenAt":"2020-11-16T13:57:22.386Z"},"annotationMetadata":{"annotatedBy":"admin@lajavaness.com", "annotatedAt":"2020-11-16T13:57:10.252Z","createdAt":"2020-11-16T13:57:10.245Z"},"annotation":{"zone":{"myZONECategory":{"entities":[{"value":"bbox_Exp","coords":[{"_id":"5fb285367a3861001b16961d","x":0.37733990147783253,"y":0.6704718417047184},{"_id":"5fb285367a3861001b16961e","x":0.9596059113300492,"y":0.6704718417047184},{"_id":"5fb285367a3861001b16961f","x":0.9596059113300492,"y":0.9208523592085236},{"_id":"5fb285367a3861001b169620","x":0.37733990147783253,"y":0.9208523592085236}]} ]}}}}```.
   *
   * @route POST /projects/:projectId/importAnnotations
   * @group projects
   * @security Bearer
   * @return { Error} 401 - Not authorized.
   * @returns {AnnottoError.model}  403 - Forbidden.
   * @return {object} 200 - Success.
   */

  router.post(
    '/projects/:projectId/importAnnotations',
    auth.isAuthenticated({ projectRole: 'dataScientist' }),
    projects.importAnnotations
  )

  /**
   * List stats of a projects depending of view ( min project role : user ).
   * @group projects
   * @security Bearer
   * @return { Error }401 - Not authorized.
   * @return {Array.<object> } 200 - Array of stats.
   */
  router.get(
    '/projects/:projectId/stats/:view',
    auth.isAuthenticated({ projectRole: 'user' }),
    schemaValidationMiddleware({ schemaParams: statsViewsQuerySchema }),
    projects.stats
  )
  /**
   * @typedef Comment
   * @property {string} comment - Comment.
   * @property {object} user - User who create the comment.
   * @property {string} item - _id of the item.
   * @property {string} batch - _id of the batch.
   * @property {string} project - _id of the project.
   */

  /**
   * @typedef CommentCreate
   * @property {string} comment.required - Comment.
   * @property {string} item - _id of the item.
   * @property {string} batch - _id of the batch.
   */

  /**
   * List comments ( min project role : user ).
   * @route GET /projects/comments/:projectId
   * @group comments
   * @security Bearer
   * @returns {Array.<Comment>} 200 - Success.
   * @returns {Error } 401 - Not authorized.
   * @returns {AnnottoError.model} 500 Fail to list comments.
   */
  router.get('/projects/comments/:projectId', auth.isAuthenticated({ projectRole: 'user' }), comments.index)

  /**
   * Create comment ( min project role : user ).
   * @route POST /projects/comments/:projectId
   * @group comments
   * @security Bearer
   * @param {CommentCreate.model} comment.body.required Comment.
   * @returns {Comment.model} 200 - Success.
   * @returns {Error } 401 - Not authorized.
   * @returns {AnnottoError.model} 500 Fail to create comments.
   */
  router.post(
    '/projects/comments/:projectId',
    auth.isAuthenticated({ projectRole: 'user' }),
    schemaValidationMiddleware({ schemaBody: createCommentSchema }),
    comments.create
  )

  /**
   * List logs ( min project role : user ).
   * @route GET /projects/logs/:projectId
   * @group logs
   * @security Bearer
   * @returns { Array.<Log>} 200 - Success.
   * @returns { Error } 401 - Not authorized.
   * @returns { Error } 500 Fail to list logs.
   */

  router.get('/projects/logs/:projectId', auth.isAuthenticated({ projectRole: 'user' }), logs.index)

  /**
   * List users ( min project role : user ).
   * @route GET /projects/users/:projectId
   * @group users
   * @security Bearer
   * @returns { Array.<Log>} 200 - Success.
   * @returns { Error } 401 - Not authorized.
   * @returns { Error } 500 Fail to list users.
   */

  router.get('/projects/users/:projectId', auth.isAuthenticated({ projectRole: 'user' }), projects.getUsers)

  /**
   * List project tasks ( min project role : user ).
   * @route GET /projects/:projectId/tasks
   * @group projects
   * @security Bearer
   * @returns {Comment.model} 200 - Success.
   * @returns {Error } 401 - Not authorized.
   * @returns {AnnottoError.model} 500 Fail to list.
   */
  router.get('/projects/:projectId/tasks', auth.isAuthenticated({ projectRole: 'user' }), tasks.index)
}

export default init
