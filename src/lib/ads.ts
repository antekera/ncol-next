import { AdItem } from './next-google-dfp-main/src/types'

// ADS
export const TAG_MANAGER_ID = 'GTM-KSDFW3'
const AD_MANAGER_ID = '12217521'
// export const ADSENSE_CLIENT_ID = 'ca-pub-6715059182926587'

// ADS DFP
const AD_MANAGER_PREFIX = 'div-gpt-ad'

// Global
const AD_DFP_MENU = {
  NAME: 'banner_principal',
  ID: '1662938702901-0',
  SIZE: [[1000, 250]],
  STYLE: { minWidth: '1000px', minHeight: '250px' }
}
const AD_DFP_MENU_MOBILE = {
  NAME: 'intermedio_1',
  ID: '1663287871941-0',
  SIZE: [[300, 100]],
  STYLE: { minWidth: '300px', minHeight: '100px' }
}
const AD_DFP_SIDEBAR = {
  NAME: 'lateral_a1',
  ID: '1662933959123-0',
  SIZE: [[300, 600]],
  STYLE: { minWidth: '300px', minHeight: '600px' }
}
const AD_DFP_SIDEBAR2 = {
  NAME: 'lateral_b1',
  ID: '1662937413122-0',
  SIZE: [300, 250],
  STYLE: { minWidth: '300px', minHeight: '250px' }
}
// Home
const AD_DFP_COVER = {
  NAME: 'torre_2',
  ID: '1663288350704-0',
  SIZE: [
    [300, 100],
    [728, 90]
  ],
  STYLE: { minWidth: '300px', minHeight: '100px' }
}
const AD_DFP_HOME_FEED = {
  NAME: 'lateral_a3',
  ID: '1662935751586-0',
  SIZE: [[300, 100]],
  STYLE: { minWidth: '300px', minHeight: '100px' }
}
const AD_DFP_HOME_FEED_SECONDARY = {
  NAME: 'lateral_a2',
  ID: '1662935053350-0',
  SIZE: [[200, 200], 'fluid'],
  STYLE: { minWidth: '200px', minHeight: '200px' }
}
const AD_DFP_HOME_FEED_SECONDARY2 = {
  NAME: 'internota_1',
  ID: '1663438486397-0',
  SIZE: [[200, 200]],
  STYLE: { minWidth: '200px', minHeight: '200px' }
}
// Category
const AD_DFP_CATEGORY_FEED = {
  NAME: 'lateral_b2',
  ID: '1663289413827-0',
  SIZE: [
    [300, 100],
    [728, 90]
  ],
  STYLE: { minWidth: '300px', minHeight: '100px' }
}
const AD_DFP_CATEGORY_FEED_2 = {
  NAME: 'lateral_b3',
  ID: '1663289569751-0',
  SIZE: [
    [300, 100],
    [728, 90]
  ],
  STYLE: { minWidth: '300px', minHeight: '100px' }
}
// Square
const SQUARE_C1 = {
  NAME: 'lateral_c1',
  ID: '1663290647151-0',
  SIZE: [300, 250],
  STYLE: { minWidth: '300px', minHeight: '250px' }
}
const SQUARE_C2 = {
  NAME: 'lateral_c2',
  ID: '1663290682160-0',
  SIZE: [300, 250],
  STYLE: { minWidth: '300px', minHeight: '250px' }
}
const SQUARE_C3 = {
  NAME: 'lateral_c3',
  ID: '1663290699468-0',
  SIZE: [300, 250],
  STYLE: { minWidth: '300px', minHeight: '250px' }
}
export const DFP_ADS: AdItem[] = [
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
    slotId: `/${AD_MANAGER_ID}/${AD_DFP_HOME_FEED_SECONDARY2.NAME}`,
    sizeMappings: AD_DFP_HOME_FEED_SECONDARY2.SIZE,
    divId: `${AD_MANAGER_PREFIX}-${AD_DFP_HOME_FEED_SECONDARY2.ID}`
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

export const DFP_ADS_PAGES = {
  menu: {
    id: `${AD_MANAGER_PREFIX}-${AD_DFP_MENU.ID}`,
    style: AD_DFP_MENU.STYLE
  },
  menu_mobile: {
    id: `${AD_MANAGER_PREFIX}-${AD_DFP_MENU_MOBILE.ID}`,
    style: AD_DFP_MENU_MOBILE.STYLE
  },
  sidebar: {
    id: `${AD_MANAGER_PREFIX}-${AD_DFP_SIDEBAR.ID}`,
    style: AD_DFP_SIDEBAR.STYLE
  },
  sidebar2: {
    id: `${AD_MANAGER_PREFIX}-${AD_DFP_SIDEBAR2.ID}`,
    style: AD_DFP_SIDEBAR2.STYLE
  },
  cover: {
    id: `${AD_MANAGER_PREFIX}-${AD_DFP_COVER.ID}`,
    style: AD_DFP_COVER.STYLE
  },
  homeFeed: {
    id: `${AD_MANAGER_PREFIX}-${AD_DFP_HOME_FEED.ID}`,
    style: AD_DFP_HOME_FEED.STYLE
  },
  homeFeed2: {
    id: `${AD_MANAGER_PREFIX}-${AD_DFP_HOME_FEED_SECONDARY.ID}`,
    style: AD_DFP_HOME_FEED_SECONDARY.STYLE
  },
  homeFeed3: {
    id: `${AD_MANAGER_PREFIX}-${AD_DFP_HOME_FEED_SECONDARY2.ID}`,
    style: AD_DFP_HOME_FEED_SECONDARY2.STYLE
  },
  categoryFeed: {
    id: `${AD_MANAGER_PREFIX}-${AD_DFP_CATEGORY_FEED.ID}`,
    style: AD_DFP_CATEGORY_FEED.STYLE
  },
  categoryFeed2: {
    id: `${AD_MANAGER_PREFIX}-${AD_DFP_CATEGORY_FEED_2.ID}`,
    style: AD_DFP_CATEGORY_FEED_2.STYLE
  },
  squareC1: {
    id: `${AD_MANAGER_PREFIX}-${SQUARE_C1.ID}`,
    style: SQUARE_C1.STYLE
  },
  squareC2: {
    id: `${AD_MANAGER_PREFIX}-${SQUARE_C2.ID}`,
    style: SQUARE_C2.STYLE
  },
  squareC3: {
    id: `${AD_MANAGER_PREFIX}-${SQUARE_C3.ID}`,
    style: SQUARE_C3.STYLE
  }
}
