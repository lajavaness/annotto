import { Router } from 'express'
import auth from '../auth/service'
import items from '../middleware/items'
import { schemaValidationMiddleware } from '../middleware/schema-validation-middleware'
import { updateItemSchema, annotationPayloadSchema } from './validation/item'
/**
 * @typedef Item
 * @property { string } _id - Id of the items.
 * @property { string } type - Type of the project.
 * @property { string } uuuid - Data uuid.
 * @property { string } type - Type of the data.
 * @property { boolean } annotated - Data already annotated.
 * @property { Array.<string> } tags - List of tags assigned to the data.
 * @property { string } status - Status of the data.
 * @property { object } predictions - Predictions of tasks.
 * @property { string } description - Description of the data.
 */

/**
 * @typedef ItemPayload
 * @property {Array.<string>} tags - List of tags to assign to the item.
 */

/**
 * @typedef Zone
 * @property {number} x - X.
 * @property {number} y - Y.
 */

/**
 * @typedef Ner
 * @property {number} start - Start index.
 * @property {number} end - End index.
 */

/**
 * @typedef Relation
 * @property {object} src - Annotation object : source task.
 * @property {object} dest - Annotation object : destination task.
 * @property {string} value - Value of the relation between the two.
 */

/**
 * @typedef Annotation
 * @property {string} value - Value of the annotation.
 * @property {Array.<Zone>} zone - Zone to annotate.
 * @property {Ner.model} ner - Ner to annotate.
 */

/**
 * @typedef AnnotationPayload
 * @property { Array.<Annotation>} annotations.required - List of annotations.
 * @property { Array.<Relation>} entitiesRelations - List of relations.
 */

/**
 * @typedef AnnotationList
 * @property {UserExtern.model} user - Annotator.
 * @property {string} status - Status of the annotation.
 * @property {string} item - _id of the item.
 * @property {string} value - Value of the annotation.
 * @property {Array.<Zone>} zone - Array of zone.
 * @property {object} task - Classification.
 * @property {Ner.model} ner - Ner.
 */

const init = (router: Router) => {
  /**
   * List project items ( min project role : user ) - Check List Model for pagination details.
   * @route GET /projects/:projectId/items
   * @group items
   * @security Bearer
   * @returns { List.model } 200 - Success.
   * @returns {AnnottoError.model} 401 - Not authorized.
   * @returns {AnnottoError.model} 403 - Forbidden.
   * @returns {AnnottoError.model} 500 - Server Error.
   */

  router.get('/projects/:projectId/items', auth.isAuthenticated({ projectRole: 'user' }), items.index)

  /**
   * List items tags ( min project role : user ).
   * @route GET /projects/:projectId/items/tags
   * @group items
   * @security Bearer
   * @returns { Array.<string> } 200 - Success.
   * @returns {AnnottoError.model} 401 - Not authorized.
   * @returns {AnnottoError.model} 403 - Forbidden.
   * @returns {AnnottoError.model} 500 - Server Error.
   */

  router.get('/projects/:projectId/items/tags', auth.isAuthenticated({ projectRole: 'user' }), items.getTags)

  /**
   * Get a project item to annotate ( min project role : user ).
   *
   * FindOne sorted by descending seenAt ( an unseen item will be given first, then the oldest seen one ).
   * @route GET /projects/:projectId/items/next
   * @group items
   * @security Bearer
   * @returns { List.model } 200 - Success.
   * @param {string} filterId Pass a filter's id as query param "filterId", to get an item using the filter.
   * @returns {AnnottoError.model} 401 - Not authorized.
   * @returns {AnnottoError.model} 403 - Forbidden.
   * @returns {AnnottoError.model} 404 Filter not found.
   * @returns {AnnottoError.model} 500 Fail to list items.
   */

  router.get('/projects/:projectId/items/next', auth.isAuthenticated({ projectRole: 'user' }), items.next)

  /**
   * Get a specific item by Uuid ( min project role : user ).
   * @route GET /projects/:projectId/items/by-uuid/:itemUuid
   * @group items
   * @security Bearer
   * @returns { Item.model } 200 - Success.
   * @returns {AnnottoError.model} 401 - Not authorized.
   * @returns {AnnottoError.model} 403 - Forbidden.
   * @returns {AnnottoError.model} 404 Item not found.
   * @returns {AnnottoError.model} 500 Fail to get item.
   */

  router.get(
    '/projects/:projectId/items/by-uuid/:itemUuid',
    auth.isAuthenticated({ projectRole: 'user' }),
    items.getByUuid
  )

  /**
   * Get a specific item ( min project role : user ).
   * @route GET /projects/:projectId/items/:itemId
   * @group items
   * @security Bearer
   * @returns { Item.model } 200 - Success.
   * @returns {AnnottoError.model} 401 - Not authorized.
   * @returns {AnnottoError.model} 403 - Forbidden.
   * @returns {AnnottoError.model} 404 Item not found.
   * @returns {AnnottoError.model} 500 Fail to get item.
   */

  router.get('/projects/:projectId/items/:itemId', auth.isAuthenticated({ projectRole: 'user' }), items.getById)

  /**
   * Update a specific item ( min project role : user ).
   * @route PUT /projects/:projectId/items/:itemId
   * @group items
   * @security Bearer
   * @param {ItemPayload.model} item.body.required
   * @returns { Item.model } 200 - Success.
   * @returns {AnnottoError.model} 401 - Not authorized.
   * @returns {AnnottoError.model} 404 Item not found.
   * @returns {AnnottoError.model} 500 Fail to list items.
   */
  router.put(
    '/projects/:projectId/items/:itemId',
    auth.isAuthenticated({ projectRole: 'user' }),
    schemaValidationMiddleware({ schemaBody: updateItemSchema }),
    items.update
  )

  /**
   * Get list of the annotations of an item ( min project role : user ).
   * @route GET /projects/:projectId/items/:itemId/annotations
   * @group items
   * @security Bearer
   * @returns { AnnotationList.model } 200 - Success.
   * @returns { Error } 401 - Not authorized.
   * @returns { Error } 500 Fail to list items.
   */
  router.get(
    '/projects/:projectId/items/:itemId/annotations',
    auth.isAuthenticated({ projectRole: 'user' }),
    items.annotations
  )

  /**
   * Annotate an item from a project ( min project role : user ).
   *
   * Payload for tasks project :
   * ```{"annotations":[{"value":"myClassif"}]}```.
   *
   * Payload for NER project :
   * ```{"annotations":[{"value":"myClassif", "ner": {"start": 0, "end": 10}}]}```.
   *
   * Payload for Zone project :
   * ```{"annotations":[{"value":"myClassif", "zone": [{x:0.1, y:0.2}, {x:0.2, y:0.3}, {x:0.3, y:0.4}]}]}```.
   *
   * -------------.
   *
   * To add relations between entities use optionnal entitiesRelations :
   * ```{"annotations":[{"value":"myClassif", "ner": {"start": 0, "end": 10}}, {"value":"myClassif2", "ner": {"start": 10, "end": 20}}], "entitiesRelations": [{"src": {"value":"myClassif", "ner": {"start": 0, "end": 10}}, "dest": {"value":"myClassif2", "ner": {"start": 10, "end": 20}}, "value": "myRelation"}]}```.
   *
   * @route POST /projects/:projectId/items/:itemId/annotate
   * @group items
   * @security Bearer
   * @param { AnnotationPayload.model} payload.body.required Annotation.
   * @returns { Item.model } 200 - Success Returns item's annotations.
   * @returns {AnnottoError.model} 401 - Not authorized.
   * @returns {AnnottoError.model} 500 Fail to list items.
   */
  router.post(
    '/projects/:projectId/items/:itemId/annotate',
    auth.isAuthenticated({ projectRole: 'user' }),
    schemaValidationMiddleware({ schemaBody: annotationPayloadSchema }),
    items.annotate
  )

  /**
   * Upload a jsonlines file of project items ( min project role : admin ).
   *
   * Jsonlines Image format :
   * ```{ "uuid": "d7bb0128-c478", "datatype": "image", "data": { "url": "myImageUrl"}} ```.
   *
   * Jsonlines Text format :
   * ```{ "uuid": "fbf945d8-4afa", "datatype": "text", "data" : { "text": "Bonjour, je souhaite ... "} }```.
   *
   * @route POST /projects/:projectId/items/upload
   * @group items
   * @security Bearer
   * @param { file } file.body.required File with items.
   * @returns {AnnottoError.model} 401 - Not authorized.
   * @returns {AnnottoError.model}  403 - Forbidden.
   * @returns {AnnottoError.model} 500 Fail to list items.
   */

  router.post('/projects/:projectId/items/upload', auth.isAuthenticated({ projectRole: 'admin' }), items.itemsUpload)

  /**
   * Upload a jsonlines file of predictions for items uuid ( min project role : admin ).
   *
   * TEXT prediction format
   * ```{ "uuid": "d7bb0128-c478", "annotations": { "myTextCategory": { "entities": [{"value": "myClassificationValueCode", "text": "lorem impsum" }] }}}```.
   *
   * NER prediction format
   * ```{ "uuid": "d7bb0128-c478", "annotations": { "myNERCategory": { "entities": [{"value": "myClassificationValueCode", "start": 34, "end": 38 }] }}}```.
   *
   * Zone prediction format
   * ```{ "uuid": "d7bb0128-c478", "annotations": { "myZoneCategory": { "entities": [ {"value": "myClassificationValueCode", "coords": [ {"x": 0.1, "y": 0.2}, {"x": 0.2, "y": 0.3}, {"x": 0.4, "y": 0.5} ]} ]}}}```.
   *
   * Classification prediction format
   * ```{ "uuid": "d7bb0128-c478", "annotations": { "myClassificationCategory": { "labels": [ {"value":"myClassificationValueCode" , "proba": 0.99 } ] }}}```.
   *
   * Zone AND Classification format
   * ```{ "uuid": "526ccc0c-ebab", "annotations": { "myClassificationCategory": { "labels": [ {"value": "myClassificationValueCode", "proba": 0.99 } ] }}, "zone": { "myZoneCategory": { "entities": [ {"value": "bbox_name", "coords": [{"x": 0.1, "y": 0.2}, {"x": 0.3, "y": 0.4}, {"x": 0.5, "y": 0.6}] } ]}}}```.
   *
   * NER AND Classification format
   * ```{ "uuid": "76030ac8-6d2d", "annotations": { "myClassificationCategory": { "labels":[{"value": "myClassificationValueCode", "proba": 0.99}] }}, "ner": { "myNERCategory": { "entities": [{"value": "name", "start": 23, "end": 33 }] }}}```.
   *
   * @route POST /projects/:projectId/items/predictionsUpload
   * @group items
   * @security Bearer
   * @param { file } file.body.required File with predictions.
   * @returns {AnnottoError.model} 401 - Not authorized.
   * @returns {AnnottoError.model}  403 - Forbidden.
   * @returns {AnnottoError.model} 500 Fail to list items.
   */
  router.post(
    '/projects/:projectId/items/predictionsUpload',
    auth.isAuthenticated({ projectRole: 'admin' }),
    items.predictionUpload
  )
}

export default init
