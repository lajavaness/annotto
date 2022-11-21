import { Readable } from 'stream'
import { pipeline } from 'stream/promises'
import { batch as Batch } from 'stream-json/utils/Batch'
import { ImportEntryPayload, ItemPayload, PredictionPayload, User } from '../../types'
import { logger } from '../../utils/logger'
import TaskModel from '../../db/models/tasks'
import { Project, ProjectDocument } from '../../db/models/projects'
import { validatePrediction, validateItem, validateAnnotation } from './jsonlines'
import { parse } from './ndjson'
import { convertToModel } from './predictions'
import { insertAnnotationsBatch } from '../annotations'
import { insertItemsBatch, updateItemsBatch, toCompositeUuid, findItemByCompositeUuid, saveItem } from '../items'
import { updateItemCount } from '../projects'
import config from '../../../config'

const { batchSize } = config.fileUpload

const debugPerf = (...args: [string, number, string?]) => {
  if (process.env.NODE_ENV !== 'test') {
    logger.info(...args)
  }
}

/**
 * Manage a stream of entries to validate.
 * @param {ReadableStream} stream The stream.
 * @param {function(object, number): (Promise.<void> | void)} validation The validation function.
 * @param {function(object[]): Promise.<void>} action The action function.
 */
const handleStream = async <T>(
  stream: Readable,
  validation: (elem: T, i: number) => Promise<void> | void,
  action: (options: T) => Promise<void>
) => {
  const batchStream = Batch({ batchSize })
  const parserStream = parse()

  const p = pipeline(stream, parserStream, batchStream)

  let i = 1
  const now = Date.now()
  let validationTime = 0
  let actionTime = 0
  let totalElems = 0
  for await (const batch of batchStream) {
    const validationNow = Date.now()
    await Promise.all(batch.map((item: T, j: number) => validation(item, j * i))) // eslint-disable-line no-loop-func
    validationTime += Date.now() - validationNow

    const actionNow = Date.now()
    await action(batch)
    actionTime += Date.now() - actionNow

    i++
    totalElems += batch.length
    debugPerf('total for now', totalElems)
  }
  debugPerf('validation took', validationTime / 1000, 's')
  debugPerf('action took', actionTime / 1000, 's')
  debugPerf('stream handled in', (Date.now() - now) / 1000, 's')
  debugPerf('number of elems:', totalElems)
  await p // ensure pipeline errors are caught by the caller
}

/**
 * Pipe items stream to ndjson transform stream, and to batch transform stream.
 * On query error, in catch, emit busboy error event with .destroy.
 * @param {ReadableStream} stream .
 * @param {boolean} isUpdate .
 * @param {Project} project .
 * @returns {Promise<{inserted: number, updated: number}>} .
 */
export const handleItemStream = async ({
  stream,
  isUpdate,
  project,
}: {
  stream: Readable
  isUpdate?: boolean
  project: Project
}) => {
  const response = {
    inserted: 0,
    updated: 0,
  }

  await handleStream(
    stream,
    // eslint-disable-next-line no-shadow
    (item, i) => validateItem(item, project.type, i),
    async (batch: ItemPayload[]) => {
      try {
        // insert or update batch items
        if (isUpdate) {
          await updateItemsBatch(batch, project._id, response)
        } else {
          await insertItemsBatch(project._id, batch)
          response.inserted += batch.length
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('E11000')) {
          throw new Error('Error project creation : Duplicate item uuid')
        }

        throw error
      }
    }
  )

  project.itemCount = await updateItemCount(project._id)

  return response
}

export const handleItemPredictionStream = async ({ stream, project }: { stream: Readable; project: Project }) => {
  const response = {
    inserted: 0,
  }
  const tasks = await TaskModel.find({ project: project._id })

  await handleStream(
    stream,
    (elem, i) => validatePrediction(elem, tasks, i),
    async (batch: { uuid: string; annotations: PredictionPayload }[]) => {
      // update items with predictions
      for (const line of batch) {
        const item = await findItemByCompositeUuid(toCompositeUuid(project, line))

        if (!item) throw new Error(`Error project creation: Cannot find item matching prediction.uuid (${line.uuid})`)
        item.predictions = convertToModel(line.annotations, project.filterPredictionsMinimum)
        response.inserted++
        await saveItem(item)
      }
    }
  )

  return response
}

/**
 * Handler for importing annotations.
 * @param {ReadableStream} stream .
 * @param {Project} project .
 * @param {User} _user .
 * @returns {Promise<{inserted: number, uuidNotFound: *[]}>} .
 */
export const handleAnnotationsImportStream = async ({
  stream,
  project,
  _user,
}: {
  stream: Readable
  project: ProjectDocument
  _user: User
}) => {
  const response: {
    inserted: number
    uuidNotFound: string[]
  } = {
    inserted: 0,
    uuidNotFound: [],
  }

  if (!project.populated('tasks')) {
    await project.populate('tasks').execPopulate()
  }

  await handleStream(stream, validateAnnotation, async (batch: ImportEntryPayload[]) =>
    insertAnnotationsBatch(project, batch, _user, response)
  )

  return response
}
