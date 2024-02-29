import { UseMutateFunction, useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import { FC, HTMLAttributes } from 'react'
import { FaCrown, FaGavel, FaUser } from 'react-icons/fa'
import { MdBlock } from 'react-icons/md'
import { PiSwordFill } from 'react-icons/pi'
import { Link } from 'react-router-dom'

import { useAuth } from '../../providers/AuthProvider'
import { ChatQueryKey, useChat } from '../../providers/ChatProvider'
import { EChannelType, IChannel, IChannelMember } from '../../types/Chat'
import { IUser } from '../../types/User'
import { createPm } from '../../utils/chatHttpRequests'
import { postBlockUser } from '../../utils/userHttpRequests'
import { UserActionModal } from './Modals/UserActionModal'

type UserProps = HTMLAttributes<HTMLDivElement> & {
  member: IChannelMember
  index: number
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  modalOpen: boolean
  setSelectedUser: React.Dispatch<React.SetStateAction<IUser | null>>
  showActionModal: boolean
  user: IUser
  userBlocked: boolean
  blockMutate: UseMutateFunction<
    AxiosResponse<
      {
        blockedId: number
      }[],
      Error
    >,
    Error,
    number,
    unknown
  >
}

const User: FC<UserProps> = ({
  member,
  index,
  setModalOpen,
  modalOpen,
  setSelectedUser,
  showActionModal,
  user,
  userBlocked,
  blockMutate,
}) => {
  const userStyle = clsx({
    'flex justify-between cursor-pointer hover:bg-accent hover:text-accent-content text-base-content my-2 rounded-lg py-2':
      true,
    'bg-base-100': index % 2 === 0,
    'bg-base-200': index % 2 === 1,
    'bg-error': userBlocked,
  })

  const { mutate } = useMutation({
    mutationFn: createPm,
  })

  const onClickAction = () => {
    setSelectedUser(member.user)
    setModalOpen(!modalOpen)
  }

  const onClickOnUserInList = () => {
    if (member.user.id === user.id) return
    mutate(member.userId)
  }

  return (
    <div className={userStyle}>
      <div onClick={onClickOnUserInList} className='flex items-center relative ml-1'>
        {member.role == 'owner' && <FaCrown className='text-error mt-1 m-1 mr-4' />}
        {member.role == 'admin' && <PiSwordFill className='text-warning mt-1 m-1 mr-4' />}
        {member.role == 'user' && <FaUser className='text-base mt-1 m-1 mr-4' />}
        <p className='hyphens-auto md:hyphens-none absolute pl-8'>{member.user.username}</p>
      </div>
      <div className='flex items-center gap-2 mr-2'>
        {member.user.id !== user?.id && (
          <button
            className='btn btn-xs btn-primary invisible lg:visible'
            onClick={(e) => {
              e.preventDefault()
              blockMutate(member.user.id)
            }}
          >
            <MdBlock />
          </button>
        )}
        {showActionModal && (
          <button onClick={onClickAction} className='btn btn-xs btn-warning invisible lg:visible'>
            <FaGavel />
          </button>
        )}
        {member.user.id !== user?.id && (
          <Link
            className='btn btn-xs btn-primary invisible md:visible'
            to={`/profile/${member.user.id}`}
          >
            <FaUser />
          </Link>
        )}
      </div>
    </div>
  )
}

const directMessageChannelRender = ({
  user,
  channel,
  blockMutate,
}: {
  user: IUser
  channel: IChannel
  blockMutate: UseMutateFunction<
    AxiosResponse<
      {
        blockedId: number
      }[],
      Error
    >,
    Error,
    number,
    unknown
  >
}) => {
  const notMe = channel.members.find((m) => m.user.id !== user?.id)
  if (!notMe) return <></>
  return (
    <div className='grid place-items-center mt-4'>
      <Link className='w-1/2 avatar' to={`/profile/${notMe.userId}`}>
        <div className='rounded'>
          <img src={notMe.user.image} alt='My profile' />
        </div>
      </Link>
      <span className='text-lg'>{notMe.user.username}</span>
      <Link
        to={'/chat'}
        onClick={() => {
          blockMutate(notMe.user.id)
        }}
        className='btn btn-outline'
      >
        Block
      </Link>
    </div>
  )
}

const userRender = ({
  user,
  channel,
  setModalOpen,
  setSelectedUser,
  showActionModal,
  blockedUsers,
  isModalOpen,
  blockMutate,
}: {
  user: IUser
  channel: IChannel
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  setSelectedUser: React.Dispatch<React.SetStateAction<IUser | null>>
  showActionModal: (member: IChannelMember) => boolean
  blockedUsers: {
    blockedId: number
  }[]
  isModalOpen: boolean
  blockMutate: UseMutateFunction<
    AxiosResponse<
      {
        blockedId: number
      }[],
      Error
    >,
    Error,
    number,
    unknown
  >
}) => {
  return (
    <div>
      <div className='flex flex-col items-center'>
        <h1 className='text-lg text-gray-900 text-center pt-1 font-bold mb-10 md:mt-0'>Users</h1>
        <hr className='w-32 h-0.5 mx-auto bg-gray-300 border-0 rounded  md:my-0'></hr>
      </div>
      <div className='p-2 '>
        {channel.members
          .filter((member) => member.present)
          .sort((a, b) => (a.user.username > b.user.username ? 1 : -1))
          .map((member, i) => (
            <User
              blockMutate={blockMutate}
              key={i}
              member={member}
              index={i}
              setModalOpen={setModalOpen}
              modalOpen={isModalOpen}
              setSelectedUser={setSelectedUser}
              user={user}
              userBlocked={!!blockedUsers.find(({ blockedId }) => blockedId === member.user.id)}
              showActionModal={showActionModal(member)}
            />
          ))}
      </div>
    </div>
  )
}

const ChatUsers = ({ channel }: { channel: IChannel }) => {
  const { user } = useAuth()
  const [userChannelList, setUserChannelList] = useState(true)
  const [isModalOpen, setModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null)
  const { blockedUsers } = useChat()

  useEffect(() => {
    if (userChannelList) setUserChannelList(false)
  }, [userChannelList])

  const findRole = (userId: number, members?: IChannelMember[]) =>
    members?.find((member) => member.userId === userId)?.role

  const queryClient = useQueryClient()

  const { mutate: blockMutate } = useMutation({
    mutationFn: postBlockUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [ChatQueryKey.BLOCK_LIST],
      })
    },
  })

  const showActionModal = (member: IChannelMember) => {
    if (userRole === 'user') return false
    if (userRole === 'admin') return member.role === 'user'
    if (userRole === 'owner') return member.role !== 'owner'
    return false
  }
  if (!user) return <></>
  const userRole = findRole(user.id, channel.members)

  return (
    <div>
      {isModalOpen && selectedUser && (
        <UserActionModal
          isModalOpen={isModalOpen}
          setModalOpen={setModalOpen}
          channelId={channel.id}
          userId={selectedUser.id}
        />
      )}
      {channel.type === EChannelType.direct
        ? directMessageChannelRender({ user, channel, blockMutate })
        : userRender({
            user,
            channel,
            blockedUsers,
            setModalOpen,
            setSelectedUser,
            showActionModal,
            isModalOpen,
            blockMutate,
          })}
    </div>
  )
}

export { ChatUsers }
