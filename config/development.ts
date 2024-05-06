export default {
  development: true,
  encryptSecretKey: process.env.ENCRYPTION_SECRET_KEY || 'aSecretKey',
  cors: {
    origin: process.env.ANNOTTO_FRONT_URL || 'http://localhost:3000',
  },
  keycloak: {
    admin: {
      secret: process.env.KEYCLOAK_ADMIN_CLI_SECRET || 'n4i0V9jD9LVQAYxBeldCYFGucoTPUKaa',
    },
    groupId: process.env.KEYCLOAK_GROUP_ID || '892e9f41-abae-4080-95b9-a29945c73352',
  },
}
