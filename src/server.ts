import express from 'express'
import cors from 'cors'
import expressSwaggerGenerator from 'express-swagger-generator'
import { rateLimit } from 'express-rate-limit'
import { loggerMiddleware } from './utils/logger'
import { errorHandlerMiddleware, generateError } from './utils/error'
import getRouter from './router'
import packageJson from '../package.json'
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
      version: packageJson.version,
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
  // Add rate limiter to prevent DoS attack:
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // store: ... , // Use an external store for more precise rate limiting
  })
  app.use(limiter)

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
