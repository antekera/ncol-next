import { parseISO, format } from 'date-fns'
import { es } from 'date-fns/locale'
const today: Date = new Date()

type DateProps = {
  dateString?: string
}

const DateTime = ({ dateString }: DateProps) => {
  const date = dateString ? parseISO(dateString) : today
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
export type { DateProps }
