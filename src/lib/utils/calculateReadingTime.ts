export const calculateReadingTime = (content?: string): number => {
  if (!content) return 0

  // eslint-disable-next-line sonarjs/slow-regex
  const plainText = content.replace(/<[^>]*>/g, ' ')

  // Contar palabras
  const words = plainText
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length

  // Velocidad de lectura lenta: ~130 palabras por minuto
  // El estándar promedio es ~200-240 ppm
  const readingTime = Math.round(words / 130)

  return readingTime < 1 ? 1 : readingTime
}
