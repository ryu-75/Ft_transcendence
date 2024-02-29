import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

import { Modal } from './components/Pong/Modal'
import { GameWithNavbar } from './components/Pong/Pong'
import { RequireAuth } from './components/RequireAuth'
import { NotFound } from './pages/404'
import { ChatWithNavbar } from './pages/Chat'
import { FriendsWithNavbar } from './pages/Friends'
import { HomeWithNavbar } from './pages/Home'
import Login from './pages/Login'
import { PlayWithNavbar } from './pages/Pong'
import { ProfileWithNavbar } from './pages/Profile'
import { SettingsWithNavbar } from './pages/Settings'
import { TwoFactorSettingsWithNavbar } from './pages/TwoFactor/TwoFactorSettings'
import { TwoFactorSignin } from './pages/TwoFactor/TwoFactorSignin'
import { AuthProvider } from './providers/AuthProvider'
import { ChatProvider } from './providers/ChatProvider'
import { NotificationProvider } from './providers/NotificationProvider'
import { SocketProvider } from './providers/SocketProvider'

const App = () => {
  const queryClient = new QueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <ChatProvider>
              <ToastContainer />
              <Modal />
              <Routes>
                {/* authenticated */}
                <Route
                  path='/'
                  element={
                    <RequireAuth>
                      <HomeWithNavbar />
                    </RequireAuth>
                  }
                />
                <Route
                  path='/play'
                  element={
                    <RequireAuth>
                      <PlayWithNavbar />
                    </RequireAuth>
                  }
                />
                <Route
                  path='/game/:id'
                  element={
                    <RequireAuth>
                      <GameWithNavbar />
                    </RequireAuth>
                  }
                ></Route>
                <Route
                  path='/settings'
                  element={
                    <RequireAuth>
                      <SettingsWithNavbar />
                    </RequireAuth>
                  }
                />
                <Route
                  path='/settings/2fa'
                  element={
                    <RequireAuth>
                      <TwoFactorSettingsWithNavbar />
                    </RequireAuth>
                  }
                />
                <Route
                  path='/chat/:channelId?'
                  element={
                    <RequireAuth>
                      <ChatWithNavbar />
                    </RequireAuth>
                  }
                />
                <Route
                  path='/profile/:id'
                  element={
                    <RequireAuth>
                      <ProfileWithNavbar />
                    </RequireAuth>
                  }
                />
                <Route
                  path='/friends'
                  element={
                    <RequireAuth>
                      <FriendsWithNavbar />
                    </RequireAuth>
                  }
                />
                {/* non authenticated */}
                <Route path='/login' element={<Login />} />
                <Route path='/login/2fa' element={<TwoFactorSignin />} />
                <Route path='*' element={<NotFound />} />
              </Routes>
              {/* <Footer /> */}
            </ChatProvider>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
      {/* <ReactQueryDevtools initialIsOpen={true} /> */}
    </QueryClientProvider>
  )
}

export default App
