import React, { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'

import { ChatConversation, ChatSelection, ChatUsers } from '../components/Chat'
import { CreateChannelModal } from '../components/Chat/Modals/CreateChannelModal'
import { JoinChannelModal } from '../components/Chat/Modals/JoinChannelModal'
import { WithNavbar } from '../hoc/WithNavbar'
import { useAuth } from '../providers/AuthProvider'
import { useChat } from '../providers/ChatProvider'
import { IChannel } from '../types/Chat'

const Chat = () => {
  const { channelId } = useParams<{ channelId: string | undefined }>()
  const { user } = useAuth()
  const { allChannels } = useChat()

  const [isCreateModalOpen, setCreateModalOpen] = useState(false)
  const [isJoinModalOpen, setJoinModalOpen] = useState(false)
  const [currentChannel, setCurrentChannel] = useState<IChannel | undefined>(undefined)

  if (!user) return <Navigate to='/login' replace />

  useEffect(() => {
    const currChannel = allChannels.find((channel) => channel.id === channelId)
    setCurrentChannel(currChannel)
  }, [channelId, allChannels])

  return (
    <div className='container mx-auto border rounded-t-lg'>
      {CreateChannelModal({ isCreateModalOpen, setCreateModalOpen })}
      {JoinChannelModal({ isJoinModalOpen, setJoinModalOpen })}
      <div className='flex flex-row'>
        <div className='w-3/12 bg-gray-200 h-screen rounded-tl-lg drop-shadow-md'>
          <div className='flex flex-col gap-2 border-b p-4'>
            <button
              onClick={(e) => {
                e.preventDefault()
                setCreateModalOpen(!isCreateModalOpen)
              }}
              className='btn btn-primary'
            >
              Add Channel
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                setJoinModalOpen(!isJoinModalOpen)
              }}
              className='btn btn-secondary'
            >
              Join Channel
            </button>
          </div>
          <ChatSelection channelId={channelId} />
        </div>
        {!currentChannel ? (
          <div className='w-9/12 items-center text-center'>
            <h1 className='text-2xl mt-32'>Select a channel</h1>
          </div>
        ) : (
          <>
            <div className='w-6/12'>
              <ChatConversation currentChannel={currentChannel} me={user} />
            </div>
            <div className='w-3/12 dark:bg-gray-200 bg-gray-900 rounded-tr-lg drop-shadow-md'>
              <ChatUsers channel={currentChannel} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const ChatWithNavbar = WithNavbar(Chat)
export { ChatWithNavbar }
