import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { WithNavbar } from '../../hoc/WithNavbar'
import { generateTwoFactorAuth, twoFactorAuthEnable } from '../../utils/authHttpRequests'

type FormValues = {
  code: string
}

const TwoFactorSettings = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [qrCode, setQrCode] = React.useState<string>('')
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>()

  const generateTwoFaMutation = useMutation({
    mutationFn: async () => generateTwoFactorAuth(),
    onSuccess: (qrCode) => {
      setQrCode(qrCode)
    },
    onError: () => {
      setError('code', { message: 'Invalid code' })
    },
  })

  const enableTwoFaMutation = useMutation({
    mutationFn: async (data: FormValues) => twoFactorAuthEnable(data.code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response?.status === 401) {
        setError('code', { message: 'Authentication failed. Check your code.' })
      } else {
        setError('code', { message: 'An unexpected error occurred.' })
      }
    },
  })

  const onSubmit = async (data: FormValues) => {
    try {
      await enableTwoFaMutation.mutateAsync(data, {
        onSuccess: () => {
          navigate('/settings')
        },
      })
    } catch (e) {}
  }

  useEffect(() => {
    generateTwoFaMutation.mutate()
  }, [])

  return (
    <div className='mx-auto p-4'>
      <h1 className='text-2xl font-semibold text-center mb-6'>Two authentication factor</h1>
      <div className='flex flex-col justify-center items-center'>
        {qrCode && (
          <div>
            <img src={qrCode} alt='2fa QR code' />
            <form
              onSubmit={handleSubmit(onSubmit)}
              className='grid grid-cols-1 gap-4 max-w-md mx-auto'
            >
              <div className='form-control w-full'>
                <label className='label'>
                  <span className='label-text-alt'>Two factor code</span>
                </label>
                <input
                  type='text'
                  placeholder='Enter your code'
                  max={6}
                  min={6}
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
              </div>
              <button className='btn btn-primary w-full' type='submit'>
                Enable
              </button>
            </form>
            {errors.code && <span className='text-xs text-red-500'>{errors.code.message}</span>}
          </div>
        )}
      </div>
    </div>
  )
}

const TwoFactorSettingsWithNavbar = WithNavbar(TwoFactorSettings)

export { TwoFactorSettings, TwoFactorSettingsWithNavbar }
