import { useMutation, useQueryClient } from '@tanstack/react-query'
import clsx from 'clsx'
import React from 'react'
import { FaBell } from 'react-icons/fa'
import { RxCheckCircled, RxCrossCircled } from 'react-icons/rx'
import { Link, Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '../providers/AuthProvider'
import { acceptFriendRequest, removeFriend } from '../utils/friendService'
import { useGetFriends } from './hook/Friends.hook'

const Navbar = () => {
  const { user, signout } = useAuth()
  const { pathname } = useLocation()
  const queryClient = useQueryClient()
  const { data: friends } = useGetFriends()

  if (!user) return <Navigate to='/login' state={{ from: location }} replace />

  const deleteFriendMutation = useMutation({
    mutationKey: ['friends'],
    mutationFn: removeFriend,
  })

  const friendAcceptedMutation = useMutation({
    mutationKey: ['friends'],
    mutationFn: acceptFriendRequest,
  })

  const onButtonClick = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    await signout()
  }

  const selectItemClass = (pathname: string, expectedPath: string) =>
    clsx({
      'font-bold': true,
      'text-base-content': pathname === expectedPath,
    })

  const hasNofitication =
    friends
      .filter((friend) => user.id !== friend.friendId)
      .filter((friend) => friend.confirmed === false).length > 0
  return (
    <div className='navbar nav relative bg-gray-100'>
      <div className='navbar-start'>
        <div className='dropdown'>
          <div tabIndex={0} role='button' className='btn btn-ghost lg:hidden'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 text-base-content'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M4 6h16M4 12h8m-8 6h16'
              />
            </svg>
          </div>
          <ul className='menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52'>
            <li>
              <Link className={selectItemClass(pathname, '/')} to='/'>
                Home
              </Link>
            </li>
            <li>
              <Link className={selectItemClass(pathname, '/chat')} to='/chat'>
                Chat
              </Link>
            </li>
            <li>
              <Link className={selectItemClass(pathname, '/play')} to='/play'>
                Game
              </Link>
            </li>
          </ul>
        </div>
        <Link to={'/'} className='btn btn-ghost text-xl pongBtn invisible lg:visible'>
          Pong
        </Link>
      </div>
      <div className='navbar-center hidden lg:flex'>
        <ul className='menu menu-horizontal px-1 flex gap-40'>
          <li>
            <Link
              className={selectItemClass(pathname, '/chat') + 'btn-menu btn-one letterMove'}
              to='/chat'
            >
              Chat
            </Link>
          </li>
          <li>
            <Link
              className={selectItemClass(pathname, '/play') + 'btn-menu btn-one letterMove'}
              to='/play'
            >
              Game
            </Link>
          </li>
        </ul>
      </div>
      {/* Profile and notifications */}
      <div className='navbar-end'>
        <div className='dropdown dropdown-bottom dropdown-end'>
          <div tabIndex={1} role='button' className='btn btn-ghost m-1 indicator'>
            <span
              className={
                hasNofitication
                  ? 'indicator-item indicator-start badge badge-secondary'
                  : 'indicator-item indicator-start'
              }
            ></span>
            <FaBell tabIndex={1} size={20} />
          </div>
          <ul
            tabIndex={1}
            className='menu menu-sm dropdown-content mt-3 z-40 p-2 shadow bg-base-100 rounded-box'
          >
            {hasNofitication ? (
              friends
                .filter((friend) => user.id !== friend.friendId)
                .filter((friend) => friend.confirmed === false)
                .map(({ friend }, i) => (
                  <li key={i} className='z-50'>
                    <div>
                      <div className='avatar'>
                        <div className='w-6 rounded-full'>
                          <img className='img' src={friend.image} alt='img' />
                        </div>
                      </div>
                      <span className='flex-1 text-base-content whitespace-nowrap static'>
                        {friend.username}
                      </span>
                      <RxCheckCircled
                        role='button'
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          friendAcceptedMutation.mutate(friend.id, {
                            onSuccess: async () => {
                              await queryClient.invalidateQueries({
                                queryKey: ['friends'],
                              })
                            },
                          })
                        }}
                        size={20}
                        className='text-green-500'
                      />
                      <RxCrossCircled
                        role='button'
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          if (friend.id !== user?.id) {
                            deleteFriendMutation.mutate(friend.id, {
                              onSuccess: async () => {
                                await queryClient.invalidateQueries({
                                  queryKey: ['friends'],
                                })
                              },
                            })
                          }
                        }}
                        size={20}
                        className='text-red-500'
                      />
                    </div>
                  </li>
                ))
            ) : (
              <li className='text-base-content z-50 w-32 text-center'>No notification</li>
            )}
          </ul>
        </div>
        <div className='dropdown dropdown-end'>
          <div className='flex flex-row'>
            <div tabIndex={0} role='button' className='btn btn-ghost btn-circle avatar btn-avatar'>
              <div className='w-10 rounded-full'>
                <img alt='avatar' src={user?.image} />
              </div>
            </div>
          </div>
          <ul
            tabIndex={0}
            className='menu menu-sm dropdown-content mt-3 z-40 p-2 shadow bg-base-100 rounded-box w-52'
          >
            <li>
              <Link className='text-base-content' to='/profile/me'>
                Profile
              </Link>
            </li>
            <li>
              <Link className='text-base-content' to='/settings'>
                Settings
              </Link>
            </li>
            <li>
              <a className='text-base-content' onClick={onButtonClick}>
                Logout
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export { Navbar }
