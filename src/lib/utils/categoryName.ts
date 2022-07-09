export const categoryName = (name: string, prefix?: boolean): string => {
  let pronoun
  const singular = 'de '
  const plural = 'de la '
  switch (name) {
    case 'Contacto':
      pronoun = ''
      break
    case 'Publicidad':
      pronoun = ''
      break
    case 'Costa Oriental':
      pronoun = plural
      break
    default:
      pronoun = singular
  }

  return `${prefix ? 'Noticias ' : ''} ${pronoun} ${name}`
}
