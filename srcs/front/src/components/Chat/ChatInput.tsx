import 'react-toastify/dist/ReactToastify.css'

import React, { useEffect, useState } from 'react'
import { FaRocket } from 'react-icons/fa'
import { MdPartyMode, MdSend } from 'react-icons/md'
import { toast } from 'react-toastify'

import { useAuth } from '../../providers/AuthProvider'
import { useSocket } from '../../providers/SocketProvider'
import { FrontEndMessage } from '../../types/Chat'
import { ChatSocketEvent } from '../../types/Events'

const ChatInput = ({
  channelId,
  setMessage,
}: {
  channelId: string
  setMessage: React.Dispatch<React.SetStateAction<FrontEndMessage[]>>
}) => {
  const { chatSocket, gameSocket } = useSocket()
  const { user } = useAuth()
  const [inputMessage, setInputMessage] = useState<string>('')

  if (!user) return <></>

  useEffect(() => {
    const handleGameAlreadyCreated = (response: any) => {
      toast.error(response.message, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
      })
    }

    gameSocket?.on('gamePersoAlreadyCreated', handleGameAlreadyCreated)

    return () => {
      gameSocket?.off('gamePersoAlreadyCreated', handleGameAlreadyCreated)
    }
  }, [gameSocket])

  const sendMessage = async (message: FrontEndMessage) => {
    if (message.gameInvite) {
      gameSocket.emit('createGamePerso')
      const partyNumber = await new Promise<string>((resolve) => {
        gameSocket.once('gamePersoCreated', ({ partyNumber }) => {
          resolve(partyNumber)
        })
      })
      message.content = partyNumber
    }
    chatSocket.emit(ChatSocketEvent.MESSAGE, message)
    setMessage((messages) => [...messages, message])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSendMessage()
  }

  const handleSendMessage = () => {
    if (inputMessage.trim() !== '') {
      const newMessage: FrontEndMessage = {
        channelId,
        content: inputMessage,
        senderId: user.id,
        gameInvite: false,
      }
      sendMessage(newMessage)
      setInputMessage('')
    }
  }

  return (
    <div className='relative flex'>
      <input
        type='text'
        value={inputMessage}
        onKeyDown={handleKeyDown}
        onChange={(e) => setInputMessage(e.target.value)}
        placeholder='Message'
        className='input input-bordered input-primary w-full'
      />
      <div className='absolute right-0 items-center inset-y-0 flex'>
        <button
          type='button'
          onClick={() => {
            sendMessage({
              channelId,
              content: 'lobbyId',
              gameInvite: true,
              senderId: user.id,
            })
          }}
          className='btn btn-error'
        >
          <span className='font-bold text-accent-content'>Play</span>
          <FaRocket className='text-accent-content text-lg' />
        </button>
        <button
          type='button'
          onClick={handleSendMessage}
          className='btn btn-primary'
          disabled={!inputMessage.trim()}
        >
          <span className='font-bold text-primary-content'>Send</span>
          <MdSend className='text-primary-content text-lg' />
        </button>
      </div>
    </div>
  )
}

export { ChatInput }
