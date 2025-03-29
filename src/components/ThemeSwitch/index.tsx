'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

const DARK = 'dark'
const LIGHT = 'light'

export const ModeToggle = () => {
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
      className='cursor-pointer rounded-md bg-transparent p-2 text-slate-700 transition-colors hover:bg-gray-100 hover:text-slate-900 dark:text-neutral-300 dark:hover:bg-gray-700 dark:hover:text-white'
      aria-label='Toggle theme'
    >
      <Sun className='dark:hidden' />
      <Moon className='hidden dark:block' />
      <span className='sr-only'>Cambiar tema</span>
    </button>
  )
}
