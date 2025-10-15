'use client'

import { Search as SearchIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Search } from '@components/Search'
import { cn } from '@lib/shared'

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
    <div ref={searchContainerRef} className='search-toggle-wrapper'>
      <button
        onClick={() => setIsSearchOpen(!isSearchOpen)}
        className={cn('search-toggle-button', {
          'search-toggle-button-primary': isHeaderPrimary,
          'search-toggle-button-secondary': !isHeaderPrimary
        })}
        aria-label='Toggle search'
      >
        <SearchIcon />
        <span className='sr-only'>Buscar</span>
      </button>

      {isSearchOpen && (
        <div className='search-toggle-content'>
          <Search />
        </div>
      )}
    </div>
  )
}