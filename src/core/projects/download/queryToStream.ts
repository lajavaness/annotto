import mongoose from 'mongoose'
import Stream from 'stream'
import { logger } from '../../../utils/logger'

/**
 * This function takes a mongoose query, and transforms the result
 * into a stringified version with the action parameter
 * The filename is only here for logging.
 * @param {object} query The query.
 * @param {string} filename The filename.
 * @param {function(object): Promise.<object>} action The action.
 * @returns {Promise.<Stream.Readable>} The stream.
 */
const queryToStream = async <T, U>(
  query: mongoose.Query<T[], T>,
  filename: string,
  action: (arg: T) => Promise<U>
): Promise<Stream.Readable> => {
  const cursor = query.lean().cursor()
  let len = 0
  return new Stream.Readable({
    async read() {
      const item = await cursor.next()
      if (!item) {
        logger.info(`${filename} file length:`, Math.round((len / 1024 / 1024) * 100) / 100, 'Mb')
        this.push(null)
        return
      }
      const str = JSON.stringify(await action(item))
      len += str.length
      this.push(`${str}\n`)
    },
  })
}

export default queryToStream
