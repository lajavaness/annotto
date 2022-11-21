import { Types, Schema, PopulatedDoc, Document, model } from 'mongoose'
import { User } from '../../types'
import AnnotationModel, { Annotation } from './annotations'
import { EntitiesRelation } from './projects'

export type Log = {
  _id: Types.ObjectId
  type:
    | 'comment-add'
    | 'comment-remove'
    | 'tags-add'
    | 'tags-remove'
    | 'project-add'
    | 'project-remove'
    | 'mission-add'
    | 'mission-remove'
    | 'annotation-add'
    | 'annotation-remove'
    | 'prediction-add'
    | 'relation-add'
    | 'relation-remove'
    | 'text-add'
    | 'text-update'
  comment: Types.ObjectId
  project: Types.ObjectId
  annotations: PopulatedDoc<Annotation & Document>[]
  relations?: EntitiesRelation[]
  item: Types.ObjectId
  user: User
  commentMessage: string
  tags: string[]
  createdAt: Date
}

export type LogDocument = Log & Document<unknown, unknown, Log>

const logSchema = new Schema<Log>({
  type: {
    type: String,
    enum: [
      'comment-add',
      'comment-remove',
      'tags-add',
      'tags-remove',
      'project-add',
      'project-remove',
      'mission-add',
      'mission-remove',
      'annotation-add',
      'annotation-remove',
      'prediction-add',
      'relation-add',
      'relation-remove',
      'text-add',
      'text-update',
    ],
  },
  comment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    index: true,
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    index: true,
  },
  annotations: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Annotation',
      index: true,
    },
  ],
  relations: [{}],
  item: {
    type: Schema.Types.ObjectId,
    ref: 'Item',
    index: true,
  },
  user: {
    _id: { type: String, index: true },
    firstName: String,
    lastName: String,
    email: String,
  },
  commentMessage: { type: String },
  tags: [String],
  createdAt: { type: Date, default: Date.now },
})

/**
 * Because find clauses may contain "include" clauses,
 * We cannot filter out the useless fields. Instead, we need to enumerate
 * all the fields that we want.
 * @returns {Object<string, 1>} Returns the object stripped from its unused props.
 */
const excludeUselessFields = () => {
  const excluded = ['user', '__v', 'createdAt']
  return Object.keys(AnnotationModel.schema.paths)
    .filter((path) => !path.includes('.') && !excluded.includes(path))
    .reduce((a, b) => ({ ...a, [b]: 1 }), {})
}

logSchema.pre('find', function find() {
  this.populate('annotations', {
    path: 'annotations',
    select: excludeUselessFields(),
  })
})

export default model<Log>('Log', logSchema)
