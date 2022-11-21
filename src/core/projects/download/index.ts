import archiver from 'archiver'
import fs from 'fs/promises'
import mongoose from 'mongoose'
import { Readable } from 'stream'
import tmp from 'tmp'
import { generateError, AnnottoError } from '../../../utils/error'
import { logger } from '../../../utils/logger'
import AnnotationModel, { Annotation } from '../../../db/models/annotations'
import CommentModel from '../../../db/models/comments'
import ClientModel from '../../../db/models/clients'
import ItemModel, { Item } from '../../../db/models/items'
import { Project } from '../../../db/models/projects'
import queryToStream from './queryToStream'
import { formatAnnotationsForExport, formatNerRelations } from '../../annotations'

export const exportAnnotations = (doc: Item, annotations: Annotation[]) => {
  const current: Annotation[] = []
  const old: Annotation[] = []

  annotations.forEach((elem) => (elem.status === 'done' ? current.push(elem) : old.push(elem)))

  return {
    annotationMetadata: {
      annotatedBy: doc.lastAnnotator?.email,
      annotatedAt: current.length ? current[0].updatedAt : null,
      createdAt: current.length ? current[0].createdAt : null,
    },
    annotation: formatNerRelations(doc, formatAnnotationsForExport(current)),
    historicAnnotations: old.map((a) => formatNerRelations(doc, formatAnnotationsForExport([a], true))),
  }
}

const formatExportItem = (withHistory: boolean) => async (doc: Item) => {
  const criteria: Record<string, unknown> = { item: doc._id }
  if (!withHistory) {
    criteria.status = 'done'
  }

  const [annotations, comments] = await Promise.all([
    AnnotationModel.find(criteria)
      .lean()
      .select('status updatedAt createdAt zone.x zone.y ner.start ner.end text -_id'),
    CommentModel.find({ item: doc._id })
      .sort({ createdAt: -1 })
      .lean()
      .select('comment user.email user.firstName user.lastName createdAt updatedAt -_id'),
  ])

  if (doc?.raw?.entitiesRelations) {
    delete doc.raw.entitiesRelations
  }
  return {
    uuid: doc.uuid,
    item: doc.raw,
    itemMetadata: {
      createdAt: doc.createdAt,
      updated: doc.updatedAt,
      seenAt: doc.seenAt,
    },
    tags: doc.tags,
    comments,
    metadata: doc.metadata,
    ...exportAnnotations(doc, annotations),
  }
}

const addToZip = (archive: archiver.Archiver, name: string, promise: Promise<Readable | { name: string }>) =>
  promise.then((file) =>
    file instanceof Readable ? archive.append(file, { name }) : archive.file(file.name, { name })
  )

const cleanupItem = async (doc: Item) => {
  const newDoc = {
    uuid: doc.uuid,
    data: doc.data,
    description: doc.description,
    type: doc.type,
    annoted: doc.annotated,
    annotedBy: doc.annotatedBy,
    entitiesRelations: doc.entitiesRelations,
    predictions: doc.predictions,
    highlights: doc.highlights,
    tags: doc.tags,
    annotedAt: doc.annotatedAt,
    seenAt: doc.seenAt,
    createdAt: doc.createdAt,
    velocity: doc.velocity,
    lastAnnotator: {
      email: doc.lastAnnotator?.email,
    },
    metadata: doc.metadata,
    sourceHighlights: doc.sourceHighlights,
  }

  Object.keys(newDoc).forEach((key) => {
    const tskey = <keyof typeof newDoc>key
    const fieldValue = newDoc[tskey]
    if (Array.isArray(fieldValue) && !fieldValue.length) {
      delete newDoc[tskey]
    }
  })

  return newDoc
}

const configToFile = async (project: Project) => {
  const file = tmp.fileSync()

  const client = await ClientModel.findById(project.client)

  const config = {
    tasks: project.tasks,
    name: project.name,
    client: client ? client.name : '',
    type: project.type,
    guidelines: project.guidelines,
    highlights: project.highlights,
    // shortDescription: project.shortDescription,
    description: project.description,
    admins: project.admins,
    users: project.users,
    dataScientists: project.dataScientists,
    defaultTags: project.defaultTags,
    similarityEndpoint: project.similarityEndpoint,
    showPredictions: project.showPredictions,
    prefillPredictions: project.prefillPredictions,
    filterPredictionsMinimum: project.filterPredictionsMinimum,
    deadline: project.deadline,
    entitiesRelationsGroup: project.entitiesRelationsGroup,
  }

  await fs.appendFile(file.name, JSON.stringify(config, null, 3))
  return file
}

const download = async (
  projectId: mongoose.Types.ObjectId | string,
  project: Project,
  { annotationsAndComments = false, withHistory = false, allItems = false, config = false }
) => {
  const archive = archiver('zip', { zlib: { level: 9 } })

  let archiveError: AnnottoError | undefined

  archive.on('error', (error) => {
    console.error(error)
    logger.error(error)

    archiveError = generateError({
      code: 500,
      message: 'ERROR_ARCHIVER_STREAM',
    })
  })

  const promises = []

  if (annotationsAndComments) {
    const filename = 'annotations.jsonlines'
    const query = ItemModel.find({ project: projectId, annotated: true }).select(
      'raw tags metadata entitiesRelations createdAt updatedAt seenAt lastAnnotator.email'
    )
    const action = formatExportItem(withHistory)
    promises.push(addToZip(archive, filename, queryToStream(query, filename, action)))
  }

  if (allItems) {
    const filename = 'items.jsonlines'
    const query = ItemModel.find({ project: projectId })
    promises.push(addToZip(archive, filename, queryToStream(query, filename, cleanupItem)))
  }

  if (config) {
    promises.push(addToZip(archive, 'config.json', configToFile(project)))
  }

  await Promise.all(promises)

  // to catch an error that may have happened during the promises
  if (archiveError) {
    throw archiveError
  }

  return archive
}

export default {
  download,
  exportAnnotations,
}
