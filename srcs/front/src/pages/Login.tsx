import React, { useState } from 'react'
import { Si42 } from 'react-icons/si'
import { Navigate } from 'react-router-dom'

import { useAuth } from '../providers/AuthProvider'

const Login = () => {
  const { user, signin } = useAuth()
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to='/' />

  const login42Click = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    setLoading(true)
    window.open(process.env['REACT_APP_42_URL'] ?? 'http://localhost:3000/api/auth/42', '_self')
  }

  return (
    <div className='hero h-screen'>
      <div className='hero-content text-center'>
        <div className='max-w-md'>
          <h1 className='text-5xl font-bold'>ft_transcendence</h1>
          <div className='grid'>
            <button
              onClick={login42Click}
              className='btn btn-lg btn-primary mt-10'
              disabled={loading}
            >
              <span className={loading ? 'loading loading-spinner' : ''}></span>
              Login with <Si42 style={{ fontSize: '2em' }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
