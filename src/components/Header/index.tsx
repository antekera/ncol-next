import React from 'react'

export const Header: React.FC = () => (
  <header>
    <div className='wrapper'>
      <nav className='px-6 py-4 bg-white shadow'>
        <div className='container flex flex-col mx-auto md:flex-row md:items-center md:justify-between'>
          <div className='flex items-center justify-between'>
            <div>
              <a
                href='#'
                className='text-xl font-bold text-gray-800 md:text-2xl'
              >
                Brand
              </a>
            </div>
            <div>
              <button
                type='button'
                className='block text-gray-800 hover:text-gray-600 focus:text-gray-600 focus:outline-none md:hidden'
              >
                <svg viewBox='0 0 24 24' className='w-6 h-6 fill-current'>
                  <path d='M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z'></path>
                </svg>
              </button>
            </div>
          </div>
          <div className='flex-col hidden md:flex md:flex-row md:-mx-4'>
            <a
              href='#'
              className='my-1 text-gray-800 hover:text-blue-500 md:mx-4 md:my-0'
            >
              Home
            </a>
            <a
              href='#'
              className='my-1 text-gray-800 hover:text-blue-500 md:mx-4 md:my-0'
            >
              Blog
            </a>
            <a
              href='#'
              className='my-1 text-gray-800 hover:text-blue-500 md:mx-4 md:my-0'
            >
              About us
            </a>
          </div>
        </div>
      </nav>
    </div>
  </header>
)
