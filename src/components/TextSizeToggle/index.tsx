'use client'

import { GA_EVENTS } from '@lib/constants'
import { useEffect, useState } from 'react'
import {
  TEXT_SIZE_DEFAULT,
  TEXT_SIZE_STORAGE_KEY,
  type TextSize
} from '@lib/textSize'
import { GAEvent } from '@lib/utils'

const TEXT_SIZE_OPTIONS: Array<{
  label: string
  value: TextSize
  ariaLabel: string
}> = [
  { label: 'A-', value: 'sm', ariaLabel: 'Reducir tamaño de letra' },
  { label: 'A', value: 'md', ariaLabel: 'Tamaño de letra normal' },
  { label: 'A+', value: 'lg', ariaLabel: 'Aumentar tamaño de letra' }
]

export const applyTextSizePreference = (value: TextSize) => {
  if (typeof document === 'undefined') return

  document.documentElement.dataset.fontSize = value
}

const getTextSizeEventLabel = (value: TextSize) => {
  switch (value) {
    case 'sm':
      return GA_EVENTS.CHANGE_TEXT_SIZE.SMALL
    case 'lg':
      return GA_EVENTS.CHANGE_TEXT_SIZE.LARGE
    case 'md':
    default:
      return GA_EVENTS.CHANGE_TEXT_SIZE.MEDIUM
  }
}

export const TextSizeToggle = () => {
  const [mounted, setMounted] = useState(false)
  const [textSize, setTextSize] = useState<TextSize>(TEXT_SIZE_DEFAULT)

  useEffect(() => {
    const stored =
      (localStorage.getItem(TEXT_SIZE_STORAGE_KEY) as TextSize | null) ??
      TEXT_SIZE_DEFAULT

    setTextSize(stored)
    applyTextSizePreference(stored)
    setMounted(true)
  }, [])

  const handleChange = (value: TextSize) => {
    setTextSize(value)
    localStorage.setItem(TEXT_SIZE_STORAGE_KEY, value)
    applyTextSizePreference(value)
    GAEvent({
      category: GA_EVENTS.CHANGE_TEXT_SIZE.CATEGORY,
      label: getTextSizeEventLabel(value)
    })
  }

  return (
    <div
      className='flex items-center gap-1'
      role='group'
      aria-label='Ajustar tamaño de letra'
    >
      {TEXT_SIZE_OPTIONS.map(option => {
        const currentValue = mounted ? textSize : TEXT_SIZE_DEFAULT
        const isActive = currentValue === option.value

        return (
          <button
            key={option.value}
            type='button'
            aria-label={option.ariaLabel}
            aria-pressed={isActive}
            className={`flex h-9 min-w-9 items-center justify-center rounded-full px-2 font-sans text-xs font-semibold transition-colors ${
              isActive
                ? 'bg-primary text-white'
                : 'text-slate-600 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-neutral-700'
            }`}
            onClick={() => handleChange(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
