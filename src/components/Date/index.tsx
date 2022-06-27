import { parseISO, format } from 'date-fns'
import { es } from 'date-fns/locale'
const today: Date = new Date()

type DateProps = {
  dateString?: string
}

const DateTime = ({ dateString }: DateProps) => {
  const date = dateString ? parseISO(dateString) : today
  return <time>{format(date, " dd 'de' MMMM 'de' yyyy", { locale: es })}</time>
}

export { DateTime }
export type { DateProps }
