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
    'auth-server-url': process.env.KEYCLOAK_AUTH_URL || 'http://localhost:8080',
    resource: process.env.KEYCLOAK_CLIENT_ID || 'annotto',
    'confidential-port': 8443,
    'ssl-required': 'external',
    admin: {
      resource: 'admin-cli',
      secret: process.env.KEYCLOAK_ADMIN_CLI_SECRET,
    },
    groupId: process.env.KEYCLOAK_GROUP_ID,
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
