'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

const DARK = 'dark'
const LIGHT = 'light'

type Props = {
  isHeaderPrimary: boolean
}

export const ModeToggle = ({ isHeaderPrimary }: Props) => {
  const [mounted, setMounted] = useState(false)
  const { setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const theme = localStorage.getItem('theme')

  return (
    <button
      onClick={() => {
        setTheme(theme === DARK ? LIGHT : DARK)
      }}
      className={`cursor-pointer rounded-md bg-transparent p-2 transition-colors hover:bg-gray-100 hover:text-slate-900 dark:text-neutral-300 dark:hover:bg-gray-700 dark:hover:text-white ${isHeaderPrimary ? 'text-white' : 'text-slate-700'}`}
      aria-label='Toggle theme'
    >
      <Sun className='dark:hidden' />
      <Moon className='hidden dark:block' />
      <span className='sr-only'>Cambiar tema</span>
    </button>
  )
}
