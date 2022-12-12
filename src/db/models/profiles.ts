import { Types, Schema, Document, model } from 'mongoose'

export type ProfileRole = 'admin' | 'user' | 'dataScientist'
export type Profile = {
  _id: Types.ObjectId
  role: ProfileRole
  user: string
  email: string
  createdAt: Date
  updatedAt: Date
}

export type ProfileDocument = Profile & Document<unknown, unknown, Profile>

const profileSchema = new Schema<Profile>({
  role: {
    type: String,
    enum: ['admin', 'user', 'dataScientist'],
    default: 'user',
  },
  user: { type: String, index: true, required: true },
  email: { type: String, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

profileSchema.pre('save', function save(next) {
  this.updatedAt = new Date()
  next()
})

export default model<Profile>('Profile', profileSchema)
