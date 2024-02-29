import { io } from 'socket.io-client'

const URL = process.env.REACT_APP_BACKEND_URL ?? 'http://localhost:3000'

export const chatSocket = io(URL + '/chat', {
  withCredentials: true,
  autoConnect: false,
})

export const gameSocket = io(URL + '/game', {
  withCredentials: true,
  autoConnect: false,
})

export const notificationSocket = io(URL + '/notification', {
  withCredentials: true,
  autoConnect: false,
})

export const disconnectAll = () => {
  chatSocket.disconnect()
  gameSocket.disconnect()
  notificationSocket.disconnect()
}
