// ADS
export const TAG_MANAGER_ID = 'GTM-KSDFW3'

const client = {
  'data-ad-client': 'ca-pub-7670449359777872'
}

const responsive = {
  'data-ad-format': 'auto',
  'data-full-width-responsive': 'true'
}

export const ad = {
  global: {
    top_header: {
      data: {
        ...client,
        ...responsive,
        'data-ad-slot': '9146695764'
      }
    },
    top_mobile: {
      data: {
        ...client,
        // style="display:inline-block;width:250px;height:70px"
        'data-ad-client': 'ca-pub-7670449359777872',
        'data-ad-slot': '4113860938'
      }
    },
    sidebar: {
      data: {
        ...client,
        ...responsive,
        'data-ad-slot': '1115877090'
      }
    },
    related: {
      data: {
        ...client,
        'data-ad-format': 'autorelaxed',
        'data-ad-slot': '7054868988'
      }
    },
    more_news: {
      data: {
        ...client,
        ...responsive,
        'data-ad-slot': '4596226600'
      }
    }
  },
  home: {
    cover: {
      data: {
        ...client,
        'data-ad-slot': '4728088543',
        'data-ad-format': 'auto',
        'data-full-width-responsive': 'true'
      }
    },
    in_article_right: {
      data: {
        ...client,
        ...responsive,
        'data-ad-slot': '4867689343'
      }
    },
    in_article_left: {
      data: {
        ...client,
        ...responsive,
        'data-ad-slot': '2034492502'
      }
    }
  },
  single: {
    in_article: {
      data: {
        ...client,
        'data-ad-format': 'fluid',
        'data-ad-layout': 'in-article',
        'data-ad-slot': '3498497851'
      }
    }
  },
  category: {
    in_article: {
      data: {
        ...client,
        'data-ad-format': 'fluid',
        'data-ad-layout-key': '-gc+2r+am-7l-il',
        'data-ad-slot': '5933359005'
      }
    }
  }
}
