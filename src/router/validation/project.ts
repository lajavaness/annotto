import Joi from 'joi'
import { checkObjectId } from './utils'

export const statsViewsQuerySchema = Joi.object({
  projectId: Joi.string().custom(checkObjectId).required(),
  view: Joi.string().valid('items', 'users', 'tasks'),
})

const taskSchema = Joi.object({
  _id: Joi.string(),
  shortDescription: Joi.any(),
  description: Joi.any(),
  value: Joi.string().required(),
  hotkey: Joi.any(),
  label: Joi.string().required(),
  exposed: Joi.boolean(),
  category: Joi.string().required(),
  color: Joi.any(),
  type: Joi.string().required(),
  conditions: Joi.array().items(Joi.string()),
  annotationPourcent: Joi.any(),
  annotationCount: Joi.any(),
  project: Joi.any(),
  updatedAt: Joi.any(),
  createdAt: Joi.any(),
  max: Joi.any(),
  min: Joi.any(),
  __v: Joi.any(),
})

const entitiesRelationsGroup = Joi.object({
  _id: Joi.string(),
  name: Joi.string().required(),
  max: Joi.number(),
  min: Joi.number(),
  values: Joi.array()
    .min(1)
    .required()
    .items(
      Joi.object({
        _id: Joi.string(),
        value: Joi.string().required(),
        label: Joi.string().required(),
        hotkey: Joi.string(),
        color: Joi.string(),
        description: Joi.string(),
        exposed: Joi.boolean(),
      })
    )
    .required(),
})

export const updateProjectSchema = Joi.object({
  client: Joi.string(),
  s3: Joi.object({
    accessKeyId: Joi.string().required(),
    secretAccessKey: Joi.string().required(),
    region: Joi.string(),
  }),
  type: Joi.string().valid('text', 'image', 'video', 'audio', 'html'),
  entitiesRelationsGroup: Joi.array().items(entitiesRelationsGroup),
  name: Joi.string(),
  description: Joi.string(),
  active: Joi.boolean(),
  guidelines: Joi.string(),
  defaultTags: Joi.array().items(Joi.string()),
  highlights: Joi.array().items(Joi.string()),
  similarityEndpoint: Joi.string(),
  showPredictions: Joi.boolean(),
  prefillPredictions: Joi.boolean(),
  deadline: Joi.date(),
  admins: Joi.array().items(Joi.string().email()),
  users: Joi.array().items(Joi.string().email()),
  dataScientists: Joi.array().items(Joi.string().email()),
  tasks: Joi.array().items(taskSchema),
})

const validateItemTypeWithClassificationType = (config: { type: string; tasks: { type: string }[] }) => {
  if (config.type === 'text' && config.tasks.some((task) => task.type === 'zone'))
    throw new Error('incompatible items type text with Zone')
  if (config.type === 'image' && config.tasks.some((task) => task.type === 'ner'))
    throw new Error('incompatible items type text with Zone')
}

/*
  Custom validation, to validate every children object with projectCategory schema
  and unique hotkey in whole config
*/
export const projectConfigV2Schema = Joi.object({
  name: Joi.string().required(),
  s3: Joi.object({
    accessKeyId: Joi.string(),
    secretAccessKey: Joi.string(),
    region: Joi.string(),
  }),
  client: Joi.string().required(),
  type: Joi.string().valid('text', 'image', 'video', 'audio', 'html').required(),
  guidelines: Joi.string(),
  highlights: Joi.array().items(Joi.string()),
  shortDescription: Joi.string().max(100),
  description: Joi.string(),
  tasks: Joi.array().items(taskSchema),
  entitiesRelationsGroup: Joi.array().items(entitiesRelationsGroup),
  admins: Joi.array().items(Joi.string().email()),
  users: Joi.array().items(Joi.string().email()),
  dataScientists: Joi.array().items(Joi.string().email()),
  defaultTags: Joi.array().items(Joi.string()),
  similarityEndpoint: Joi.string(),
  showPredictions: Joi.boolean(),
  prefillPredictions: Joi.boolean(),
  deadline: Joi.date().min('now'),
  filterPredictionsMinimum: Joi.number().min(0).max(1),
}).custom(
  (config: { type: string; tasks: { type: string; label: string; value: string; hotkey: string }[] }, helper) => {
    try {
      validateItemTypeWithClassificationType(config)
    } catch (error) {
      return helper.message({ message: error instanceof Error ? error.message : 'Invalid Error' })
    }

    // Two labels can't be identicals
    const identicalLabel = config.tasks.find((obj) =>
      config.tasks.find((obj2) => obj !== obj2 && obj.label && obj.label === obj2.label)
    )
    if (identicalLabel) throw new Error(`label=${identicalLabel.label}  is already used`)

    // Two values can't be identicals
    const identicalValue = config.tasks.find((obj) =>
      config.tasks.find((obj2) => obj !== obj2 && obj.value && obj.value === obj2.value)
    )
    if (identicalValue) throw new Error(`value=${identicalValue.value} is already used`)

    // Two hotkeys can't be identicals
    const hotkeyUsed = config.tasks.find((obj) =>
      config.tasks.find((obj2) => obj !== obj2 && obj.hotkey && obj.hotkey === obj2.hotkey)
    )
    if (hotkeyUsed) throw new Error(`hotkey=${hotkeyUsed.hotkey} is already used`)

    return config
  }
)
