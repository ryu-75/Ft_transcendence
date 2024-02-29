import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import React, { useEffect } from 'react'
import { useForm, UseFormSetError } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { WithNavbar } from '../hoc/WithNavbar'
import { useAuth } from '../providers/AuthProvider'
import { fetchUser, updateUser } from '../utils/userHttpRequests'

export const loader = async () => await fetchUser()
type FormValues = {
  username: string
  image: FileList | null
  twoFaEnabled: boolean
}
const fileValidator = (value: FileList | null, setError: UseFormSetError<FormValues>) => {
  if (!value) return true
  if (value.length == 0) return true
  if (value.length > 1) {
    setError('image', {
      type: 'manual',
      message: 'Only one file can be uploaded',
    })
    return false
  }
  if (value[0].size > 1024 * 1024 * 2) {
    setError('image', {
      type: 'manual',
      message: 'File size must be less than 2MB',
    })
    return false
  }
  if (!value[0].type.startsWith('image')) {
    setError('image', {
      type: 'manual',
      message: 'File must be an image',
    })
    return false
  }
  return true
}

const Settings = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
  } = useForm<FormValues>({
    defaultValues: {
      username: user?.username,
      twoFaEnabled: user?.twoFaEnabled,
    },
    values: {
      username: user?.username ?? '',
      twoFaEnabled: user?.twoFaEnabled ?? false,
      image: null,
    },
  })
  const { mutate, isPending } = useMutation({
    mutationKey: ['user'],
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['user'],
      })
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.status === 409)
          setError('username', {
            type: 'manual',
            message: 'Username already exists',
          })
      }
    },
  })

  const onSubmit = (data: FormValues) => {
    const formData = new FormData()
    formData.append('username', data.username)
    if (data.image && data.image.length > 0) formData.append('image', data.image[0])
    formData.append('twoFaEnabled', data.twoFaEnabled.toString())
    mutate(formData)
  }

  useEffect(() => {
    setValue('username', user?.username ?? '')
    setValue('twoFaEnabled', user?.twoFaEnabled ?? false)
  }, [user, setValue])

  return (
    <div className='mx-auto p-4'>
      <h1 className='text-2xl font-semibold text-center mb-6'>Settings</h1>
      <form
        lang='en'
        onSubmit={handleSubmit(onSubmit)}
        className='grid grid-cols-1 gap-4 max-w-md mx-auto'
      >
        <div className='form-control'>
          <label className='label' htmlFor='username'>
            <span className='label-text'>Username</span>
          </label>
          <input
            type='text'
            id='username'
            placeholder='Enter your username'
            defaultValue={user?.username}
            aria-invalid={errors.username ? 'true' : 'false'}
            {...register('username', {
              required: true,
              maxLength: {
                value: 20,
                message: 'Username must be less than 20 characters',
              },
              minLength: {
                value: 3,
                message: 'Username must be more than 3 characters',
              },
              pattern: {
                value: /^[a-zA-Z0-9]{3,20}$/,
                message: 'Username must only contain alphanumeric characters',
              },
            })}
            className='input input-bordered w-full'
          />
          {errors.username && (
            <span className='label-text-alt text-red-500'>{errors.username.message}</span>
          )}
        </div>

        <div className='form-control'>
          <label className='label' htmlFor='email'>
            <span className='label-text'>Email</span>
          </label>
          <input
            id='email'
            type='text'
            defaultValue={user?.email}
            disabled
            className='input input-bordered w-full'
          />
        </div>

        <div className='form-control'>
          <label className='label' htmlFor='image'>
            <span className='label-text'>Profile image</span>
          </label>
          <input
            type='file'
            id='image'
            className='file-input file-input-bordered file-input-primary w-full'
            {...register('image', {
              validate: (value) => fileValidator(value, setError),
            })}
          />
        </div>

        {user?.twoFaEnabled ? (
          <div className='form-control'>
            <label className='cursor-pointer label' htmlFor='twoFaEnabled'>
              <span className='label-text'>Enable / Disable 2fa</span>
              <input
                id='twoFaEnabled'
                type='checkbox'
                className='toggle toggle-primary'
                {...register('twoFaEnabled')}
              />
            </label>
          </div>
        ) : (
          <Link className='btn btn-outline btn-accent' to='/settings/2fa'>
            Enable 2fa
          </Link>
        )}
        <div className='form-control'>
          <button type='submit' disabled={isPending} className={`btn btn-primary w-full`}>
            <span className={isPending ? 'loading loading-spinner' : ''}></span>
            Save Settings
          </button>
        </div>
      </form>
      {errors && (
        <div className='form-control'>
          <span className='label-text-alt text-red-500'>{errors.image?.message}</span>
        </div>
      )}
    </div>
  )
}
const SettingsWithNavbar = WithNavbar(Settings)
export { Settings, SettingsWithNavbar }
