import { Dialog, Transition } from '@headlessui/react'
import { useMutation } from '@tanstack/react-query'
import clsx from 'clsx'
import React, { Fragment } from 'react'
import { useForm } from 'react-hook-form'

import { userAction } from '../../../utils/chatHttpRequests'

type UserActionModalProps = {
  isModalOpen: boolean
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  channelId: string
  userId: number
}

type FormValues = {
  action: string
}

const UserActionModal = ({
  isModalOpen: isOpen,
  setModalOpen: setIsOpen,
  channelId,
  userId,
}: UserActionModalProps) => {
  const { register, handleSubmit } = useForm<FormValues>({})

  const { mutate, isPending } = useMutation({
    mutationKey: [channelId],
    mutationFn: userAction,
  })

  const onSubmit = (data: FormValues) => {
    mutate({ channelId, userId, action: data.action })
    setIsOpen(false)
  }

  const buttonStyle = clsx({
    btn: true,
    'btn-loading': isPending,
  })

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
                  Select an action for this user
                </Dialog.Title>
                <div className='modal-action'>
                  <div className='grid grid-cols-1 gap-4 max-w-md mx-auto'>
                    <form method='dialog' onSubmit={handleSubmit(onSubmit)}>
                      <div className='form-control'>
                        <label className='label' htmlFor='action'>
                          <span className='label-text'>Action</span>
                        </label>
                        <select
                          id='action'
                          {...register('action', { required: true })}
                          className='select select-bordered w-full max-w-xs'
                        >
                          <option value=''>Select an action</option>
                          <option value='kick'>Kick</option>
                          <option value='admin'>Admin</option>
                          <option value='ban'>Ban</option>
                          <option value='mute'>Mute 5min</option>
                        </select>
                      </div>
                      <div className='flex justify-evenly mt-4'>
                        <button type='submit' className={`${buttonStyle} btn-success`}>
                          Ok
                        </button>
                        <button
                          onClick={() => setIsOpen(false)}
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

export { UserActionModal }
