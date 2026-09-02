'use client'

import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import ContextStateData from '@lib/context/StateContext'

type DateProps = {
  dateString?: string
  formal?: boolean
}

const DateTime = ({ dateString, formal }: DateProps) => {
  const { today } = ContextStateData()
  const date = dateString ? parseISO(dateString) : today

  if (!date) return null

  if (formal)
    return (
      <time suppressHydrationWarning>
        {format(date, " dd 'de' MMMM 'de' yyyy", { locale: es })}
      </time>
    )

  return (
    <time className='capitalize' suppressHydrationWarning>
      <span className='md:hidden' suppressHydrationWarning>
        {format(date, "MMM dd',' yyyy", { locale: es })}
      </span>
      <span className='hidden md:inline' suppressHydrationWarning>
        {format(date, "MMMM dd',' yyyy", { locale: es })}
      </span>
    </time>
  )
}

export { DateTime }
