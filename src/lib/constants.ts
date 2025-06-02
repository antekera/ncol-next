import { Link } from '@lib/types'

export const DEVELOPMENT = 'development'
export const PRODUCTION = 'production'
export const CMS_NAME = 'Noticiascol.com'
export const CMS_URL = 'https://noticiascol.com'
export const CATEGORY_PATH = '/categoria'
export const TAG_PATH = '/etiqueta'
export const CATEGORIES = {
  COL_RIGHT: '_Pos_Columna_der',
  COL_LEFT: '_Pos_Columna_izq'
}
export const COMPANY_NAME = 'Mas Multimedios C.A.'
export const HOME_PAGE_TITLE =
  'Noticiascol | El acontecer regional, del Zulia y Venezuela'
export const PAGE_DESCRIPTION =
  'Noticias de la Costa Oriental del Lago, Maracaibo, Ciudad Ojeda, Falcón, Lara, Mérida, Trujillo y Táchira 24/7'
export const FOOTER_DESCRIPTION =
  'Portal digital líder en noticias del Occidente venezolano. Noticias actualizadas de Venezuela y el mundo. Información confiable desde las regiones del Zulia, Falcón, Mérida, Trujillo, Lara y Táchira.'
export const TWITTER_USERNAME = '@noticiasdelacol'
export const SOCIAL_LINKS = [
  {
    id: 'facebook',
    link: 'https://www.facebook.com/people/Noticiascol/61574619597032/',
    text: 'Síguenos en Facebook'
  },
  {
    id: 'x',
    link: 'https://mobile.twitter.com/noticiasdelacol',
    size: '310 310',
    text: 'Síguenos en X'
  },
  {
    id: 'instagram',
    link: 'https://www.instagram.com/noticiascol/',
    text: 'Síguenos en Instagram'
  },
  {
    id: 'threads',
    link: 'https://www.threads.com/@noticiascol',
    size: '190 190',
    text: 'Síguenos en Threads'
  },
  {
    id: 'whatsapp',
    link: 'https://whatsapp.com/channel/0029VbALBGh77qVUp56yeN1b',
    size: '25 25',
    text: 'Suscríbete a nuestro canal de WhatsApp'
  }
]

export const MAIN_MENU: Link[] = [
  { name: 'Zulia', href: `${CATEGORY_PATH}/zulia` },
  { name: 'Nacionales', href: `${CATEGORY_PATH}/nacionales` },
  { name: 'Internacionales', href: `${CATEGORY_PATH}/internacionales` },
  { name: 'Deportes', href: `${CATEGORY_PATH}/deportes` },
  { name: 'Tendencias', href: `${CATEGORY_PATH}/tendencias` },
  { name: 'Entretenimiento', href: `${CATEGORY_PATH}/entretenimiento` },
  { name: 'Salud', href: `${CATEGORY_PATH}/salud` },
  { name: 'Sucesos', href: `${CATEGORY_PATH}/sucesos` }
]
export const MENU: Link[] = [{ name: 'Inicio', href: '/' }, ...MAIN_MENU]
export const MENU_B: Link[] = [
  { name: 'Política', href: `${CATEGORY_PATH}/nacionales/politica` },
  {
    name: 'Ciencia y Tecnología',
    href: `${CATEGORY_PATH}/tendencias/ciencia-y-tecnologia`
  },
  { name: 'Farándula', href: `${CATEGORY_PATH}/entretenimiento/farandula` },
  {
    name: 'Curiosidades',
    href: `${CATEGORY_PATH}/entretenimiento/curiosidades`
  },
  { name: 'Cine y TV', href: `${CATEGORY_PATH}/entretenimiento/cine-y-tv` },
  { name: 'Futbol', href: `${CATEGORY_PATH}/deportes/futbol` },
  { name: 'Gastronomía', href: `${CATEGORY_PATH}/tendencias/gastronomia` },
  {
    name: 'Estilos de Vida',
    href: `${CATEGORY_PATH}/tendencias/estilos-de-vida`
  }
]
export const MENU_C: Link[] = [
  { name: 'Contacto', href: '/contacto' },
  { name: 'Términos y Condiciones', href: '/terminos-y-condiciones' },
  { name: 'Privacidad', href: '/privacidad' }
]
export const MERGED_MENU = new Set([
  ...MAIN_MENU,
  ...MENU,
  ...MENU_B,
  ...MENU_C
])
export const FILTERED_CATEGORIES = ['_Pos_Columna_der', '_Pos_Columna_izq']
export const RECENT_NEWS = 'Otras noticias'
export const STATUS = {
  Error: 'error',
  Success: 'success',
  Loading: 'loading'
}
export const TIME_REVALIDATE = {
  MINUTE: 60,
  HOUR: 3600,
  THREE_HOURS: 10800,
  SIX_HOURS: 21600,
  DAY: 86400,
  WEEK: 604800
}

// WORDPRESS IMAGE SIZES
export const IMAGE_SIZES = {
  LARGE: 'LARGE',
  MEDIUM_LARGE: 'MEDIUM_LARGE',
  MEDIUM: 'MEDIUM',
  THUMBNAIL: 'THUMBNAIL'
}
