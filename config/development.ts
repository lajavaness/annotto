export default {
  development: true,
  encryptSecretKey: process.env.ENCRYPTION_SECRET_KEY || 'aSecretKey',
  cors: {
    origin: 'http://localhost:3000',
  },
  keycloak: {
    admin: {
      secret: 'n4i0V9jD9LVQAYxBeldCYFGucoTPUKaa',
    },
    groupId: '892e9f41-abae-4080-95b9-a29945c73352',
  },
}
