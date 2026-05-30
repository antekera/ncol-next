export const categoryName = (name: string, prefix?: boolean): string => {
  let pronoun
  const news = 'Noticias'
  const singular = ' de'
  const plural = ' de la'
  const from = ' del'
  const empty = ''
  switch (name) {
    case 'Más visto hoy':
    case 'Avisos Legales':
    case 'Videos':
      return name
    case 'Costa Oriental':
      pronoun = plural
      break
    case 'Zulia':
    case 'Mundial 2026':
      pronoun = from
      break
    case 'Nacionales':
      pronoun = empty
      break
    case 'Internacionales':
      pronoun = empty
      break
    default:
      pronoun = singular
  }

  if (!prefix) return `${name}`

  return `${news}${pronoun} ${name}`
}
