import { AccessToken, User } from '../../types'
import { Profile } from '../../db/models/profiles'
import { ProjectDocument } from '../../db/models/projects'

export {}

declare global {
  namespace Express {
    export interface Request {
      _project: ProjectDocument
      _user: User & { profile?: Profile }
      token: AccessToken
    }
  }
}
