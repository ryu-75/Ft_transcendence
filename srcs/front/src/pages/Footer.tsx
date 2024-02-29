import './../styles/footer.css'

import React from 'react'

const Footer = () => {
  return (
    <footer className='footer bg-white footer-center fixed bottom-0 invisible md:visible'>
      <div className='container mx-auto'>
        <div className='mt-16 border-t-2 border-gray-300 flex flex-col items-center'>
          <div className='sm:w-2/3 text-center'>
            <p className='text-sm text-blue-700 font-bold pb-6'>
              Transcendence © 2023 by 42Students
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export { Footer }
