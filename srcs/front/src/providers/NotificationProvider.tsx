import React, { createContext, ReactNode, useContext, useEffect } from 'react'

import { useGetFriends } from '../components/hook/Friends.hook'
import { notificationSocket } from '../utils/socketService'

type Props = {
  children: ReactNode
}

export enum NotificationEvent {
  REFRESH = 'refresh',
  STATUS_CHANGE = 'status_change',
  GET_STATUS = 'get_status',
}

export enum Status {
  IN_GAME = 'in_game',
  ONLINE = 'online',
  OFFLINE = 'offline',
}

const NotificationContext = createContext({
  statuses: {} as Record<number, Status>,
})

export const NotificationProvider = ({ children }: Props) => {
  const getFriendQuery = useGetFriends()
  const [statuses, setStatuses] = React.useState<Record<number, Status>>({})

  useEffect(() => {
    notificationSocket.emit(NotificationEvent.GET_STATUS)
  }, [])

  useEffect(() => {
    notificationSocket.on(NotificationEvent.REFRESH, async () => {
      await getFriendQuery.refetch()
    })

    notificationSocket.on(
      NotificationEvent.STATUS_CHANGE,
      (data: { userId: number; status: Status }) => {
        setStatuses((prevStatus) => {
          const newStatus = { ...prevStatus }
          newStatus[data.userId] = data.status
          return newStatus
        })
      },
    )
    return () => {
      notificationSocket.off(NotificationEvent.REFRESH)
      notificationSocket.off(NotificationEvent.STATUS_CHANGE)
    }
  }, [])

  const values = {
    statuses,
  }

  return <NotificationContext.Provider value={values}>{children}</NotificationContext.Provider>
}

export const useNotification = () => useContext(NotificationContext)
