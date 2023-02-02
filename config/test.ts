export default {
  encryptSecretKey: 'toto',
  mongo: {
    url: process.env.MONGO_URL || 'mongodb://localhost:27017/annotto_test',
  },
  keycloak: {
    admin: {
      secret: '8acab8c7-31f5-494c-a5a1-0637bb62b096',
    },
  },
}
