import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '../../providers/AuthProvider'
import { getMyFriends, removeFriend } from '../../utils/friendService'

export const useGetFriends = () => {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['friends'],
    queryFn: getMyFriends,
    initialData: [],
    enabled: !!user,
  })
}

export const useDeleteFriends = () => {
  const queryClient = useQueryClient()
  const { mutate } = useMutation({
    mutationKey: ['friends'],
    mutationFn: removeFriend,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['friends'],
      })
    },
  })

  return {
    mutate,
  }
}
