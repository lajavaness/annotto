import { Types, Schema, Document, model } from 'mongoose'
import { InternalRelation, ItemPayload, PredictionPayload, User, Zone } from '../../types'

export type Item = {
  _id: Types.ObjectId
  project: Types.ObjectId
  uuid: string
  compositeUuid: string
  data: {
    url?: string
    text?: string
    body?: string
  }
  body: string
  description?: string
  type: 'text' | 'image' | 'video' | 'audio' | 'html'
  status: 'todo' | 'done'
  annotated: boolean
  annotatedBy: string[]
  annotationValues: string[]
  entitiesRelations: InternalRelation[]
  predictions?: {
    raw?: PredictionPayload
    key?: (
      | {
          value: string
          proba: number
        }
      | {
          value: string
          start: number
          end: number
        }
      | {
          value: string
          zone: Zone[]
        }
    )[]
  }
  raw?: ItemPayload
  highlights: unknown[]
  tags: string[]
  annotatedAt: Date
  seenAt?: Date | null
  updatedAt: Date
  createdAt: Date
  velocity?: number
  annotationTimes: number[]
  lastAnnotator?: User
  commentCount: number
  logCount: number
  metadata?: unknown
  sourceHighlights: string[]
  _original: Item
  _user: User
  __v: number
}

export type ItemDocument = Item & Document<unknown, unknown, Item>
export type ItemS3Document = ItemDocument & { data: { url: string } }

const itemSchema = new Schema<Item>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      index: true,
    },
    uuid: { type: String, sparse: true },
    compositeUuid: { type: String, unique: true, sparse: true },
    data: { type: Object },
    body: String,
    description: String,
    type: { type: String, enum: ['text', 'image', 'video', 'audio', 'html'], default: 'text' },
    status: { type: String, enum: ['todo', 'done'], default: 'todo' },
    annotated: { type: Boolean, default: false, index: true },
    annotatedBy: { type: [String], default: [], index: true },
    annotationValues: { type: [String], default: [], index: true },
    entitiesRelations: { type: [{}] },
    predictions: {},
    raw: {},
    highlights: { type: [{}] },
    tags: { default: [], type: [String], index: true },
    annotatedAt: { type: Date, default: null },
    seenAt: { type: Date, index: true },
    updatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    velocity: { type: Number, default: null },
    annotationTimes: { type: [Number], default: [] },
    lastAnnotator: { type: {}, default: null },
    commentCount: { type: Number, default: 0 },
    logCount: { type: Number, default: 0 },
    metadata: { type: Object, default: {} },
    sourceHighlights: [String],
  },
  {
    skipVersioning: {
      logCount: true, // avoid having versionning issues in log count (this field is not important enough)
    },
  }
)

itemSchema.virtual('firstAnnotationVirtual')
itemSchema.virtual('annotationsVirtual')

itemSchema.post('init', function init(doc) {
  this._original = doc.toObject({ transform: false })
})

itemSchema.pre(/save/, function save(this: ItemDocument, next: () => void, params: { _user: User }) {
  this.updatedAt = new Date()
  this._user = params._user
  next()
})

export default model<Item>('Item', itemSchema)
