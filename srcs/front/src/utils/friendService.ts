import { IFriends } from '../types/User'
import httpInstance from './httpClient'

export const createFriendRequest = async (friendOfId: number) => {
  await httpInstance().post<IFriends>(`/api/friends`, {
    friendOfId,
  })
}

export const getMyFriends = async () => (await httpInstance().get<IFriends[]>(`/api/friends`)).data

export const acceptFriendRequest = async (friendOfId: number) => {
  const response = await httpInstance().post<IFriends>(`/api/friends/add`, {
    friendOfId,
  })
  return response.data
}

export const getMyNonFriends = async () =>
  (await httpInstance().get<IFriends[]>(`/api/friends/non_confirmed`)).data

export const removeFriend = async (friendOfId: number) => {
  await httpInstance().delete<IFriends>(`/api/friends/remove`, {
    data: {
      friendOfId,
    },
  })
}

export const getFriends = async () => {
  const { data } = await httpInstance().get<IFriends[]>(`/api/friends`)
  return data
}
