import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { IChannel } from '../../types/Chat'
import { getChannel } from '../../utils/chatHttpRequests'

export const useCurrentChannel = () => {
  const { channelId } = useParams<{ channelId: string | undefined }>()

  const channel = useQuery<IChannel>({
    queryKey: ['channel', channelId],
    queryFn: ({ queryKey }) => getChannel(queryKey[1] as string),
    retry: false,
    enabled: !!channelId,
  })

  return {
    currentChannel: channel.data,
    channelId,
  }
}
