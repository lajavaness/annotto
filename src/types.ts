import { Token } from 'keycloak-connect'

export type User = {
  _id?: string
  firstName: string
  lastName: string
  email: string
}

export type AccessToken = Token & KeycloakConnect.Token

export type Ner = {
  start: number
  end: number
  ent_id?: number
}

export type Zone = {
  x: number
  y: number
}

export type ExternalEntity = {
  value: string
  text?: string
  coords?: { x: number; y: number }[]
  start_char?: number
  end_char?: number
  ent_id?: number
}

export type InternalEntity = {
  value: string
  text?: string
  zone?: Zone[]
  ner?: Ner
}

export type ExternalRelation = {
  value?: string
  label?: string
  src?: number
  dest?: number
}

export type InternalRelation = {
  value: string
  src: InternalEntity
  dest: InternalEntity
}

export type FilterPayload = {
  operator?: string
  field?: string
  value?: string | number | boolean | { from: number | string; to: number | string } | string[]
  threshold?: number
  limit?: number
  neg_values?: string[]
  or?: FilterPayload[]
}

export type ItemPayload = {
  uuid?: string
  compositeUuid?: string
  data?: {
    text?: string
    body?: string
  }
  type?: string
  datatype?: string
  tags?: string[]
  markers?: string[]
  metadata?: unknown
  description?: string
  entitiesRelations?: InternalRelation[]
}

export type PredictionPayload = {
  [category: string]:
    | {
        labels: {
          value: string
          proba: number
        }[]
      }
    | {
        entities: {
          value: string
          start: number
          end: number
        }[]
      }
    | {
        entities: {
          value: string
          coords: Zone[]
        }[]
      }
}

export type TaskPayload = {
  _id?: string
  hotkey?: string
  shortDescription?: string
  description?: string
  conditions?: string[]
  category?: string
  exposed?: boolean
  type?: string
  project?: string
  color?: string
  label?: string
  value?: string
  annotationPourcent?: number
  annotationCount?: number
  updatedAt?: Date
  createdAt?: Date
  min?: number
  max?: number
  parents?: string[]
}

export type ImportEntryPayload = {
  item: {
    uuid: string
  }
  itemMetadata: {
    createdAt: Date
    updated: Date
    seenAt: Date
  }
  annotation: {
    [type: string]: {
      [category: string]: { labels: ExternalEntity[]; entities: ExternalEntity[] }
    }
  }
  annotationMetadata: {
    annotatedAt: Date
    annotatedBy: string
  }
  markers: string[]
  tags: string[]
  comments: {
    comment: string
    user?: User
    updatedAt: Date
    createdAt: Date
  }[]
}
