export {}

declare global {
  namespace KeycloakConnect {
    export interface Token {
      token: string
      content: {
        sub: string
        email: string
        given_name: string
        family_name: string
        resource_access: {
          [group: string]: { roles: string[] }
        }
      }
    }
  }
}
