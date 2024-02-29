import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { Loading } from '../pages/Loading'
import { useAuth } from '../providers/AuthProvider'

export const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <Loading />
  if (!user) return <Navigate to='/login' state={{ from: location }} replace />

  return children
}
