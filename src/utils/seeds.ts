import fs from 'fs'
import path from 'path'
import { logger } from './logger'
import ProjectModel from '../db/models/projects'
import { user } from '../../tests/integration/seed/seed'
import { importAllFromFiles } from '../core/projects/import'

const toFile = (dirname: string, filename: string) => ({ path: path.join(dirname, filename) })

export const createDemo = async () => {
  const demoPath = path.join(__dirname, '../../statics/demo/')
  const demoFiles = fs.readdirSync(demoPath).map((name) => [name, fs.readdirSync(path.join(demoPath, name))])

  try {
    // Creating demos in series to check duplicate index errors mistake
    await demoFiles.reduce((promiseChain, [demoName, files]: (string | string[])[]) => {
      return promiseChain.then(async () => {
        if (!files.includes('config.json')) {
          logger.info(`Ignoring Demo (${demoName}) missing config.json`)
          return
        }
        if (!files.includes('items.jsonlines')) {
          logger.info(`Ignoring Demo (${demoName}) missing items.jsonlines`)
          return
        }
        const demo = path.join(demoPath, Array.isArray(demoName) ? demoName[0] : demoName)
        const config = await import(path.join(demo, 'config.json'))
        const existingProject = await ProjectModel.findOne({ name: config.name })
        if (existingProject) return

        await importAllFromFiles({
          projectFile: toFile(demo, 'config.json'),
          itemsFile: toFile(demo, 'items.jsonlines'),
          predictionsFile:
            (files.includes('predictions.jsonlines') && toFile(demo, 'predictions.jsonlines')) || undefined,
          annotationsFile:
            (files.includes('annotations.jsonlines') && toFile(demo, 'annotations.jsonlines')) || undefined,
          renameIfDuplicateName: false,
          _user: user,
        })

        logger.info(`Created seed (${demoName})`)
      })
    }, Promise.resolve())
  } catch (error) {
    logger.info(error)
  }
}
