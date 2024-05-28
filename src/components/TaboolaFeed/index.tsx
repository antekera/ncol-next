'use client'

import { useEffect } from 'react'

const TaboolaFeed = () => {
  useEffect(() => {
    if (!window) {
      // @ts-ignore
      window._taboola = window._taboola || []
      // @ts-ignore
      _taboola.push({ article: 'auto' })

      // @ts-ignore
      window._taboola.push({
        mode: 'thumbnails-a',
        container: 'taboola-below-article-thumbnails',
        placement: 'Below Article Thumbnails',
        target_type: 'mix'
      })
    }

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    !(function (e, f, u, i) {
      if (!document.getElementById(i)) {
        // @ts-ignore
        e.async = 1
        e.src = u
        e.id = i
        // @ts-ignore
        f.parentNode.insertBefore(e, f)
      }
    })(
      document.createElement('script'),
      document.getElementsByTagName('script')[0],
      '//cdn.taboola.com/libtrc/noticiascol-noticiascol/loader.js',
      'tb_loader_script'
    )
    if (window.performance && typeof window.performance.mark == 'function') {
      window.performance.mark('tbl_ic')
    }
  }, [])

  return <div id='taboola-below-article-thumbnails'></div>
}

export { TaboolaFeed }
