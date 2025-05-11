import { capitalCase } from 'change-case-all'
import { MERGED_MENU } from '@lib/constants'
import { removeAccents } from '@lib/utils'

export const titleFromSlug = (slug: string): string => {
  const capitalSlug = capitalCase(slug)

  for (const entry of MERGED_MENU) {
    if (
      removeAccents(capitalSlug).toLowerCase() ===
      removeAccents(entry.name).toLowerCase()
    ) {
      return entry.name
    }
  }

  const accentMap: { [key: string]: string } = {
    Musica: 'Música',
    Tecnologia: 'Tecnología',
    Farandula: 'Farándula',
    Simon: 'Simón'
  }

  const words = capitalSlug.split(' ')
  const transformedWords = words.map(word => accentMap[word] ?? word)
  return transformedWords.join(' ')
}
