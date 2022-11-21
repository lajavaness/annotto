import morgan from 'morgan'
import { createLogger, transports, format } from 'winston'

const myFormat = format.printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level} ${message}`
})

export const logger = createLogger({
  transports: new transports.Console(),
  level: process.env.LOG_LEVEL,
  format: format.combine(format.timestamp(), myFormat),
})

export const loggerMiddleware = morgan(':method :url :status :res[content-length] - :response-time ms', {
  stream: {
    // Configure Morgan to use our custom logger with the http severity
    write: (message) => logger.debug(message.trim()),
  },
})
