import Keycloak from 'keycloak-js'
import { isEmpty } from 'lodash'

const keycloakConfig = {
  clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'annotto',
  realm: process.env.REACT_APP_KEYCLOAK_REALM || 'annotto',
  url: `${!isEmpty(process.env.REACT_APP_KEYCLOAK_URL) ? process.env.REACT_APP_KEYCLOAK_URL : window.location.origin}${
    process.env.REACT_APP_KEYCLOAK_ROUTE
  }`,
  'ssl-required': 'external',
  'public-client': true,
  'confidential-port': 0,
}

export const initService = async () => {
  // eslint-disable-next-line no-useless-catch
  try {
    const keycloak = new Keycloak(keycloakConfig)
    await keycloak.init({ onLoad: 'login-required' })
    return keycloak
  } catch (err) {
    throw err
  }
}

export const getUserInfoService = async (keycloak) => {
  // eslint-disable-next-line no-useless-catch
  try {
    if (keycloak) {
      const userInfo = await keycloak.loadUserInfo()
      const user = {
        email: userInfo.email,
        firstName: userInfo.given_name,
        lastName: userInfo.family_name,
        profile: {
          email: userInfo.email,
          roles: keycloak.resourceAccess?.[process.env.REACT_APP_KEYCLOAK_CLIENT_ID]?.roles || [],
        },
      }

      return user
    }
    throw new Error('No Keycloak instance has been provided')
  } catch (err) {
    throw err
  }
}

export const refreshTokenService = async (keycloak) => {
  // eslint-disable-next-line no-useless-catch
  try {
    if (keycloak) {
      await keycloak.updateToken(parseInt(process.env.REACT_APP_KEYCLOAK_REFRESH_TOKEN_DURATION))
      return
    }
    throw new Error('No Keycloak instance has been provided')
  } catch (err) {
    throw err
  }
}

export const logoutService = async (keycloak) => {
  // eslint-disable-next-line no-useless-catch
  try {
    if (keycloak) {
      await keycloak.logout()
      return
    }
    throw new Error('No Keycloak instance has been provided')
  } catch (err) {
    throw err
  }
}
