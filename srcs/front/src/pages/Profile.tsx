import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import clsx from 'clsx'
import React from 'react'
import { FaGamepad } from 'react-icons/fa'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'

import { useDeleteFriends, useGetFriends } from '../components/hook/Friends.hook'
import { WithNavbar } from '../hoc/WithNavbar'
import { useAuth } from '../providers/AuthProvider'
import { Status, useNotification } from '../providers/NotificationProvider'
import { createFriendRequest } from '../utils/friendService'
import { getLadder, getStats } from '../utils/historyHttpRequest'
import { fetchUser, getUser } from '../utils/userHttpRequests'
import { RatingHistory } from './../components/RatingHistory'

const Profile = () => {
  const { user, signout } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const { mutate: deleteFriend } = useDeleteFriends()
  const { data: friends } = useGetFriends()

  if (!id) {
    navigate('*')
    return <></>
  }
  const { statuses } = useNotification()
  const queryClient = useQueryClient()

  if (!user) return <Navigate to='/login' state={{ from: location }} replace />

  const queryConfigMyProfile = {
    queryKey: ['profile', 'me'],
    queryFn: fetchUser,
  }

  const queryConfigOtherProfile = {
    queryKey: ['profile', id],
    queryFn: getUser,
  }

  const { data: profileUser } = useQuery(
    id !== 'me' ? queryConfigOtherProfile : queryConfigMyProfile,
  )

  const userId = id !== 'me' ? profileUser?.id : user.id
  const { data: userStats } = useQuery({
    queryKey: ['stats', userId],
    queryFn: getStats,
    enabled: userId !== undefined,
  })

  const friendRequestMutation = useMutation({
    mutationKey: ['friends'],
    mutationFn: createFriendRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['friends'],
      })
    },
  })

  const onButtonClick = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    await signout()
  }

  const numberFriends: number = friends.reduce(
    (prev, next) => (next.confirmed ? prev + 1 : prev),
    0,
  )
  if (!profileUser) return <></>
  if (!profileUser.id) return <Navigate to='/404' replace />

  // Regle css. User offline/online
  const userIsConnect = clsx({
    ['w-36 rounded-full drop-shadow-lg hover:drop-shadow-xl justify-self-start border-4']: true,
    ['border-green-600']: statuses[profileUser.id] === Status.ONLINE,
    ['border-yellow-600']: statuses[profileUser.id] === Status.IN_GAME,
    ['border-red-600']: statuses[profileUser.id] === Status.OFFLINE,
  })

  // profile not in friends-> not friend
  // profile in friends but not confirmed -> pending
  // profile in friends and confirmed -> friend

  const renderFriendButton = () => {
    const friend = friends.find((friend) => {
      return friend.friendId === profileUser.id || friend.friendOf.id === profileUser.id
    })
    if (!friend) {
      return (
        <button
          onClick={() => {
            friendRequestMutation.mutate(profileUser.id)
          }}
          className='btn btn-info drop-shadow-xl rounded-lg'
        >
          Add Friend
        </button>
      )
    } else if (friend.confirmed) {
      return (
        <button
          onClick={() => {
            deleteFriend(profileUser.id)
          }}
          className='btn btn-info drop-shadow-xl rounded-lg'
        >
          Remove Friend
        </button>
      )
    } else {
      return (
        <button
          onClick={() => {
            deleteFriend(profileUser.id)
          }}
          className='btn btn-info drop-shadow-xl rounded-lg'
        >
          Cancel
        </button>
      )
    }
  }

  return (
    <div className='flex lg:flex-row flex-col justify-center align-middle bg-gray-900'>
      <div
        className='hero'
        style={{
          padding: '10px',
        }}
      >
        <div className='hero-overlay bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 drop-shadow-md rounded-lg bg-opacity-60'></div>
        <div className='hero-content text-center text-neutral-content'>
          <div className='w-full pt-4'>
            <div className='flex flex-row justify-center'>
              <h1 className='mb-5 text-5xl font-bold text-purple-100'>
                {profileUser && <span>{profileUser?.username}</span>}
              </h1>
              {statuses[profileUser.id] === Status.IN_GAME && (
                <div>
                  <FaGamepad size={32} className='relative text-gray-900 left-8 top-2' />
                </div>
              )}
            </div>
            <div className='avatar flex flex-row justify-center'>
              <div className={userIsConnect}>
                <img src={profileUser?.image} alt='avatar' />
              </div>
            </div>
            <div className='columns-3 flex-auto space-y-20'>
              <div className='grid-cols-2 space-x-0 shadow-xl'>
                <p className='font-bold rounded-t-lg drop-shadow-md'>Win</p>
                <p className='px-10 text-black rounded-b-lg backdrop-opacity-10 backdrop-invert bg-white/50'>
                  {userStats?.victories}
                </p>
              </div>
              <div className='grid-cols-2 space-x-0 shadow-xl'>
                <p className='font-bold rounded-t-lg drop-shadow-md'>Lose</p>
                <p className='px-10 text-black rounded-b-lg backdrop-opacity-10 backdrop-invert bg-white/50'>
                  {userStats?.defeats}
                </p>
              </div>
              <div className='grid-cols-2 space-x-0 rounded-lg  shadow-xl'>
                <p className='font-bold drop-shadow-md'>Friends</p>
                <p className='px-10 text-black rounded-b-lg backdrop-opacity-10 backdrop-invert bg-white/50'>
                  {numberFriends}
                </p>
              </div>
            </div>
            <div className='flex flex-row mt-8 justify-evenly items-center'>
              {user.id !== profileUser.id && renderFriendButton()}
              {user.id === profileUser.id && (
                <Link
                  to={`/friends`}
                  type='button'
                  className='btn btn-secondary drop-shadow-xl rounded-lg'
                >
                  Friends
                </Link>
              )}
              {user.id === profileUser.id && (
                <button
                  className='btn btn-outline drop-shadow-xl rounded-lg'
                  onClick={onButtonClick}
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div
        className='hero'
        style={{
          padding: '10px',
        }}
      >
        <RatingHistory user={user} id={id} profileUser={profileUser} />
      </div>
    </div>
  )
}

const ProfileWithNavbar = WithNavbar(Profile)
export { Profile, ProfileWithNavbar }
