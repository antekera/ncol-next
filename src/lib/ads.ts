// ADS
export const TAG_MANAGER_ID = 'GTM-KSDFW3'

const responsive = {
  'data-ad-format': 'auto',
  'data-full-width-responsive': 'true'
}

export const ad = {
  global: {
    top_header: {
      data: {
        ...responsive,
        'data-ad-slot': '7773901438'
      }
    },
    top_mobile: {
      data: {
        'data-ad-client': 'ca-pub-6715059182926587',
        'data-ad-slot': '6070826540'
      }
    },
    sidebar: {
      data: {
        ...responsive,
        'data-ad-slot': '8445853262'
      }
    },
    related: {
      data: {
        'data-ad-format': 'autorelaxed',
        'data-ad-slot': '1664121794'
      }
    },
    more_news: {
      data: {
        ...responsive,
        'data-ad-slot': '1749550570'
      }
    }
  },
  home: {
    cover: {
      data: {
        ...responsive,
        'data-ad-slot': '6914247342'
      }
    },
    in_article_right: {
      data: {
        ...responsive,
        'data-ad-slot': '8967896747'
      }
    },
    in_article_left: {
      data: {
        ...responsive,
        'data-ad-slot': '6174913142'
      }
    }
  },
  single: {
    in_article: {
      data: {
        'data-ad-format': 'fluid',
        'data-ad-layout': 'in-article',
        'data-ad-slot': '3445775626'
      }
    }
  },
  category: {
    in_article: {
      data: {
        'data-ad-format': 'fluid',
        'data-ad-layout-key': '-fy+13+8a-69+1h',
        'data-ad-slot': '8703839729'
      }
    }
  }
}
