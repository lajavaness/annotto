import mongoose from 'mongoose'
import { logger } from './utils/logger'
import config from '../config'
import createServer from './server'
import { createDemo } from './utils/seeds'
import packageJson from '../package.json'

logger.info(`${packageJson.name} package VERSION: v${packageJson.version} / Node version: ${process.version}`)
mongoose
  .connect(config.mongo.url, config.mongo.options)
  .then(() => logger.info('Mongo connection UP'))
  .then(() => createServer(config))
  .then((app) =>
    app.listen(config.port, () =>
      logger.info(`NODE_ENV=${process.env.NODE_ENV || 'development'} : Server listening on port ${config.port}`)
    )
  )
  .then(async () => {
    if (config.demo) {
      logger.info('-------------------------')
      logger.info('Creating demo ...')
      await createDemo()
      mongoose.set(
        'debug',
        ['test', 'development'].includes(process.env.NODE_ENV || 'development') ? true : { color: false }
      )
      logger.info('-------------------------')
      logger.info('Demo created successfully')
    }
  })
  .catch(logger.error)
