import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import React, { createContext, ReactNode, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { IUser } from '../types/User'
import { chatSocket, disconnectAll, gameSocket, notificationSocket } from '../utils/socketService'
import { fetchUser, logout } from '../utils/userHttpRequests'

interface AuthContextData {
  user: IUser | null
  isLoading: boolean
  signin: () => Promise<void>
  signout: () => Promise<void>
}

const AuthContext = createContext<AuthContextData>({
  user: null,
  isLoading: false,
  signin: async () => Promise.resolve(),
  signout: async () => Promise.resolve(),
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    data: user = null,
    isLoading,
    isError,
    error,
  } = useQuery<IUser>({
    queryKey: ['user'],
    queryFn: fetchUser,
    retry: false,
  })

  const signinMutation = useMutation({
    mutationFn: fetchUser,
    onSuccess: (user) => {
      queryClient.setQueryData(['user'], user)
      navigate('/', { replace: true })
    },
    onError: (error: unknown) => {
      if (
        error instanceof AxiosError &&
        error.response?.status === 401 &&
        error.response.data.code === '2FA_REQUIRED'
      ) {
        navigate('/login/2fa', { replace: true })
      } else {
        navigate('/login', { replace: true })
      }
    },
  })

  const signoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(['user'], null)
      navigate('/login', { replace: true })
      // disconnectAll()
    },
  })

  const signin = async () => signinMutation.mutate()
  const signout = async () => signoutMutation.mutate()

  useEffect(() => {
    if (isError) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        if (error.response.data.code === '2FA_REQUIRED') {
          return navigate('/login/2fa', { replace: true })
        }
        return navigate('/login', { replace: true })
      }
    }
  }, [user, navigate, isError])

  return (
    <AuthContext.Provider value={{ user, signin, signout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
