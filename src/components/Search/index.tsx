'use client'

import { Search as SearchIcon } from 'lucide-react'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import ContextStateData from '@lib/context/StateContext'

const Search = () => {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const { isMenuActive, handleSetContext } = ContextStateData()

  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (searchTerm.trim()) {
      const encodedSearchTerm = encodeURIComponent(searchTerm.trim())
      router.push(`/busqueda?q=${encodedSearchTerm}`)
      if (isMenuActive) {
        handleSetContext({
          isMenuActive: false
        })
      }
    }
  }

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <form onSubmit={handleSubmit} className='flex w-full font-sans'>
      <input
        ref={inputRef}
        type='text'
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder='Buscar...'
        className='focus:border-primary focus:ring-primary w-full rounded-l-md border border-gray-300 bg-white px-2 py-1 text-slate-700 focus:ring-1 focus:outline-none dark:border-neutral-600 dark:text-neutral-300'
        aria-label='Campo de búsqueda'
      />
      <button
        type='submit'
        className='bg-primary hover:bg-primary/90 focus:ring-primary rounded-r-md px-2 py-1 text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none'
        aria-label='Buscar'
      >
        <SearchIcon />
      </button>
    </form>
  )
}

export { Search }
