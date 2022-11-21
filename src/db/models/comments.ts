import { Types, Schema, Document, model } from 'mongoose'
import { User } from '../../types'

export type Comment = {
  _id: Types.ObjectId
  comment: string
  user: User
  item: Types.ObjectId
  project: Types.ObjectId
  updatedAt: Date
  createdAt: Date
}

export type CommentDocument = Comment & Document<unknown, unknown, Comment>

const commentSchema = new Schema<Comment>({
  comment: {
    type: String,
  },
  user: {
    _id: { type: String, index: true },
    firstName: String,
    lastName: String,
    email: String,
  },
  item: {
    type: Schema.Types.ObjectId,
    ref: 'Item',
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
  },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
})

commentSchema.pre(/save/, function save(this: CommentDocument, next: () => void, params: User) {
  this.updatedAt = new Date()
  this.$locals.params = params
  this.user = params

  next()
})

export default model<Comment>('Comment', commentSchema)
