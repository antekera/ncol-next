import { isWithinInterval, subDays } from 'date-fns'

export const isPostPublishedWithinDays = (
  date?: string | Date,
  days: number = 7
): boolean => {
  if (!date) return false

  const postDate = new Date(String(date))
  const now = new Date()

  return isWithinInterval(postDate, {
    start: subDays(now, days),
    end: now
  })
}
