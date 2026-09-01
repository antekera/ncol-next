import { NextResponse } from 'next/server'
import { CMS_NAME, CMS_URL } from '@lib/constants'

export const revalidate = 300 // 5 min

// El namespace news: cubre solo publicaciones recientes. Google descarta las
// entradas de más de 48 h, así que este sitemap es de novedad, no de archivo:
// para el histórico completo está /articles-sitemap.
const WINDOW_HOURS = 48
const MAX_ITEMS = 200

function getWpJsonBase(): string {
  const explicit = (process.env.WORDPRESS_JSON_URL ?? '').trim()
  if (explicit) return explicit.replace(/\/$/, '')

  return (process.env.WORDPRESS_API_URL ?? '')
    .trim()
    .replace(/\/graphql\/?$/, '/wp-json')
}

function getAuthHeader(): HeadersInit {
  const user = process.env.WP_USER
  const pass = process.env.WP_PASSWORD
  if (!user || !pass) return {}
  const credentials = Buffer.from(`${user}:${pass}`).toString('base64')
  return { Authorization: `Basic ${credentials}` }
}

type WpPost = {
  link: string
  date_gmt: string
  title: { rendered: string }
}

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
  const wpJson = getWpJsonBase()
  if (!wpJson) {
    return new NextResponse('WORDPRESS_JSON_URL not configured', {
      status: 500
    })
  }

  const after = new Date(
    Date.now() - WINDOW_HOURS * 60 * 60 * 1000
  ).toISOString()

  const url =
    `${wpJson}/wp/v2/posts?per_page=${MAX_ITEMS}&status=publish` +
    `&after=${encodeURIComponent(after)}&orderby=date&order=desc` +
    `&_fields=link,date_gmt,title`

  try {
    const res = await fetch(url, {
      headers: getAuthHeader(),
      cache: 'no-store',
      signal: AbortSignal.timeout(8000)
    })

    if (!res.ok) {
      return new NextResponse(`WP REST API error ${res.status} — URL: ${url}`, {
        status: 502
      })
    }

    const posts: WpPost[] = await res.json()

    const urls = posts
      .map(post => {
        const path = post.link.replace(/^https?:\/\/[^/]+/, '')
        const title = escapeXml(decodeEntities(post.title?.rendered ?? ''))
        const published = new Date(post.date_gmt + 'Z').toISOString()

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
  } catch (err) {
    return new NextResponse(
      `Error fetching from ${url}: ${err instanceof Error ? err.message : String(err)}`,
      { status: 500 }
    )
  }
}
