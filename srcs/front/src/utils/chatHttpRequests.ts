import { EChannelType, IChannel, IChannelMember } from '../types/Chat'
import { IUser } from '../types/User'
import httpInstance from './httpClient'

export const getMyChannels = async () => {
  const { data } = await httpInstance().get<Pick<IChannel, 'id'>[]>('/api/chat/channels/mine')
  return data
}

export const getChannel = async (channelId: string) => {
  const { data } = await httpInstance().get<IChannel>(`/api/chat/channels/${channelId}`)
  return data
}

export const getNotJoinedVisibleChannels = async () => {
  const { data } = await httpInstance().get<IChannel[]>(`/api/chat/channels`)
  return data
}

export const joinChannel = async (channelId: string, password: string) => {
  const { data } = await httpInstance().post(`/api/chat/channels/${channelId}/join`, {
    password,
  })
  return data
}

export const leaveChannel = async (channelId: string): Promise<IChannelMember> => {
  const { data } = await httpInstance().post(`/api/chat/channels/${channelId}/leave`)
  return data
}

export const createChannel = async (name: string, type: EChannelType, password?: string) => {
  const { data } = await httpInstance().post<IChannel>('/api/chat/channels', {
    name,
    type,
    password,
  })
  return data
}

export const editChannel = async ({
  id,
  name,
  type,
  password,
}: {
  id: string
  name: string
  type: EChannelType
  password?: string
}) => {
  const { data } = await httpInstance().patch<IChannel>('/api/chat/channels', {
    id,
    name,
    type,
    password,
  })
  return data
}

export const createPm = async (targetId: number) => {
  const { data } = await httpInstance().post<IChannel>('/api/chat/pms', {
    targetId,
  })
  return data
}

export const userAction = async ({
  channelId,
  userId,
  action,
}: {
  channelId: string
  userId: number
  action: string
}) =>
  httpInstance().post(`/api/chat/channels/${channelId}/${action}`, {
    userId,
  })

export const getUsersNotInChannel = async ({ channelId }: { channelId: string }) => {
  const { data } = await httpInstance().get<IUser[]>(`/api/chat/channels/${channelId}/users`)
  return data
}

export const inviteUser = async ({ channelId, userId }: { channelId: string; userId: number }) => {
  const { data } = await httpInstance().post(`/api/chat/channels/${channelId}/invite`, {
    userId,
  })
  return data
}
