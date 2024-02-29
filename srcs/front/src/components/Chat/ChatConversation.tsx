import React, { useEffect, useRef, useState } from 'react'
import { FaHashtag, FaLock } from 'react-icons/fa'
import { IoEyeOffSharp } from 'react-icons/io5'
import { Navigate } from 'react-router-dom'

import { useAuth } from '../../providers/AuthProvider'
import { useChat } from '../../providers/ChatProvider'
import { useSocket } from '../../providers/SocketProvider'
import { FrontEndMessage, IChannel } from '../../types/Chat'
import { ChatSocketEvent } from '../../types/Events'
import { IUser } from '../../types/User'
import { ChatInput } from './ChatInput'
import { ChatMessage } from './ChatMessage'

type ChatChannelProps = {
  currentChannel: IChannel
  me: IUser
}

const ChatConversation = ({ currentChannel, me }: ChatChannelProps) => {
  const currentRef = useRef<HTMLDivElement>(null)
  const { chatSocket } = useSocket()
  const { user } = useAuth()
  const [messages, setMessages] = useState<FrontEndMessage[]>([])
  const { blockedUsers } = useChat()

  if (!user) return <Navigate to='/login' replace />

  const getChannelName = () => {
    if (currentChannel) {
      if (currentChannel.type === 'public') {
        return (
          <div className='flex items-center'>
            <FaHashtag className='mr-2' />
            {currentChannel.name}
          </div>
        )
      }
      if (currentChannel.type === 'private') {
        return (
          <div className='flex items-center'>
            <IoEyeOffSharp className='mr-2' />
            {currentChannel.name}
          </div>
        )
      }
      if (currentChannel.type === 'protected') {
        return (
          <div className='flex items-center'>
            <FaLock className='mr-2' />
            {currentChannel.name}
          </div>
        )
      }
      if (currentChannel.type === 'direct') {
        return (
          <div className='flex items-center'>
            {currentChannel.members.find((member) => member.userId !== user.id)?.user.username}
          </div>
        )
      }
    }
  }

  useEffect(() => setMessages(currentChannel.messages), [currentChannel])
  useEffect(() => {
    if (currentRef.current) {
      currentRef.current.scrollTo({
        top: currentRef.current.scrollHeight,
        behavior: 'auto',
      })
    }
  }, [messages])

  useEffect(() => {
    const messageListener = (newMessage: FrontEndMessage) => {
      if (newMessage.channelId === currentChannel.id) {
        setMessages((messages) => [...messages, newMessage])
      }
    }
    const deleteMessageListener = (data: { content: string; channelId: string }) => {
      if (data.channelId === currentChannel.id) {
        setMessages((currentMessages) =>
          currentMessages.filter((message) => message.content !== data.content),
        )
      }
    }

    chatSocket.on(ChatSocketEvent.MESSAGE, messageListener)

    chatSocket.on(ChatSocketEvent.MESSAGE_DELETED, deleteMessageListener)

    // Fonction de nettoyage pour supprimer l'écouteur lors du démontage
    return () => {
      chatSocket.off(ChatSocketEvent.MESSAGE, messageListener)
      chatSocket.off(ChatSocketEvent.MESSAGE_DELETED, deleteMessageListener)
    }
  }, [currentChannel.id, chatSocket])

  return (
    <main
      data-component-name='chat-conv'
      className='flex-1 p:2 pb-36 pt-10 justify-between bg-white flex flex-col h-screen border-l border-r'
    >
      <div className='gap-6 inset-x-0 top-0 border-b '>
        <div className='flex justify-center align-middle items-center text-gray-900 w-full h-5 pb-8'>
          {getChannelName()}
        </div>
      </div>
      <div
        ref={currentRef}
        className='flex flex-col space-y-4 border-b h-full overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch'
      >
        {messages.map((message, i) => {
          const blocked = !blockedUsers.find(({ blockedId }) => message.senderId === blockedId)
          return (
            <ChatMessage
              key={i}
              message={message}
              user={me}
              members={currentChannel.members}
              blocked={blocked}
            />
          )
        })}
      </div>
      <div className='px-4 pt-10'>
        <ChatInput channelId={currentChannel.id} setMessage={setMessages} />
      </div>
    </main>
  )
}

export { ChatConversation }
