import { parseISO, format } from 'date-fns'
import { es } from 'date-fns/locale'

import { usePageStore } from '@lib/hooks/store'

type DateProps = {
  dateString?: string
  formal?: boolean
}

const DateTime = ({ dateString, formal }: DateProps) => {
  const { today } = usePageStore()
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
