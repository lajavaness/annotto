import mongoose from 'mongoose'
import createServer from '../server'
import { Config } from '../../config'

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

let initialized = false

/**
 * In Gitlab CI, the database needs to be setup before we start tests
 * Because it needs a little time to initialize, we wait for 1 second
 * after the server files have been configured, and so the mongo collections.
 * @param {...any} args List of args.
 * @returns {*} The app.
 */
const wrapper = async (...args: [Config]) => {
  mongoose.set('autoCreate', true) // forces the initialization of the collections
  const app = await createServer(...args)
  if (process.env.CI && !initialized) {
    await wait(3000)
    initialized = true
  }
  return app
}

export default wrapper
