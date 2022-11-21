import express from 'express'
import cors from 'cors'
import expressSwaggerGenerator from 'express-swagger-generator'
import { loggerMiddleware } from './utils/logger'
import { errorHandlerMiddleware, generateError } from './utils/error'
import getRouter from './router'

import { Config } from '../config'

/**
 * Generate swagger option from config.
 * @param {object} cfg Config.
 * @returns {object} Swagger config.
 */
const getSwaggerOptions = (cfg: Config) => ({
  swaggerDefinition: {
    info: {
      description: 'Annotto API',
      title: '',
      version: '1.0.0',
    },
    // removing http:// from base url
    host: cfg.baseUrl.replace(/(^\w+:|^)\/\//, ''),
    basePath: '/api',
    produces: ['application/json'],
    securityDefinitions: {
      Bearer: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        value: 'Bearer <access_token>',
      },
    },
    schemes: ['https', 'http'],
  },
  basedir: __dirname, // app absolute path
  // Path to the API handle folder
  files: ['./router/*.js', './router/*.ts'],
})

const routeNotFoundHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  next(generateError({ code: 404, message: 'ERROR_ROUTE_NOT_FOUND' }))
}

const createServer = async (cfg: Config) => {
  const app = express()
    .enable('trust proxy')
    .use(loggerMiddleware)
    .use(cors(cfg.cors))
    .use(express.json())
    .use(express.urlencoded({ extended: true }))

  app.set('config', cfg)

  const swaggerOptions = getSwaggerOptions(cfg)

  app.use('/api', getRouter())

  app.use(cfg.swagger.swaggerUi, (req, res, next) => next())
  app.use(cfg.swagger.apiDocs, (req, res, next) => next())
  app.use(`${cfg.swagger.apiDocs}.json`, (req, res, next) => next())

  expressSwaggerGenerator(app)(swaggerOptions)

  app.use(routeNotFoundHandler)
  app.use(errorHandlerMiddleware)

  return app
}

export default createServer
