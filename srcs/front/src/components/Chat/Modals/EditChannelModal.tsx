import { Dialog, Transition } from '@headlessui/react'
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import clsx from 'clsx'
import React, { Fragment, useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { ChatQueryKey } from '../../../providers/ChatProvider'
import { EChannelType, IChannel } from '../../../types/Chat'
import { editChannel } from '../../../utils/chatHttpRequests'

type EditChannelModalProps = {
  isEditChannelModalOpen: {
    isOpen: boolean
    channel?: IChannel
  }
  setEditChannelModalOpen: React.Dispatch<
    React.SetStateAction<{
      isOpen: boolean
      channel?: IChannel
    }>
  >
}

type FormValues = {
  name: string
  type: EChannelType
  password: string
}

const EditChannelModal = ({
  isEditChannelModalOpen,
  setEditChannelModalOpen,
}: EditChannelModalProps) => {
  const { channel, isOpen } = isEditChannelModalOpen
  const {
    watch,
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
    unregister,
  } = useForm<FormValues>({
    defaultValues: {
      type: channel?.type,
      name: channel?.name,
    },
  })

  const { mutate, isPending } = useMutation({
    mutationKey: [ChatQueryKey.MY_CHANNELS],
    mutationFn: editChannel,
    onSuccess: () => {
      reset()
      setEditChannelModalOpen((prev) => ({
        ...prev,
        isOpen: false,
      }))
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 409)
          setError('name', {
            message: 'Channel name already exists',
          })
        else if (error.response?.status === 400) {
          error.response.data.message.some((msg: string) => {
            msg.includes('password') &&
              setError('password', {
                message: 'Password must be between 3 and 10 characters',
              })
          })
          error.response.data.message.some((msg: string) => {
            msg.includes('name') &&
              setError('name', {
                message: 'Channel name must be between 3 and 10 characters',
              })
          })
        }
      }
    },
  })

  const onSubmit = async (data: FormValues) => {
    if (!channel) return
    mutate({
      id: channel.id,
      ...data,
    })
  }

  const type = watch('type')
  useEffect(() => {
    type !== 'protected' && unregister('password')
  }, [type])

  const buttonStyle = clsx({
    ['btn']: true,
    ['btn-disabled']: isPending,
  })

  const onClose = (e: any) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      reset()
      setEditChannelModalOpen((prev) => ({
        ...prev,
        isOpen: false,
      }))
    } else {
      reset()
      setEditChannelModalOpen((prev) => ({
        ...prev,
        isOpen: false,
      }))
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as='div' className='relative z-10' onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black/25' />
        </Transition.Child>

        <div className='fixed inset-0 overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4 text-center'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <Dialog.Panel className='modal-box'>
                <Dialog.Title as='h3' className='font-bold text-lg'>
                  Modify channel
                </Dialog.Title>
                <div className='modal-action'>
                  <div className='grid grid-cols-1 gap-4 max-w-md mx-auto'>
                    <form method='dialog' onSubmit={handleSubmit(onSubmit)}>
                      <div className='form-control'>
                        <label className='label' htmlFor='channel_name'>
                          <span className='label-text'>Channel name</span>
                        </label>
                        <input
                          type='text'
                          id='channel_name'
                          placeholder='Enter the channel name'
                          autoComplete='off'
                          aria-invalid={errors.name ? 'true' : 'false'}
                          {...register('name', {
                            required: true,
                            value: channel?.name,
                            maxLength: {
                              value: 10,
                              message: 'Channel name must be less than 10 characters',
                            },
                            minLength: {
                              value: 3,
                              message: 'Channel name must be more than 3 characters',
                            },
                            pattern: {
                              value: /^[a-zA-Z0-9]{3,10}$/,
                              message: 'Channel name must only contain alphanumeric characters',
                            },
                          })}
                          className='input input-bordered w-full'
                        />
                        {errors.name && (
                          <span className='label-text-alt text-red-500'>{errors.name.message}</span>
                        )}
                      </div>
                      <div className='form-control'>
                        <label className='label' htmlFor='username'>
                          <span className='label-text'>Channel type</span>
                        </label>
                        <select
                          {...register('type')}
                          className='select select-bordered w-full max-w-xs'
                        >
                          <option value={'public'}>Public</option>
                          <option value={'private'}>Private</option>
                          <option value={'protected'}>Protected</option>
                        </select>
                      </div>
                      {type === 'protected' && (
                        <div className='form-control'>
                          <label className='label' htmlFor='password'>
                            <span className='label-text'>Password</span>
                          </label>
                          <input
                            type='password'
                            id='password'
                            placeholder='Enter the password'
                            autoComplete='off'
                            {...register('password', {
                              minLength: {
                                value: 3,
                                message: 'Password must be at least 3 characters',
                              },
                              maxLength: {
                                value: 10,
                                message: 'Password must be less than 10 characters',
                              },
                              pattern: {
                                value: /^[a-zA-Z0-9]{3,10}$/,
                                message: 'Password must only contain alphanumeric characters',
                              },
                            })}
                            className='input input-bordered w-full'
                          ></input>
                          {errors.password && (
                            <span className='label-text-alt text-red-500'>
                              {errors.password?.message}
                            </span>
                          )}
                        </div>
                      )}
                      <div className='flex justify-evenly mt-4'>
                        <button type='submit' className={`${buttonStyle} btn-success`}>
                          Modify
                        </button>
                        <button onClick={onClose} className={`${buttonStyle} btn-error`}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export { EditChannelModal }
