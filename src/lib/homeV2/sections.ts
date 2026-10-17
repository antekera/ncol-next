import type { HomeSectionConfig } from './types'

// Positions describe editorial order, including the reserved video module (6).
export const HOME_V2_SECTIONS: readonly HomeSectionConfig[] = [
  {
    id: 'videos',
    title: 'Videos recientes',
    categorySlug: '',
    position: 6,
    presentation: 'video',
    limit: 6,
    href: '/videos/',
    includeDescendants: false,
    source: 'video',
    allowRepeatedArticles: true
  },
  {
    id: 'latest',
    title: 'Últimas publicaciones',
    categorySlug: '',
    position: 10,
    presentation: 'text_list',
    limit: 8,
    href: '/lo-ultimo/',
    includeDescendants: false,
    source: 'latest',
    allowRepeatedArticles: true
  },
  {
    id: 'opening',
    title: 'En portada',
    categorySlug: '_pos_columna_izq',
    position: 1,
    presentation: 'opening',
    limit: 3,
    href: '/',
    includeDescendants: false
  },
  {
    id: 'zulia',
    title: 'Todo Zulia',
    categorySlug: 'zulia',
    position: 2,
    presentation: 'regional',
    limit: 7,
    href: '/categoria/zulia/',
    includeDescendants: true
  },
  {
    id: 'nacionales',
    title: 'Nacionales',
    categorySlug: 'nacionales',
    position: 3,
    presentation: 'lead_list',
    limit: 6,
    href: '/categoria/nacionales/',
    includeDescendants: true
  },
  {
    id: 'sucesos',
    title: 'Sucesos',
    categorySlug: 'sucesos',
    position: 4,
    presentation: 'lead_list',
    limit: 6,
    href: '/categoria/sucesos/',
    includeDescendants: true
  },
  {
    id: 'internacionales',
    title: 'Internacionales',
    categorySlug: 'internacionales',
    position: 5,
    presentation: 'lead_list',
    limit: 5,
    href: '/categoria/internacionales/',
    includeDescendants: true
  },
  {
    id: 'deportes',
    title: 'Deportes',
    categorySlug: 'deportes',
    position: 7,
    presentation: 'lead_list',
    limit: 5,
    href: '/categoria/deportes/',
    includeDescendants: true
  },
  {
    id: 'tendencias',
    title: 'Tendencias',
    categorySlug: 'tendencias',
    position: 8,
    presentation: 'lead_list',
    limit: 5,
    href: '/categoria/tendencias/',
    includeDescendants: true
  },
  {
    id: 'entretenimiento',
    title: 'Entretenimiento',
    categorySlug: 'entretenimiento',
    position: 9,
    presentation: 'lead_list',
    limit: 5,
    href: '/categoria/entretenimiento/',
    includeDescendants: true
  }
]
