import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Navigate } from 'react-router-dom'

import { useAuth } from '../../providers/AuthProvider'
import { useSocket } from '../../providers/SocketProvider'
import { QueueWaitModal } from './QueueModal'

/* const createGame = async () => {

} */

export const Play = () => {
  const { user } = useAuth()
  if (!user) return <Navigate to='/login' replace />
  toast.success('Match making in Progress you can move until find opponent', {
    duration: 5000,
  })
  const { gameSocket, isGameConnected } = useSocket()
  const [gameMode, setGameMode] = useState('')
  const queueModalRef = useRef<HTMLDialogElement>(null)

  const subscribeToGame = async () => {
    try {
      gameSocket?.emit('startGame', { gameMode: 'classic' })
      setGameMode('classic')
      queueModalRef.current?.showModal()
      toast.success('Match making in Progress you can move until find opponent', {
        duration: 5000,
      })
    } catch (error) {
      toast.error('can not start game')
    }
  }

  const subscribeToGameExtra = async () => {
    try {
      gameSocket?.emit('startGame', { gameMode: 'extra' })
      setGameMode('extra')
      queueModalRef.current?.showModal()
      toast.success('Match making in Progress you can move until find opponent', {
        duration: 5000,
      })
    } catch (error) {
      toast.error('can not start game')
    }
  }
  if (!isGameConnected) return <></>
  return (
    <div>
      <div className='flex h-screen justify-center items-center space-x-4'>
        <button
          data-modal-target='static-modal'
          data-modal-toggle='static-modal'
          className='relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800'
          onClick={subscribeToGame}
        >
          <span className='relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0'>
            START GAME
          </span>
        </button>
        <button
          className='relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800'
          onClick={subscribeToGameExtra}
        >
          <span className='relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0'>
            CUSTOM PLAY
          </span>
        </button>
      </div>
      <QueueWaitModal gameMode={gameMode} setGameMode={setGameMode} ref={queueModalRef} />
    </div>
  )
}
