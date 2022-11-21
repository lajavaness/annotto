import { Types, Schema, AnyObject, model } from 'mongoose'
import { User } from '../../types'

export type Filter = {
  _id: Types.ObjectId
  user: User
  project: Types.ObjectId
  payload: AnyObject
  criteria: string
}

const filterSchema = new Schema<Filter>(
  {
    user: {
      _id: { type: String, index: true },
      firstName: String,
      lastName: String,
      email: String,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      index: true,
    },
    payload: {},
    criteria: {},
  },
  {
    safe: false,
  }
)

export default model<Filter>('Filter', filterSchema)
