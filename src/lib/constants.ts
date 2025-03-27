export const DEVELOPMENT = 'development'
export const PRODUCTION = 'production'
export const CMS_NAME = 'Noticiascol.com'
export const CMS_URL = 'https://noticiascol.com'
export const CATEGORY_PATH = '/categoria'
export const TAG_PATH = '/etiqueta'
export const CATEGORIES = {
  COVER: '_Pos_Destacado',
  COL_RIGHT: '_Pos_Columna_der',
  COL_LEFT: '_Pos_Columna_izq'
}
export const COMPANY_NAME = 'Mas Multimedios C.A.'
// export const CITY = ' Cabimas - Venezuela,'
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
    link: 'https://www.facebook.com/people/Noticiascol/61574619597032/'
  },
  {
    id: 'x',
    link: 'https://mobile.twitter.com/noticiasdelacol',
    size: '310 380'
  },
  {
    id: 'instagram',
    link: 'https://www.instagram.com/noticiascol/'
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
  'Cine',
  'Curiosidades',
  'Deportes',
  'Economía',
  'Educación',
  'Especiales',
  'Estilo de Vida',
  'Farándula',
  'Internacionales',
  'Mundo',
  'Música',
  'Nacionales',
  'Política',
  'Salud',
  'Sucesos',
  'Tecnología'
]
export const MENU_C = [
  'Contacto',
  'Publicidad',
  'Términos y Condiciones',
  'Privacidad'
]
export const MERGED_MENU = new Set([
  ...MAIN_MENU,
  ...MENU,
  ...MENU_B,
  ...MENU_C
])
export const FILTERED_CATEGORIES = [
  '_Pos_Columna_der',
  '_Pos_Columna_izq',
  '_Pos_Destacado'
]
export const RECENT_NEWS = 'Noticias recientes'
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
