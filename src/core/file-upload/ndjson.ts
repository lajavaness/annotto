import split from 'split2'
import { Transform } from 'stream'
import { generateFileError } from './error'

export const parse = (opts?: split.Options & { strict?: boolean }) => {
  opts = opts || {}
  opts.strict = opts.strict !== false

  let count = 0

  function parseRow(this: Transform, row: string) {
    try {
      if (row) {
        const parsed = JSON.parse(row)
        count++
        return parsed
      }
      return null
    } catch (e) {
      if (opts && opts.strict) {
        const error = generateFileError({
          message: `Could not parse row ${row.slice(0, 50)}...`,
          lineNumber: count,
        })
        this.emit('error', error)
      }
      return null
    }
  }

  return split(parseRow, opts)
}
