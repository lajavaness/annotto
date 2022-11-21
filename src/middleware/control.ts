import express from 'express'
import { name, version } from '../../package.json'

type HealthResponse = {
  status: 'green'
  version: string
  name: string
  environment: string
}

const health = (req: express.Request, res: express.Response<HealthResponse>) => {
  res.status(200).json({
    status: 'green',
    version,
    name,
    environment: process.env.NODE_ENV || 'development',
  })
}

export default {
  health,
}
