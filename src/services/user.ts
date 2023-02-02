import fetch from 'node-fetch'
import { stringify } from 'querystring'
import { User } from '../types'
import config from '../../config'

type KCCredentials = {
  type: string
  value: string
  boolean: boolean
  temporary?: boolean
}

export type KCUserRepresentation = {
  username: string
  firstName: string
  lastName: string
  email: string
  credentials: KCCredentials
}

type Options = {
  path: string
  method: string
  token: string
  body?: KCUserRepresentation
}

const HEADERS = { 'content-type': 'application/json' }

/**
 * @typedef KCCredentials
 * @property {string} type (default: "password").
 * @property {string} value (i.e "123").
 * @property {boolean} temporary (default: false).
 */

/**
 * @typedef KCUserRepresentation
 * @property {string} username
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {KCCredentials} credentials
 */

/**
 * @typedef Options
 * @property {string} path REST API Path.
 * @property {string} method REST HTTP Method.
 * @property {string} token Access token.
 * @property {KCUserRepresentation} [body] Data.
 */

/**
 * Use this method to make a REST call to keycloak.
 * @param {Options} options .
 * @returns {Promise<*>}.
 */
async function _callApi(options: Options) {
  const response = await fetch(
    `${config.keycloak['auth-server-url']}/admin/realms/${config.keycloak.realm}${options.path}`,
    {
      method: options.method,
      headers: { Authorization: `Bearer ${options.token}`, ...HEADERS },
      ...(options.body && { body: JSON.stringify(options.body) }),
    }
  )
  const json = await response.json()
  return json
}

/**
 * Fetch an admin cli token to be able to use methods reserved for admin on Keycloak.
 * @return {string} Admin Cli access token.
 */
const getAdminToken = async () => {
  const data = stringify({
    grant_type: 'client_credentials',
    client_id: 'admin-cli',
    client_secret: config.keycloak.admin.secret,
  })

  const resp = await fetch(`${config.keycloak['auth-server-url']}/realms/master/protocol/openid-connect/token`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: data,
  })
  const json = await resp.json()
  return json.access_token
}

/**
 * Find all users. This will call keycloak Admin Rest API and fetch all users.
 * @returns {Promise<Array<KCUserRepresentation>>}.
 */
const find = async (): Promise<User[]> => {
  const token = await getAdminToken()
  return _callApi({ path: '/users', method: 'GET', token })
}

/**
 * Fetch user by id.
 * @param {string} id User uuid as it appears in keycloak.
 * @returns {Promise<KCUserRepresentation>}.
 */
const findById = async (id: string) => {
  const token = await getAdminToken()
  return _callApi({ path: `/users/${id}`, method: 'GET', token })
}

/**
 * Create a new user.
 * @param {KCUserRepresentation} body .
 * @returns {Promise<KCUserRepresentation>}.
 */
const create = async (body: KCUserRepresentation) => {
  // Add default value necessary for KC Admin API. If they are taken care of in the front, remove this
  if (body.credentials) {
    body.credentials.type = 'password'
    body.credentials.temporary = false
  }

  const token = await getAdminToken()
  return _callApi({ path: '/users', method: 'POST', token, body })
}

/**
 * Create a new user.
 * @param {string} id User uuid as it appears in keycloak.
 * @param {KCUserRepresentation} body .
 * @returns {Promise<KCUserRepresentation>} .
 */
const update = async (id: string, body: KCUserRepresentation) => {
  const token = await getAdminToken()
  return _callApi({ path: `/users/${id}`, method: 'PUT', token, body })
}

/**
 * Delete a user.
 * @param {string} id User uuid as it appears in keycloak.
 * @returns {Promise<*>} .
 */
const destroy = async (id: string) => {
  const token = await getAdminToken()
  return _callApi({ path: `/users/${id}`, method: 'DELETE', token })
}

export default {
  find,
  findById,
  create,
  update,
  destroy,
}
