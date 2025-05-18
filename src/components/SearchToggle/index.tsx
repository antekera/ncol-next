'use client'

import { Search as SearchIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Search } from '@components/Search'

type Props = {
  isHeaderPrimary?: boolean
}

export const SearchToggle = ({ isHeaderPrimary }: Props) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div ref={searchContainerRef} className='sm:relative'>
      <button
        onClick={() => setIsSearchOpen(!isSearchOpen)}
        className={`cursor-pointer rounded-md bg-transparent p-2 transition-colors hover:bg-gray-100 hover:text-slate-900 dark:text-neutral-300 dark:hover:bg-gray-700 dark:hover:text-white ${
          isHeaderPrimary ? 'text-white' : 'text-slate-700'
        }`}
        aria-label='Toggle search'
      >
        <SearchIcon />
        <span className='sr-only'>Buscar</span>
      </button>

      {isSearchOpen && (
        <div className='absolute top-0 right-0 z-50 w-screen px-4 py-3 sm:top-[3px] sm:w-xs sm:p-0'>
          <Search />
        </div>
      )}
    </div>
  )
}
