import request from 'request-promise'
import config from '../../config'

const getOauthToken = async (user: { username: string; password: string }): Promise<string> => {
  const options = {
    method: 'POST',
    url: `${config.keycloak['auth-server-url']}/realms/${config.keycloak.realm}/protocol/openid-connect/token`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    json: true,
    form: {
      grant_type: 'password',
      username: user.username,
      password: user.password,
      client_id: config.keycloak.resource,
      client_secret: config.keycloak.clientSecret,
    },
  }
  const result = await request(options)
  return result.access_token
}

export default getOauthToken
