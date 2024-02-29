import './../styles/home.css'

import React from 'react'
import { Link } from 'react-router-dom'

import logo1 from '../assets/1.png'
import logo2 from '../assets/2.png'
import { MatchHistory } from '../components/MatchHistory'
import WordFlick from '../components/Pong/PongRuleFlick'
import { WithNavbar } from '../hoc/WithNavbar'
import { useAuth } from '../providers/AuthProvider'

const Home = () => {
  const { user } = useAuth()
  return (
    <div className='w-screen bg-gray-900'>
      <h1 className='text-center text-4xl uppercase welcome md:text-7xl'>FT_TRANSCENDENCE</h1>
      <div className='pongRule'>
        <WordFlick />
      </div>
      <div className='flex flex-col items-center justify-center'>
        <div className='flex items-center ml-8 sm:ml-0'>
          <img className='one' src={logo1} alt='logo' />
          <Link to='/play'>
            <button
              data-modal-target='static-modal'
              data-modal-toggle='static-modal'
              className='relative inline-flex items-center justify-center mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800'
            >
              <span className='relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0'>
                START GAME
              </span>
            </button>
          </Link>
          <img className='two' src={logo2} alt='paddle2' />
        </div>
        {user ? <MatchHistory user={user} /> : <></>}
      </div>
    </div>
  )
}

const HomeWithNavbar = WithNavbar(Home)

export { HomeWithNavbar }
