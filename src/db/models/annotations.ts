import { Types, Schema, PopulatedDoc, Document, model } from 'mongoose'
import { Ner, User, Zone } from '../../types'
import { Task } from './tasks'

export type Annotation = {
  _id: Types.ObjectId
  user: User
  task: PopulatedDoc<Task & Document>
  item: Types.ObjectId
  project: Types.ObjectId
  text?: string
  zone?: Zone[]
  ner?: Ner
  status: 'draft' | 'cancelled' | 'refused' | 'done'
  updatedAt: Date
  createdAt: Date
}

export type AnnotationDocument = Annotation & Document<unknown, unknown, Annotation>

const annotationSchema = new Schema<Annotation>(
  {
    user: {
      _id: { type: String, index: true },
      firstName: String,
      lastName: String,
      email: String,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
    },
    item: {
      type: Schema.Types.ObjectId,
      ref: 'Item',
      index: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    text: { type: String, default: undefined },
    zone: { type: [{ x: Number, y: Number }], default: undefined },
    ner: { type: { start: Number, end: Number }, default: undefined },
    status: { type: String, enum: ['draft', 'cancelled', 'refused', 'done'], default: 'done' },
    updatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { toJSON: { virtuals: true } }
)

annotationSchema.pre('save', function save(next) {
  this.updatedAt = new Date()

  next()
})

annotationSchema
  .pre('find', function find() {
    this.populate('task')
  })
  .pre('findOne', function findOne() {
    this.populate('task')
  })

annotationSchema.virtual('value').get(function value(this: Annotation) {
  return this.task.value
})

export default model<Annotation>('Annotation', annotationSchema)
