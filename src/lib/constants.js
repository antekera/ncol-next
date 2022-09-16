export const CMS_NAME = 'Noticiascol.com'
export const CMS_URL = 'https://noticiascol.com'
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
// ADS
export const TAG_MANAGER_ID = 'GTM-KSDFW3'
export const AD_MANAGER_ID = '12217521'
export const ADSENSE_CLIENT_ID = 'ca-pub-6715059182926587'
// ADS DFP
export const AD_MANAGER_PREFIX = 'div-gpt-ad'
// Global
export const AD_DFP_MENU = {
  NAME: 'banner_principal',
  ID: '1662938702901-0',
  SIZE: [[1000, 250]],
  STYLE: { width: '300px', height: '90px' }
}
export const AD_DFP_MENU_MOBILE = {
  NAME: 'intermedio_1',
  ID: '1663287871941-0',
  SIZE: [[300, 100]],
  STYLE: { width: '300px', height: '100px' }
}
export const AD_DFP_SIDEBAR = {
  NAME: 'lateral_a1',
  ID: '1662933959123-0',
  SIZE: [[300, 600]],
  STYLE: { width: '300px', height: '600px' }
}
export const AD_DFP_SIDEBAR2 = {
  NAME: 'lateral_b1',
  ID: '1662937413122-0',
  SIZE: [300, 250],
  STYLE: { width: '300px', height: '250px' }
}
// Home
export const AD_DFP_COVER = {
  NAME: 'torre_2',
  ID: '1663288350704-0',
  SIZE: [
    [300, 100],
    [728, 90]
  ],
  STYLE: { width: '300px', height: '100px' }
}
export const AD_DFP_HOME_FEED = {
  NAME: 'lateral_a3',
  ID: '1662935751586-0',
  SIZE: [[300, 100]],
  STYLE: { width: '300px', height: '100px' }
}
export const AD_DFP_HOME_FEED_SECONDARY = {
  NAME: 'lateral_a2',
  ID: '1662935053350-0',
  SIZE: [[200, 200], 'fluid'],
  STYLE: { width: '234px', height: '60px' }
}
// Category
export const AD_DFP_CATEGORY_FEED = {
  NAME: 'lateral_b2',
  ID: '1663289413827-0',
  SIZE: [
    [300, 100],
    [728, 90]
  ],
  STYLE: { width: '300px', height: '90px' }
}
export const AD_DFP_CATEGORY_FEED_2 = {
  NAME: 'lateral_b3',
  ID: '1663289569751-0',
  SIZE: [
    [300, 100],
    [728, 90]
  ],
  STYLE: { width: '300px', height: '90px' }
}
// Square
export const SQUARE_C1 = {
  NAME: 'lateral_c1',
  ID: '1663290647151-0',
  SIZE: [300, 250],
  STYLE: { width: '300px', height: '250px' }
}
export const SQUARE_C2 = {
  NAME: 'lateral_c2',
  ID: '1663290682160-0',
  SIZE: [300, 250],
  STYLE: { width: '300px', height: '250px' }
}
export const SQUARE_C3 = {
  NAME: 'lateral_c3',
  ID: '1663290699468-0',
  SIZE: [300, 250],
  STYLE: { width: '300px', height: '250px' }
}
export const DFP_ADS = [
  {
    slotId: `/${AD_MANAGER_ID}/${AD_DFP_MENU.NAME}`,
    sizeMappings: AD_DFP_MENU.SIZE,
    divId: `${AD_MANAGER_PREFIX}-${AD_DFP_MENU.ID}`
  },
  {
    slotId: `/${AD_MANAGER_ID}/${AD_DFP_MENU_MOBILE.NAME}`,
    sizeMappings: AD_DFP_MENU_MOBILE.SIZE,
    divId: `${AD_MANAGER_PREFIX}-${AD_DFP_MENU_MOBILE.ID}`
  },
  {
    slotId: `/${AD_MANAGER_ID}/${AD_DFP_SIDEBAR.NAME}`,
    sizeMappings: AD_DFP_SIDEBAR.SIZE,
    divId: `${AD_MANAGER_PREFIX}-${AD_DFP_SIDEBAR.ID}`
  },
  {
    slotId: `/${AD_MANAGER_ID}/${AD_DFP_SIDEBAR2.NAME}`,
    sizeMappings: AD_DFP_SIDEBAR2.SIZE,
    divId: `${AD_MANAGER_PREFIX}-${AD_DFP_SIDEBAR2.ID}`
  },
  {
    slotId: `/${AD_MANAGER_ID}/${AD_DFP_COVER.NAME}`,
    sizeMappings: AD_DFP_COVER.SIZE,
    divId: `${AD_MANAGER_PREFIX}-${AD_DFP_COVER.ID}`
  },
  {
    slotId: `/${AD_MANAGER_ID}/${AD_DFP_HOME_FEED.NAME}`,
    sizeMappings: AD_DFP_HOME_FEED.SIZE,
    divId: `${AD_MANAGER_PREFIX}-${AD_DFP_HOME_FEED.ID}`
  },
  {
    slotId: `/${AD_MANAGER_ID}/${AD_DFP_HOME_FEED_SECONDARY.NAME}`,
    sizeMappings: AD_DFP_HOME_FEED_SECONDARY.SIZE,
    divId: `${AD_MANAGER_PREFIX}-${AD_DFP_HOME_FEED_SECONDARY.ID}`
  },
  {
    slotId: `/${AD_MANAGER_ID}/${AD_DFP_CATEGORY_FEED.NAME}`,
    sizeMappings: AD_DFP_CATEGORY_FEED.SIZE,
    divId: `${AD_MANAGER_PREFIX}-${AD_DFP_CATEGORY_FEED.ID}`
  },
  {
    slotId: `/${AD_MANAGER_ID}/${AD_DFP_CATEGORY_FEED_2.NAME}`,
    sizeMappings: AD_DFP_CATEGORY_FEED_2.SIZE,
    divId: `${AD_MANAGER_PREFIX}-${AD_DFP_CATEGORY_FEED_2.ID}`
  },
  {
    slotId: `/${AD_MANAGER_ID}/${SQUARE_C1.NAME}`,
    sizeMappings: SQUARE_C1.SIZE,
    divId: `${AD_MANAGER_PREFIX}-${SQUARE_C1.ID}`
  },
  {
    slotId: `/${AD_MANAGER_ID}/${SQUARE_C2.NAME}`,
    sizeMappings: SQUARE_C2.SIZE,
    divId: `${AD_MANAGER_PREFIX}-${SQUARE_C2.ID}`
  },
  {
    slotId: `/${AD_MANAGER_ID}/${SQUARE_C3.NAME}`,
    sizeMappings: SQUARE_C3.SIZE,
    divId: `${AD_MANAGER_PREFIX}-${SQUARE_C3.ID}`
  }
]
