import { PostHome } from '@lib/types'
import { isWithinInterval, subDays } from 'date-fns'

export const isPostPublishedWithinLastDay = (cover?: PostHome): boolean => {
  if (!cover?.date) return false

  const coverDate = new Date(String(cover.date))
  const now = new Date()

  return isWithinInterval(coverDate, {
    start: subDays(now, 1),
    end: now
  })
}
