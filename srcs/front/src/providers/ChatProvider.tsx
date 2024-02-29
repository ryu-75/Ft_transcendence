import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { createContext, ReactNode, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { IChannel, IChannelMember } from '../types/Chat'
import { ChatSocketEvent } from '../types/Events'
import { getChannel, getMyChannels } from '../utils/chatHttpRequests'
import { getBlockList } from '../utils/userHttpRequests'
import { useAuth } from './AuthProvider'
import { useSocket } from './SocketProvider'

interface ChatContextData {
  myChannels: Pick<IChannel, 'id'>[]
  allChannels: IChannel[]
  blockedUsers: {
    blockedId: number
  }[]
}

type Props = {
  children: ReactNode
}

export enum ChatQueryKey {
  MY_CHANNELS = 'mine',
  CHANNEL_NOT_JOINED = 'channels-not-joined',
  CHANNEL = 'channels',
  USER_LIST = 'user-list',
  BLOCK_LIST = 'block-list',
}

export const ChatContext = createContext<ChatContextData>({
  myChannels: [],
  allChannels: [],
  blockedUsers: [],
})

export const ChatProvider = ({ children }: Props) => {
  const { chatSocket, isChatConnected } = useSocket()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const myChannelQuery = useQuery({
    queryKey: [ChatQueryKey.MY_CHANNELS],
    queryFn: getMyChannels,
    initialData: [],
    enabled: !!user,
  })

  const channelsQuery = useQueries({
    queries: myChannelQuery.data.map((channel) => ({
      queryKey: [channel.id],
      queryFn: () => getChannel(channel.id),
      enabled: !!user,
    })),
  })

  const blockListQuery = useQuery({
    queryKey: [ChatQueryKey.BLOCK_LIST],
    queryFn: getBlockList,
    initialData: [],
    enabled: !!user,
  })

  useEffect(() => {
    chatSocket.on(ChatSocketEvent.EDIT_CHANNEL, async (data: IChannelMember) => {
      await queryClient.invalidateQueries({
        queryKey: [data.channelId],
      })
    })

    chatSocket.on(
      ChatSocketEvent.JOIN_CHANNEL,
      async (data: { channelId: string; userId: number; background: boolean }) => {
        if (data.userId === user?.id) {
          await myChannelQuery.refetch()
          if (!data.background) {
            navigate(`/chat/${data.channelId}`)
          }
        } else {
          await queryClient.invalidateQueries({
            queryKey: [data.channelId],
          })
        }
      },
    )

    chatSocket.on(
      ChatSocketEvent.LEAVE_CHANNEL,
      async (data: { channelId: string; userId: number }) => {
        if (data.userId === user?.id) {
          await myChannelQuery.refetch()
          navigate(`/chat`)
        } else {
          await queryClient.invalidateQueries({
            queryKey: [data.channelId],
          })
        }
      },
    )

    return () => {
      chatSocket.off(ChatSocketEvent.EDIT_CHANNEL)
      chatSocket.off(ChatSocketEvent.JOIN_CHANNEL)
      chatSocket.off(ChatSocketEvent.LEAVE_CHANNEL)
    }
  }, [isChatConnected, user])

  const values = {
    allChannels: channelsQuery
      .map((channel) => channel.data)
      .filter((channel): channel is IChannel => channel !== undefined),
    myChannels: myChannelQuery.data,
    blockedUsers: blockListQuery.data,
  }

  return <ChatContext.Provider value={values}>{children}</ChatContext.Provider>
}

export const useChat = () => useContext(ChatContext)
