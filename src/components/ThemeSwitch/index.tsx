'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { GAEvent } from '@lib/utils'
import { getThemeSwitchClassName } from '@components/Header/styles'
import { GA_EVENTS } from '@lib/constants'

const DARK = 'dark'
const LIGHT = 'light'

type Props = {
  isHeaderPrimary?: boolean
  className?: string
  ariaLabel?: string
}

export const ModeToggle = ({
  isHeaderPrimary = false,
  className,
  ariaLabel = 'Toggle theme'
}: Props) => {
  const [mounted, setMounted] = useState(false)
  const { setTheme } = useTheme()

  const baseClassName =
    className ?? getThemeSwitchClassName({ isHeaderPrimary })

  useEffect(() => setMounted(true), [])

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
          label:
            theme === DARK
              ? GA_EVENTS.CHANGE_THEME.TO_DARK
              : GA_EVENTS.CHANGE_THEME.TO_LIGHT
        })
        setTheme(theme)
      }}
      className={baseClassName}
      aria-label={ariaLabel}
    >
      <ThemeIcons />
    </button>
  )
}
