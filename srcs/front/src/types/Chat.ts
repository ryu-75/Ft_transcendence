import { IUser } from './User'

export type TRole = 'admin' | 'user' | 'owner'

export type FrontEndMessage = Omit<IChannelMessage, 'createdAt' | 'updatedAt' | 'deletedAt' | 'id'>

export enum EChannelType {
  public = 'public',
  private = 'private',
  protected = 'protected',
  direct = 'direct',
}

export type IChannel = {
  id: string
  name: string
  type: EChannelType
  ownerId: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  members: IChannelMember[]
  messages: IChannelMessage[]
  actions: unknown[]
}

export type IChannelMember = {
  role: TRole
  userId: number
  channelId: string
  channel: IChannel
  present: boolean
  user: IUser
}

export type IChannelMessage = {
  id: number
  content: string
  senderId: number
  gameInvite: boolean
  channelId: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}
