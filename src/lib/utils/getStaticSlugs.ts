import { Link } from '@lib/types'

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export const getStaticSlugs = (items: Link[] = []): string[] => {
  return items.map(item => item.href)
}
