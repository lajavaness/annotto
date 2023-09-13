export default {
  encryptSecretKey: 'toto',
  mongo: {
    url: process.env.MONGO_URL || 'mongodb://localhost:27017/annotto_test',
  },
  keycloak: {
    admin: {
      secret: 'n4i0V9jD9LVQAYxBeldCYFGucoTPUKaa',
    },
    groupId: '892e9f41-abae-4080-95b9-a29945c73352',
  },
}
