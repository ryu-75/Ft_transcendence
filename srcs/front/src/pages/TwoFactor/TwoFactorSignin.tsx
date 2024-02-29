import React from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, redirect } from 'react-router-dom'

import { useAuth } from '../../providers/AuthProvider'
import { twoFactorAuth } from '../../utils/authHttpRequests'

type FormValues = {
  code: string
}

const TwoFactorSignin = () => {
  const { user, signin } = useAuth()

  if (user) return <Navigate to='/' />

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>()

  const onSubmit = async (formData: FormValues) => {
    try {
      await twoFactorAuth(formData.code)
      await signin()
      redirect('/')
    } catch (e) {
      setError('code', { message: 'Invalid code' })
    }
  }

  return (
    <div className='flex flex-col justify-center items-center h-screen'>
      <div className='p-6 rounded-lg shadow-lg bg-white max-w-sm'>
        <h2 className='text-center text-2xl font-semibold mb-6'>Two-Factor Authentication</h2>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='form-control'>
            <label className='label'>
              <span className='label-text'>Enter your 2FA code</span>
            </label>
            <input
              type='text'
              placeholder='2FA code'
              autoComplete='off'
              maxLength={6}
              {...register('code', {
                required: {
                  value: true,
                  message: 'Code is required',
                },
                pattern: {
                  value: /^[0-9]{6}$/,
                  message: 'Code must be 6 digits',
                },
              })}
              className='input input-bordered w-full'
            />
            {errors.code && <span className='text-xs text-red-500'>{errors.code.message}</span>}
          </div>
          <button className='btn btn-secondary w-full' type='submit'>
            Verify Code
          </button>
        </form>
      </div>
    </div>
  )
}

export { TwoFactorSignin }
