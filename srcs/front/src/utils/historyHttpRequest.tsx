import { QueryKey } from '@tanstack/react-query'

import httpInstance from './httpClient'

export const getStats = async ({ queryKey }: { queryKey: QueryKey }) => {
  const [_, id] = queryKey
  const { data } = await httpInstance().get(`/api/game/stats/${id}`)
  return data
}

export const getMatchHistory = async ({ queryKey }: { queryKey: QueryKey }) => {
  const [_, id] = queryKey
  const { data } = await httpInstance().get(`/api/game/match_history/${id}`)
  return data
}

export const getLadder = async ({ queryKey }: { queryKey: QueryKey }) => {
  const [_, id] = queryKey
  const { data } = await httpInstance().get(`/api/game/ladder/${id}`)
  return data
}
