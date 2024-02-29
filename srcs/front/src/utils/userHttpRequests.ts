import { QueryKey } from '@tanstack/react-query'

import { IUser } from '../types/User'
import httpInstance from './httpClient'

export const logout = async () => httpInstance().get('/api/auth/logout')
export const fetchUser = async () => (await httpInstance().get<IUser>('/api/users/me')).data
export const updateUser = async (user: FormData) =>
  httpInstance().patch<IUser>('/api/users/me', user, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const fetchAllUsers = async () => (await httpInstance().get<IUser[]>(`/api/users`)).data
export const getUser = async ({ queryKey }: { queryKey: QueryKey }) => {
  const [_, id] = queryKey
  const { data } = await httpInstance().get<IUser>(`/api/users/${id}`)
  return data
}
export const postBlockUser = async (id: number) =>
  httpInstance().post(`/api/users/block`, {
    userId: id,
  })
export const getBlockList = async () => {
  const { data } = await httpInstance().get<
    {
      blockedId: number
    }[]
  >(`/api/users/blocked`)
  return data
}
