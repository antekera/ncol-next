'use client'

import { parseISO, format } from 'date-fns'
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
      <time>{format(date, " dd 'de' MMMM 'de' yyyy", { locale: es })}</time>
    )

  return (
    <time>
      <span className='capitalize'>
        {format(date, "MMMM dd',' yyyy", { locale: es })}
      </span>
      <span>{format(date, " '•' hh':'mm aaaa")}</span>
    </time>
  )
}

export { DateTime }
