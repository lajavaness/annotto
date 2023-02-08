import { Types, Schema, PopulatedDoc, Document, AnyObject, model } from 'mongoose'
import dayjs from 'dayjs'
import {S3, User} from '../../types'
import { Client } from './clients'
import { Task } from './tasks'

export type EntitiesRelation = {
  value: string
  label: string
  hotkey?: string
  color?: string
  description?: string
  exposed?: boolean
}

export type EntitiesRelationsGroup = {
  _id?: Types.ObjectId | string
  name: string
  min?: number
  max?: number
  values: EntitiesRelation[]
}[]

export type Project = {
  _id: Types.ObjectId
  name: string
  active: boolean
  description: string
  client: PopulatedDoc<Client & Document>
  defaultTags: string[]
  itemTags: string[]
  type: string
  s3?: S3
  admins: string[]
  users: string[]
  dataScientists: string[]
  tasks: PopulatedDoc<Task & Document>[]
  filterPredictionsMinimum: number
  highlights: string[]
  entitiesRelationsGroup: EntitiesRelationsGroup
  guidelines?: string
  itemCount: number
  commentCount: number
  updatedAt: Date
  createdAt: Date
  deadline?: Date
  progress?: number
  velocity?: number
  remainingWork?: number
  lastAnnotationTime?: Date
  similarityEndpoint: string
  showPredictions: boolean
  prefillPredictions: boolean
  annotators: AnyObject[]
  isNew?: boolean
  _wasNew: boolean
  _user: User
}

export type ProjectDocument = Project & Document<unknown, unknown, Project>

const projectSchema = new Schema<Project>(
  {
    client: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
    },
    defaultTags: { type: [String], default: [] },
    itemTags: { type: [String], default: [], select: false },
    type: String,
    description: { type: String, default: null },
    s3: { type: {}, select: false },
    name: { type: String, unique: true },
    active: { type: Boolean, default: true },
    admins: { type: [String], default: [] },
    users: { type: [String], default: [] },
    dataScientists: { type: [String], default: [] },
    tasks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
    filterPredictionsMinimum: { type: Number, default: 0.4 },
    highlights: [String],
    entitiesRelationsGroup: [
      {
        name: String,
        min: Number,
        max: Number,
        values: [
          {
            value: String,
            label: String,
            hotkey: String,
            color: String,
            description: String,
            exposed: { type: Boolean, default: true },
          },
        ],
      },
    ],
    guidelines: String,
    itemCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    deadline: { type: Date, default: null },
    progress: { type: Number, default: null },
    velocity: { type: Number, default: null },
    remainingWork: { type: Number, default: null },
    lastAnnotationTime: { type: Date, default: null },
    similarityEndpoint: String,
    showPredictions: { type: Boolean, default: true },
    prefillPredictions: { type: Boolean, default: true },
    annotators: [],
  },
  { toJSON: { virtuals: true } }
)

projectSchema.pre(/save/, function save(this: Project, next: () => void, params: { _user: User }) {
  this.updatedAt = new Date()
  this._wasNew = !!this.isNew
  this._user = params._user

  next()
})

projectSchema.virtual('status').get(function status(this: Project) {
  if (dayjs().isAfter(dayjs(this.deadline))) {
    return 'out of time'
  }
  return 'Ongoing'
})

export default model<Project>('Project', projectSchema)
