export const calculateReadingTime = (content?: string): number => {
  if (!content) return 0

  // eslint-disable-next-line sonarjs/slow-regex
  const plainText = content.replace(/<[^>]+>/g, ' ')
  const words = plainText
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length
  const readingTime = Math.round(words / 225)

  return readingTime < 1 ? 1 : readingTime
}
