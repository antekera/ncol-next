export const DEVELOPMENT = 'development'
export const CMS_NAME = 'Noticiascol.com'
export const CMS_URL = 'https://noticiascol.com'
export const SERVER = 'http://noticiascol.com'
export const CATEGORY_PATH = '/categoria'
export const COMPANY_NAME = 'Mas Multimedios C.A.'
export const CITY = ' Cabimas - Venezuela,'
export const HOME_PAGE_TITLE =
  'Noticiascol | El acontecer regional, del Zulia y Venezuela | Noticias de la Col, Cabimas, Maracaibo, Ciudad Ojeda, Lagunillas al dia y las 24 horas'
export const PAGE_DESCRIPTION =
  'Noticias de la Col, Cabimas, Maracaibo, Ciudad Ojeda, Lagunillas al dia y las 24 horas'
export const FOOTER_DESCRIPTION =
  'El Diario Digital de la Costa Oriental del Lago, el Zulia y Venezuela. Noticias del Zulia, Cabimas, Maracaibo, Ciudad Ojeda, Caracas al día y las 24 horas.'
export const TWITTER_USERNAME = '@noticiasdelacol'
export const SOCIAL_LINKS = [
  {
    id: 'facebook',
    link: 'https://www.facebook.com/noticiascolcom'
  },
  {
    id: 'twitter',
    link: 'https://mobile.twitter.com/noticiasdelacol'
  },
  {
    id: 'instagram',
    link: 'https://www.instagram.com/noticiascol/'
  },
  {
    id: 'linkedin',
    link: 'https://www.linkedin.com/company/noticiascol/'
  }
]
export const MAIN_MENU = [
  'Inicio',
  'Costa Oriental',
  'Sucesos',
  'Nacionales',
  'Economía',
  'Política',
  'Farándula',
  'Internacionales',
  'Salud',
  'Curiosidades',
  'Tecnología',
  'Deportes'
]
export const MENU = [
  'Inicio',
  'Costa Oriental',
  'Maracaibo',
  'San Francisco',
  'Baralt',
  'Cabimas',
  'Lagunillas',
  'Miranda',
  'Santa Rita',
  'Simón Bolivar',
  'Valmore Rodriguez'
]
export const MENU_B = [
  'Actualidad',
  'Cultura',
  'Cine',
  'Curiosidades',
  'Deportes',
  'Economía',
  'Educación',
  'Entretenimiento',
  'Especiales',
  'Estilo de Vida',
  'Farándula',
  'Gastronomía',
  'Internacionales',
  'Internet',
  'Mundo',
  'Música',
  'Nacionales',
  'Opinión',
  'Política',
  'Salud',
  'Sucesos',
  'Tecnología',
  'Televisión'
]
export const MENU_C = ['Contacto', 'Publicidad', 'Términos y Condiciones']
export const MERGED_MENU = new Set([
  ...MAIN_MENU,
  ...MENU,
  ...MENU_B,
  ...MENU_C
])
export const REGEX_VALID_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
