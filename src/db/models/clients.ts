import { Types, Schema, Document, model } from 'mongoose'

export type Client = {
  _id: Types.ObjectId
  name: string
  description?: string
  isActive: string
  updatedAt: Date
  createdAt: Date
}

export type ClientDocument = Client & Document<unknown, unknown, Client>

const clientSchema = new Schema<Client>({
  name: { type: String, unique: true },
  description: String,
  isActive: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
})

export default model<Client>('Client', clientSchema)
