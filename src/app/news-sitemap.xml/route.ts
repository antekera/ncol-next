import { NextResponse } from 'next/server'
import { wordpressRestClient } from '@lib/api'
import { CMS_NAME, CMS_URL } from '@lib/constants'

export const revalidate = 300 // 5 min

// El namespace news: cubre solo publicaciones recientes. Google descarta las
// entradas de más de 48 h, así que este sitemap es de novedad, no de archivo:
// para el histórico completo está /articles-sitemap.
const WINDOW_HOURS = 48
const MAX_ITEMS = 100

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const decodeEntities = (value: string): string =>
  value
    .replace(/&#8217;|&#039;|&#39;/g, "'")
    .replace(/&#8220;|&#8221;|&quot;/g, '"')
    .replace(/&#8211;|&#8212;/g, '—')
    .replace(/&amp;/g, '&')
    .replace(/&hellip;/g, '…')
    .replace(/&nbsp;/g, ' ')

export async function GET() {
  const after = new Date(
    Date.now() - WINDOW_HOURS * 60 * 60 * 1000
  ).toISOString()

  const posts = await wordpressRestClient.getRecentNewsPosts(after, MAX_ITEMS)
  if (!posts) {
    return new NextResponse('News sitemap temporarily unavailable', {
      status: 502
    })
  }

  const urls = posts
    .map(post => {
      let postUrl: URL
      try {
        postUrl = new URL(post.link)
      } catch {
        return ''
      }
      if (postUrl.hostname !== new URL(CMS_URL).hostname) return ''
      const path = `${postUrl.pathname}${postUrl.search}`
      const title = escapeXml(decodeEntities(post.title?.rendered ?? ''))
      const publishedDate = new Date(
        /(?:Z|[+-]\d{2}:?\d{2})$/i.test(post.date_gmt)
          ? post.date_gmt
          : `${post.date_gmt}Z`
      )
      if (!Number.isFinite(publishedDate.getTime()) || !title) return ''
      const published = publishedDate.toISOString()

      return `  <url>
    <loc>${CMS_URL}${path}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(CMS_NAME)}</news:name>
        <news:language>es</news:language>
      </news:publication>
      <news:publication_date>${published}</news:publication_date>
      <news:title>${title}</news:title>
    </news:news>
  </url>`
    })
    .filter(Boolean)
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=300, s-maxage=300'
    }
  })
}
