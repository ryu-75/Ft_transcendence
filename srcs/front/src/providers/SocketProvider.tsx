import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { Socket } from 'socket.io-client'

import { ChatSocketEvent } from '../types/Events'
import { chatSocket, gameSocket, notificationSocket } from '../utils/socketService'
import { useAuth } from './AuthProvider'

interface SocketContextData {
  chatSocket: Socket
  gameSocket: Socket
  notificationSocket: Socket
  isChatConnected: boolean
  isGameConnected: boolean
  isNotificationConnected: boolean
}

type Props = {
  children: ReactNode
}

export const SocketContext = createContext<SocketContextData>({
  chatSocket,
  gameSocket,
  notificationSocket,
  isChatConnected: false,
  isGameConnected: false,
  isNotificationConnected: false,
})

export const SocketProvider = ({ children }: Props) => {
  const { user } = useAuth()
  const [isChatConnected, setChatIsConnected] = useState<boolean>(false)
  const [isGameConnected, setGameIsConnected] = useState<boolean>(false)
  const [isNotificationConnected, setisNotificationConnected] = useState<boolean>(false)

  useEffect(() => {
    if (!isChatConnected && user) chatSocket.connect()
  }, [isChatConnected, user])

  useEffect(() => {
    if (!isGameConnected && user) gameSocket.connect()
  }, [isGameConnected, user])

  useEffect(() => {
    if (!isNotificationConnected && user) notificationSocket.connect()
  }, [isNotificationConnected, user])

  useEffect(() => {
    chatSocket.on('connect', () => {
      setChatIsConnected(true)
      chatSocket.emit(ChatSocketEvent.SUBSCRIBE)
      console.log('ChatSocket connect')
    })

    chatSocket.on('disconnect', () => {
      setChatIsConnected(false)
      chatSocket.emit(ChatSocketEvent.UNSUBSCRIBE)
      console.log('ChatSocket disconnect')
    })

    gameSocket.on('connect', () => {
      setGameIsConnected(true)
      console.log('GameSocket connect')
    })

    gameSocket.on('disconnect', () => {
      setGameIsConnected(false)
      console.log('GameSocket disconnect')
    })

    notificationSocket.on('connect', () => {
      setisNotificationConnected(true)
      console.log('NotificationSocket connect')
    })
    notificationSocket.on('disconnect', () => {
      setisNotificationConnected(false)
      console.log('NotificationSocket disconnect')
    })

    return () => {
      chatSocket.removeAllListeners()
      chatSocket.disconnect()
      gameSocket.removeAllListeners()
      gameSocket.disconnect()
      notificationSocket.removeAllListeners()
      notificationSocket.disconnect()
    }
  }, [])

  const values = {
    chatSocket,
    isChatConnected,
    isGameConnected,
    gameSocket,
    isNotificationConnected,
    notificationSocket,
  }
  return <SocketContext.Provider value={values}>{children}</SocketContext.Provider>
}

export const useSocket = () => useContext(SocketContext)
