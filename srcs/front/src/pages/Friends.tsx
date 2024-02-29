import React from 'react'
import { Link, Navigate } from 'react-router-dom'

import { useDeleteFriends, useGetFriends } from '../components/hook/Friends.hook'
import { WithNavbar } from '../hoc/WithNavbar'
import { useAuth } from '../providers/AuthProvider'

const Friends = () => {
  const { user } = useAuth()
  const { data: friends, isSuccess: friendsSuccess } = useGetFriends()
  const { mutate: deleteFriend } = useDeleteFriends()

  if (!user) return <Navigate to='/login' state={{ from: location }} replace />
  return (
    <div className='container mx-auto'>
      <h1 className='text-lg text-center'>Friends</h1>
      <div className='overflow-x-auto'>
        <table className='table'>
          {/* head */}
          <thead>
            <tr>
              <th>id</th>
              <th>Username</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {friendsSuccess &&
              friends
                .filter((friend) => friend.confirmed)
                .map(({ friend, friendOf }, i) => {
                  const f = friend.id === user.id ? friendOf : friend
                  return (
                    <tr key={i}>
                      <td>{f.id}</td>
                      <td>
                        <Link to={`/profile/${f.id}`}>
                          <div className='flex items-center gap-3'>
                            <div className='avatar'>
                              <div className='mask mask-squircle w-12 h-12'>
                                <img src={f.image} alt={f.username} />
                              </div>
                            </div>
                            <div>
                              <div className='font-bold'>{f.username}</div>
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            deleteFriend(f.id)
                          }}
                          className='btn btn-ghost btn-xs'
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  )
                })}
          </tbody>
          {/* foot */}
        </table>
      </div>
      <div className='grid'></div>
    </div>
  )
}

const FriendsWithNavbar = WithNavbar(Friends)
export { Friends, FriendsWithNavbar }
