const LIMIT = 100

export default {
  demo: true, // Enable this to create demo projects at startup
  port: process.env.PORT || 5001,
  encryptSecretKey: process.env.ENCRYPTION_SECRET_KEY, // Encryption is used typically when providing AWS access key and secret key
  mongo: {
    url: process.env.MONGO_URL || 'mongodb://localhost:27017/ljn_annotto_dev',
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    },
  },
  cors: {
    exposedHeaders: ['Content-Length', 'X-Requested-With', 'X-Total-Count'],
    credentials: true,
    origin: process.env.ANNOTTO_FRONT_URL || 'http://localhost:3000',
  },
  keycloak: {
    realm: process.env.KEYCLOAK_REALM || 'annotto',
    'auth-server-url': process.env.KEYCLOAK_AUTH_URL || 'http://localhost:8080/auth',
    resource: process.env.KEYCLOAK_CLIENT_ID || 'annotto',
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || 'a7b7a29d-abb0-4e21-abec-bca99a47e40e',
    'confidential-port': 8443,
    'ssl-required': 'external',
  },
  swagger: {
    swaggerUi: '/explorer',
    apiDocs: '/api-docs',
  },
  baseUrl: process.env.ANNOTTO_FRONT_URL || '127.0.0.1:5001',
  fileUpload: {
    maxFileSize: process.env.ANNOTTO_UPLOAD_MAX_FILE_SIZE
      ? parseInt(process.env.ANNOTTO_UPLOAD_MAX_FILE_SIZE)
      : 1000 * 1024 * 1024,
    batchSize: process.env.ANNOTTO_UPLOAD_BATCH_SIZE ? parseInt(process.env.ANNOTTO_UPLOAD_BATCH_SIZE) : 50000,
  },
  search: {
    tasks: {
      orderBy: ['label'],
      fields: {
        classificationId: { key: '_id', type: 'number' },
        projectId: { key: 'project', type: 'number' },
      },
      limit: LIMIT,
      select: {
        annotationCount: true,
        annotationPourcent: true,
        category: true,
        value: true,
        type: true,
        label: true,
        min: true,
        max: true,
      },
    },
    user: {
      orderBy: ['lastName'],
      fields: {
        idUser: { key: '_id', type: 'number' },
        firstName: { key: 'firstName', type: 'text' },
        lastName: { key: 'lastName', type: 'text' },
        email: { key: 'email', type: 'text' },
      },
      limit: LIMIT,
    },
    client: {
      orderBy: ['name'],
      fields: {
        clientId: { key: '_id', type: 'number' },
        name: { key: 'name', type: 'text' },
        isActive: { key: 'isActive', type: 'boolean' },
        description: { key: 'description', type: 'text' },
      },
      limit: LIMIT,
    },
    project: {
      orderBy: ['name'],
      fields: {
        projectId: { key: '_id', type: 'number' },
        clientId: { key: 'client', type: 'string' },
        name: { key: 'name', type: 'text' },
        active: { key: 'active', type: 'boolean' },
        description: { key: 'description', type: 'text' },
      },
      limit: LIMIT,
      select: {
        client: true,
        admins: true,
        users: true,
        dataScientists: true,
        itemCount: true,
        commentCount: true,
        deadline: true,
        progress: true,
        velocity: true,
        remainingWork: true,
        lastAnnotationTime: true,
        name: true,
        updatedAt: true,
      },
    },
    batch: {
      orderBy: ['name'],
      fields: {
        name: { key: 'name', type: 'string' },
        description: { key: 'description', type: 'text' },
        projectId: { key: 'project', type: 'string' },
      },
      limit: LIMIT,
    },
    item: {
      orderBy: ['updatedAt'],
      fields: {
        projectId: { key: 'project', type: 'number' },
        status: { key: 'status', type: 'string' },
        itemId: { key: '_id', type: 'number' },
        type: { key: 'type', type: 'string' },
        body: { key: 'body', type: 'text' },
        tags: { key: 'tags', type: 'array' },
        annotated: { key: 'annotated', type: 'boolean' },
        uuid: { key: 'uuid', type: 'string' },
        compositeUuid: { key: 'compositeUuid', type: 'string' },
        updatedAt: { key: 'updatedAt', type: 'string' },
      },
      limit: LIMIT,
      select: {
        tags: true,
        commentCount: true,
        logCount: true,
        lastAnnotator: true,
        annotationValues: true,
        annotatedAt: true,
        velocity: true,
        body: true,
        annotated: true,
      },
    },
    comment: {
      orderBy: ['-createdAt'],
      fields: {
        comment: { key: 'comment', type: 'string' },
        itemId: { key: 'item', type: 'string' },
        projectId: { key: 'project', type: 'string' },
        batchId: { key: 'batch', type: 'string' },
        userId: { key: 'user', type: 'string' },
        createdAt: { key: 'createdAt', type: 'string' },
      },
      limit: LIMIT,
    },
    log: {
      orderBy: ['-createdAt'],
      fields: {
        comment: { key: 'comment', type: 'string' },
        itemId: { key: 'item', type: 'string' },
        type: { key: 'type', type: 'text' },
        projectId: { key: 'project', type: 'string' },
        batchId: { key: 'batch', type: 'string' },
        userId: { key: 'user', type: 'string' },
        commentType: { key: 'commentType', type: 'string' },
        projectType: { key: 'projectType', type: 'string' },
        missionType: { key: 'missionType', type: 'string' },
        createdAt: { key: 'createdAt', type: 'string' },
      },
      limit: LIMIT,
    },
  },
  filter: {
    items: {
      operators: [
        {
          name: 'equal',
          param: { value: 'Boolean' },
        },
        {
          name: 'range',
          param: { value: { from: 'Date', to: 'Date' } },
        },
        {
          name: 'containsAny',
          param: { value: ['String'] },
        },
        {
          name: 'containsAll',
          param: { value: ['String'] },
        },
        {
          name: 'size',
          param: { value: 'Number' },
        },
        {
          name: 'similarTo',
          param: { value: 'String' },
          optionalParam: {
            limit: 'Number',
            neg_values: ['String'],
          },
        },
        {
          name: 'greaterThanAny',
          param: {
            value: ['String'],
          },
          optionalParam: {
            threshold: 'Number',
          },
        },
        {
          name: 'greaterThanAll',
          param: {
            value: ['String'],
          },
          optionalParam: {
            threshold: 'Number',
          },
        },
        {
          name: 'wrongPredictions',
          param: {
            value: ['String'],
          },
          optionalParam: {
            threshold: 'Number',
          },
        },
        {
          name: 'textContains',
          param: {
            value: 'String',
          },
        },
      ],
      fields: {
        annotated: { key: 'annotated', operators: ['equal'] },
        annotatedAt: { key: 'annotatedAt', operators: ['range'] },
        annotatedBy: { key: 'annotatedBy', operators: ['containsAny', 'containsAll'] },
        annotationValues: { key: 'annotationValues', operators: ['containsAny', 'containsAll', 'size'] },
        uuid: { key: 'compositeUuid', operators: ['similarTo'] },
        tags: { key: 'tags', operators: ['containsAny', 'containsAll', 'size'] },
        predictionValues: { key: 'predictions.keys', operators: ['containsAny', 'containsAll', 'size'] },
        predictionScores: {
          key: 'predictions.predictions',
          operators: ['greaterThanAny', 'greaterThanAll', 'wrongPredictions'],
        },
        body: { key: 'body', operators: ['textContains'] },
      },
    },
  },
}
