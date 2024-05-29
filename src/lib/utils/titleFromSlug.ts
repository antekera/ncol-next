import { capitalCase } from 'change-case-all'

import { MERGED_MENU } from '@lib/constants'
import { removeAccents } from '@lib/utils'

const merged = MERGED_MENU

export const titleFromSlug = (slug: string): string => {
  const capitalSlug = capitalCase(slug)
  for (const entry of merged) {
    if (capitalSlug === removeAccents(entry)) {
      return entry
    }
  }

  return capitalSlug
}
