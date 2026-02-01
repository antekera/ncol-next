export const getMainWordFromSlug = (phrase: string | undefined) => {
  if (!phrase) return ''
  const words = phrase.split('-').filter(word => word.length > 3)
  if (words.length === 0) return phrase || ''

  // Sort by length descending and take the top 2 words for a more combined search
  const sortedSearchTerms = [...words]
    .sort((a, b) => b.length - a.length)
    .slice(0, 2)
  return sortedSearchTerms.join(' ')
}
