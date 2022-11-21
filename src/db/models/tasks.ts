import { Types, Schema, model } from 'mongoose'

export type Task = {
  _id: Types.ObjectId
  hotkey: string
  shortDescription?: string
  description?: string
  conditions: string[]
  category: string
  exposed: boolean
  type: 'classifications' | 'ner' | 'zone' | 'text'
  project: Types.ObjectId
  color: string
  label: string
  value: string
  annotationPourcent: number
  annotationCount: number
  updatedAt: Date
  createdAt: Date
  min?: number
  max?: number
}

const taskSchema = new Schema<Task>({
  hotkey: { type: String, maxLength: 1 },
  shortDescription: String,
  description: String,
  conditions: [
    {
      type: String,
    },
  ],
  category: { type: String, required: true },
  exposed: { type: Boolean, default: true },
  type: {
    type: String,
    required: true,
    enum: ['classifications', 'ner', 'zone', 'text'],
    default: 'classifications',
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    index: true,
  },
  color: String,
  label: { type: String, required: true },
  value: { type: String, required: true },
  annotationPourcent: { type: Number, default: 0 },
  annotationCount: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  min: { type: Number },
  max: { type: Number },
})

export default model<Task>('Task', taskSchema)
