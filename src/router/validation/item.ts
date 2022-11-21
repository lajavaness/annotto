import Joi from 'joi'
import { ExternalEntity } from '../../types'
import { checkObjectId, checkAnnotationsLengthWithRelations } from './utils'
import { Task } from '../../db/models/tasks'

export const updateItemSchema = Joi.object({
  tags: Joi.array().items(Joi.string()),
})

export const annotationPayloadSchema = Joi.object({
  annotations: Joi.array().items({
    value: Joi.string().required(),
    zone: Joi.array()
      .min(3)
      .items(
        Joi.object({
          x: Joi.number(),
          y: Joi.number(),
        })
      ),
    ner: Joi.object({
      start: Joi.number(),
      end: Joi.number(),
    }),
    text: Joi.string(),
  }),
  entitiesRelations: Joi.array().items(
    Joi.object({
      src: Joi.object({
        value: Joi.string().required(),
        ner: Joi.object({
          start: Joi.number().required(),
          end: Joi.number().required(),
        }).required(),
      }).required(),
      dest: Joi.object({
        value: Joi.string().required(),
        ner: Joi.object({
          start: Joi.number().required(),
          end: Joi.number().required(),
        }).required(),
      }).required(),
      value: Joi.string(),
    })
  ),
}).custom(checkAnnotationsLengthWithRelations)

const annotationParamSchema = Joi.object({
  projectId: Joi.string().custom(checkObjectId).required(),
  itemId: Joi.string().custom(checkObjectId).required(),
})

const itemTemplate = {
  annotated: Joi.bool(),
  annotatedBy: Joi.any(),
  description: Joi.any(),
  annotatedAt: Joi.date().allow(null),
  createdAt: Joi.date().allow(null),
  seenAt: Joi.date().allow(null),
  tags: Joi.array().items(Joi.string()),
  velocity: Joi.any(),
  lastAnnotator: Joi.any(),
  uuid: Joi.string().required(),
  metadata: Joi.object().allow(null),
  sourceHighlights: Joi.array(),
  entitiesRelations: Joi.any(), // backwards compatibility
  predictions: Joi.any(), // backwards compatibility
  highlights: Joi.array(),
}

const jsonlinesItemImageSchema = Joi.object({
  ...itemTemplate,
  data: Joi.object({
    url: Joi.string().required(),
  }).required(),
  datatype: Joi.string().valid('image'), // be compatbile with data scientists expectations
  type: Joi.string().valid('image'), // but be compatible with annotto's own export format
}).xor('datatype', 'type')

const jsonlinesItemTextSchema = Joi.object({
  ...itemTemplate,
  data: Joi.object({
    text: Joi.string().required(),
  }).required(),
  datatype: Joi.string().valid('text'),
  type: Joi.string().valid('text'),
}).xor('datatype', 'type')

const zonePredictionSchema = Joi.object({
  entities: Joi.array()
    .items(
      Joi.object({
        coords: Joi.array()
          .items(
            Joi.object({
              x: Joi.number().min(0).max(1).required(),
              y: Joi.number().min(0).max(1).required(),
            })
          )
          .min(3)
          .required(),
        value: Joi.string().required(),
      })
    )
    .min(1)
    .required(),
})

const classifPredictionSchema = Joi.object({
  labels: Joi.array()
    .items(
      Joi.object({
        value: Joi.string().required(),
        proba: Joi.number().required(),
      })
    )
    .min(1)
    .required(),
})

const nerPredictionSchema = Joi.object({
  entities: Joi.array()
    .items(
      Joi.object({
        value: Joi.string().required(),
        start: Joi.number().required(),
        end: Joi.number().required(),
      })
    )
    .min(1)
    .required(),
})

const textPredictionSchema = Joi.object({
  entities: Joi.array()
    .items(
      Joi.object({
        value: Joi.string().required(),
        text: Joi.string().required(),
      })
    )
    .min(1)
    .required(),
})

const validatePredictionsObject = (
  obj: {
    [category: string]: { labels: ExternalEntity[]; entities: ExternalEntity[] }
  },
  { prefs: { context } }: { prefs: { context?: Joi.Context & { tasks?: Task[] } } }
) => {
  const tasks = (context && context.tasks) || []

  for (const [key, value] of Object.entries(obj)) {
    const task = tasks.find((c) => c.category.toLowerCase() === key.toLowerCase())

    if (!task) {
      throw new Error(`prediction task (${key}) is not in project tasks`)
    }

    const { type } = task
    const tasksByType = tasks.filter((oneTask) => oneTask.type === type)

    switch (type) {
      case 'text': {
        const validate = textPredictionSchema.validate(value)
        if (validate.error) throw new Error(validate.error.toString())
        for (const entity of value.entities) {
          if (!tasksByType.find((c) => c.value === entity.value)) {
            throw new Error(`prediction task (${entity.value}) is not in project Text type tasks`)
          }
        }
        break
      }
      case 'ner': {
        const validate = nerPredictionSchema.validate(value)
        if (validate.error) throw new Error(validate.error.toString())
        for (const entity of value.entities) {
          if (!tasksByType.find((c) => c.value === entity.value)) {
            throw new Error(`prediction task (${entity.value}) is not in project NER type tasks`)
          }
        }
        break
      }
      case 'classifications': {
        const validate = classifPredictionSchema.validate(value)
        if (validate.error) throw new Error(validate.error.toString())
        for (const entity of value.labels) {
          if (!tasksByType.find((c) => c.value === entity.value)) {
            throw new Error(`prediction task (${entity.value}) is not in project Classifications type tasks`)
          }
        }
        break
      }
      case 'zone': {
        const validate = zonePredictionSchema.validate(value)
        if (validate.error) throw new Error(validate.error.toString())
        for (const entity of value.entities) {
          if (!tasksByType.find((c) => c.value === entity.value)) {
            throw new Error(`prediction task (${entity.value}) is not in project ZONE type tasks`)
          }
        }
        break
      }
      default:
        throw new Error(`Type is unknown ${type}`)
    }
  }
}

// Validate Ner predictions.data object that can contain Ner and/or Classification property
const jsonlinesPredictionsSchema = Joi.object({
  uuid: Joi.string().required(),
  annotations: Joi.object().required().external(validatePredictionsObject),
})

const jsonlinesAnnotationImportSchema = Joi.object({
  item: Joi.object(),
  markers: Joi.array().items(Joi.string()),
  tags: Joi.array().items(Joi.string()),
  comments: Joi.array().items(),
  itemMetadata: Joi.object({
    createdAt: Joi.date(),
    updated: Joi.date(),
    seenAt: Joi.date(),
  }),
  annotationMetadata: Joi.object({
    annotatedBy: Joi.string(),
    annotatedAt: Joi.date(),
    createdAt: Joi.date(),
  }),
  annotation: Joi.object({
    classifications: Joi.object(),
    text: Joi.object().pattern(
      /.*/,
      Joi.object({
        entities: Joi.array().required().items({
          value: Joi.string().required(),
          text: Joi.string().required(),
        }),
      })
    ),
    ner: Joi.object()
      .pattern(
        /^relations$/,
        Joi.array().items({
          label: Joi.string().required(),
          src: Joi.number().required(),
          dest: Joi.number().required(),
        })
      )
      .pattern(
        /.*/,
        Joi.object({
          entities: Joi.array().required().items({
            value: Joi.string().required(),
            start_char: Joi.number().required(),
            end_char: Joi.number().required(),
            ent_id: Joi.number().required(),
          }),
        })
      ),
    zone: Joi.object().pattern(
      /.*/,
      Joi.object({
        entities: Joi.array()
          .required()
          .items({
            value: Joi.string().required(),
            coords: Joi.array()
              .required()
              .items(
                Joi.object({
                  _id: Joi.any(),
                  x: Joi.number(),
                  y: Joi.number(),
                })
              ),
          }),
      })
    ),
  }),
  historicAnnotations: Joi.array().items(Joi.object()),
  metadata: Joi.object().allow(null),
  annotationTimes: Joi.array().items(Joi.number()),
})

export default {
  updateItemSchema,
  annotationPayloadSchema,
  annotationParamSchema,
  jsonlinesItemTextSchema,
  jsonlinesItemImageSchema,
  zonePredictionSchema,
  nerPredictionSchema,
  jsonlinesPredictionsSchema,
  classifPredictionSchema,
  textPredictionSchema,
  jsonlinesAnnotationImportSchema,
}
