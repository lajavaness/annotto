export default {
  development: true,
  encryptSecretKey: process.env.ENCRYPTION_SECRET_KEY || 'aSecretKey',
  cors: {
    origin: 'http://localhost:3000',
  },
  keycloak: {
    admin: {
      secret: '8acab8c7-31f5-494c-a5a1-0637bb62b096',
    },
  },
}
