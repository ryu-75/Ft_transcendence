import { Dialog, Transition } from '@headlessui/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import React, { Fragment, useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { ChatQueryKey } from '../../../providers/ChatProvider'
import { IChannel } from '../../../types/Chat'
import { IUser } from '../../../types/User'
import { getUsersNotInChannel, inviteUser } from '../../../utils/chatHttpRequests'

type InviteChannelModalProps = {
  isInviteModalOpen: {
    isOpen: boolean
    channel?: IChannel
  }
  setInviteModalOpen: React.Dispatch<
    React.SetStateAction<{
      isOpen: boolean
      channel?: IChannel
    }>
  >
}

type FormValues = {
  channelId: string
  userId: number
}

const InviteChannelModal = ({ isInviteModalOpen, setInviteModalOpen }: InviteChannelModalProps) => {
  const { channel, isOpen } = isInviteModalOpen
  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      channelId: channel?.id,
    },
  })

  useEffect(() => {
    if (!isOpen) return
    userListQuery.refetch()
  }, [isOpen])

  const userListQuery = useQuery({
    queryKey: [ChatQueryKey.USER_LIST, channel?.id ?? ''],
    queryFn: ({ queryKey }) => getUsersNotInChannel({ channelId: queryKey[1] }),
    initialData: [],
    enabled: channel !== undefined,
  })

  const { mutate } = useMutation({
    mutationFn: inviteUser,
    onSuccess: () =>
      setInviteModalOpen((prev) => ({
        ...prev,
        isOpen: false,
      })),
  })

  const onSubmit = (data: FormValues) =>
    mutate({
      channelId: channel?.id ?? '',
      userId: data.userId,
    })

  const buttonStyle = clsx({
    ['btn']: true,
    ['btn-disabled']: userListQuery.isPending,
  })

  const getOptions = (users: IUser[]) => {
    return (
      <>
        <option value='' disabled>
          Select an user
        </option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.username}
          </option>
        ))}
      </>
    )
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as='div'
        className='relative z-10'
        onClose={() =>
          setInviteModalOpen((prev) => ({
            ...prev,
            isOpen: false,
          }))
        }
      >
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
                  Invite user
                </Dialog.Title>
                <div className='modal-action'>
                  <div className='grid grid-cols-1 gap-4 max-w-md mx-auto'>
                    <form method='dialog' onSubmit={handleSubmit(onSubmit)}>
                      <div className='form-control'>
                        <label className='label' htmlFor='name'>
                          <span className='label-text'>User list</span>
                        </label>
                        <select
                          id='userId'
                          {...register('userId', { required: true })}
                          className='select select-bordered w-full max-w-xs'
                        >
                          {userListQuery.isPending && (
                            <option value='' disabled>
                              Loading...
                            </option>
                          )}
                          {userListQuery.data?.length === 0 && (
                            <option value='' disabled>
                              No available users
                            </option>
                          )}
                          {userListQuery.data?.length &&
                            userListQuery.data.length > 0 &&
                            getOptions(userListQuery.data)}
                        </select>
                      </div>
                      <div className='flex justify-evenly mt-4'>
                        <button type='submit' className={`${buttonStyle} btn-success`}>
                          Invite
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            setInviteModalOpen((prev) => ({
                              ...prev,
                              isOpen: false,
                            }))
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

export { InviteChannelModal }
