import React from 'react'
import { Navigate } from 'react-router-dom'

import { Play } from '../components/Pong/Play'
import { WithNavbar } from '../hoc/WithNavbar'
import { useAuth } from '../providers/AuthProvider'

const Game = () => {
  const { user } = useAuth()

  if (!user) return <Navigate to='/login' replace />

  return (
    <div>
      <Play />
    </div>
  )
}

const PlayWithNavbar = WithNavbar(Game)
export { PlayWithNavbar }
