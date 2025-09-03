'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { GAEvent } from '@lib/utils'
import { GA_EVENTS } from '@lib/constants'

const DARK = 'dark'
const LIGHT = 'light'

type Props = {
  isHeaderPrimary: boolean
}

export const ModeToggle = ({ isHeaderPrimary }: Props) => {
  const [mounted, setMounted] = useState(false)
  const { setTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  const baseClassName = `cursor-pointer rounded-md bg-transparent p-2 transition-colors hover:bg-gray-100 hover:text-slate-900 dark:text-neutral-300 dark:hover:bg-gray-700 dark:hover:text-white ${isHeaderPrimary ? 'text-white' : 'text-slate-700'}`

  const ThemeIcons = () => (
    <>
      <Sun className='dark:hidden' />
      <Moon className='hidden dark:block' />
      <span className='sr-only'>Cambiar tema</span>
    </>
  )

  if (!mounted)
    return (
      <div className={baseClassName}>
        <ThemeIcons />
      </div>
    )

  return (
    <button
      onClick={() => {
        const theme = localStorage.getItem('theme') === DARK ? LIGHT : DARK
        GAEvent({
          category: GA_EVENTS.CHANGE_THEME.CATEGORY,
          label: theme?.toUpperCase() ?? GA_EVENTS.CHANGE_THEME.CATEGORY
        })
        setTheme(theme)
      }}
      className={baseClassName}
      aria-label='Toggle theme'
    >
      <ThemeIcons />
    </button>
  )
}
