import { Dialog, Transition } from '@headlessui/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import clsx from 'clsx'
import React, { Fragment, useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { ChatQueryKey } from '../../../providers/ChatProvider'
import { IChannel } from '../../../types/Chat'
import { getNotJoinedVisibleChannels, joinChannel } from '../../../utils/chatHttpRequests'

type CreateChannelModalProps = {
  isJoinModalOpen: boolean
  setJoinModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}

type FormValues = {
  id: string
  password: string
}

const JoinChannelModal = ({
  isJoinModalOpen: isOpen,
  setJoinModalOpen: setIsOpen,
}: CreateChannelModalProps) => {
  const notJoinedChannels = useQuery({
    queryKey: [ChatQueryKey.CHANNEL_NOT_JOINED],
    queryFn: getNotJoinedVisibleChannels,
  })
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
    setError,
  } = useForm<FormValues>({})

  useEffect(() => {
    if (!isOpen) return
    notJoinedChannels.refetch()
    reset()
  }, [isOpen])

  const joinChan = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) => joinChannel(id, password),
    onSuccess: async () => setIsOpen(false),
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status && error.response?.status >= 400) {
          const msg: string = error.response.data.message
          if (typeof msg === 'string') {
            setError('password', {
              message: msg,
            })
          }
        }
      }
    },
  })

  const selectedChannelId = watch('id')
  const selectedChannel = notJoinedChannels.data?.find(
    (channel) => channel.id === selectedChannelId,
  )
  const buttonStyle = clsx({
    ['btn']: true,
    ['btn-disabled']: notJoinedChannels.isPending,
  })

  const onSubmit = (data: FormValues) => {
    joinChan.mutate(data)
  }

  const getOptions = (channels: IChannel[]) => {
    return (
      <>
        <option value='' disabled>
          Select a channel
        </option>
        {channels.map((channel) => (
          <option key={channel.id} value={channel.id}>
            {channel.name}
          </option>
        ))}
      </>
    )
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as='div' className='relative z-10' onClose={() => setIsOpen(false)}>
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
                  Join a channel
                </Dialog.Title>
                <div className='modal-action'>
                  <div className='grid grid-cols-1 gap-4 max-w-md mx-auto'>
                    <form method='dialog' onSubmit={handleSubmit(onSubmit)}>
                      <div className='form-control'>
                        <label className='label' htmlFor='name'>
                          <span className='label-text'>Channel name</span>
                        </label>
                        <select
                          id='id'
                          {...register('id', { required: true, value: '' })}
                          className='select select-bordered w-full max-w-xs'
                        >
                          {notJoinedChannels.isPending && (
                            <option value='' disabled>
                              Loading...
                            </option>
                          )}
                          {notJoinedChannels.data?.length === 0 && (
                            <option value='' disabled>
                              No available channels
                            </option>
                          )}
                          {notJoinedChannels.data?.length &&
                            notJoinedChannels.data.length > 0 &&
                            getOptions(notJoinedChannels.data)}
                        </select>
                      </div>
                      {selectedChannel?.type === 'protected' && (
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
                          Join
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            setIsOpen(false)
                          }}
                          className={`${buttonStyle} btn-error`}
                        >
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

export { JoinChannelModal }
