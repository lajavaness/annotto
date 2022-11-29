import { getUserInfoService, logoutService, refreshTokenService } from 'modules/root/services/authServices'

describe('authServices', () => {
  const email = 'foo@lajavaness.com'
  const firstName = 'John'
  const lastName = 'Doe'
  const roles = ['admin']
  const user = {
    email,
    given_name: firstName,
    family_name: lastName,
  }

  const keycloakInstance = {
    loadUserInfo: () => user,
    resourceAccess: {
      [process.env.REACT_APP_KEYCLOAK_CLIENT_ID]: {
        roles,
      },
    },
    updateToken: async () => true,
    logout: async () => true,
  }

  const error = new Error('No Keycloak instance has been provided')

  it('gets user infos', async () => {
    await expect(getUserInfoService(keycloakInstance)).resolves.toStrictEqual({
      email,
      firstName,
      lastName,
      profile: {
        email,
        roles,
      },
    })
  })

  describe('refreshTokenService', () => {
    it('refreshes access token', async () => {
      await expect(refreshTokenService(keycloakInstance)).resolves.toBe()
    })

    it('rejects if no keycloak instance is provided', async () => {
      await expect(refreshTokenService()).rejects.toEqual(error)
    })
  })
  describe('logoutService', () => {
    it('logs out', async () => {
      await expect(logoutService(keycloakInstance)).resolves.toBe()
    })

    it('rejects if no keycloak instance is provided', async () => {
      await expect(logoutService()).rejects.toEqual(error)
    })
  })
})
