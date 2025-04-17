export interface BaseDocument {
  id: number
  title: string
  description: string
  date: string
  category: string
  type: string
  starred: boolean
  access: 'public' | 'private' | 'team'
}

export interface PublicDocument extends BaseDocument {
  source: string
  access: 'public'
}

export interface PrivateDocument extends BaseDocument {
  owner: string
  team: string
  access: 'private' | 'team'
  sharedWith: string[]
}

export type Document = PublicDocument | PrivateDocument

export interface Collection {
  id: number
  name: string
  count: number
  icon: string
  access: 'public' | 'private' | 'team'
  team?: string
  owner?: string
}

export interface Team {
  id: number
  name: string
  members: number
  icon: string
}