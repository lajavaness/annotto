export default {
  development: true,
  encryptSecretKey: process.env.ENCRYPTION_SECRET_KEY || 'aSecretKey',
  cors: {
    origin: 'http://localhost:3000',
  },
}
