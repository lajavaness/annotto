import mongoose from 'mongoose'
import config from '../../../config'

const mongoSetupTeardown = async () => {
  beforeAll(async () => {
    await mongoose.connect(config.mongo.url, config.mongo.options)
  })
  afterAll(async () => {
    await mongoose.disconnect()
  })

  beforeEach(async () => {
    const collections = await mongoose.connection.db.collections()

    for (const collection of collections) {
      await collection.deleteMany({})
    }
  })
}

export default mongoSetupTeardown
