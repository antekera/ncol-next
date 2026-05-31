import { NextResponse } from 'next/server'
import { CMS_URL } from '@lib/constants'

export const revalidate = 3600

const PER_PAGE = 100

function getWpJsonBase(): string {
  // Prefer explicit WORDPRESS_JSON_URL, fall back to deriving from GraphQL URL
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

export async function GET() {
  const wpJson = getWpJsonBase()
  if (!wpJson) {
    return new NextResponse('WORDPRESS_JSON_URL not configured', {
      status: 500
    })
  }

  const url = `${wpJson}/wp/v2/posts?per_page=1&_fields=id&status=publish`

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

    const total = parseInt(res.headers.get('X-WP-Total') ?? '0', 10)
    const totalPages = Math.ceil(total / PER_PAGE)

    const sitemaps = Array.from(
      { length: totalPages },
      (_, i) =>
        `  <sitemap>\n    <loc>${CMS_URL}/articles-sitemap/${i + 1}</loc>\n  </sitemap>`
    ).join('\n')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps}
</sitemapindex>`

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    })
  } catch (err) {
    return new NextResponse(
      `Error fetching from ${url}: ${err instanceof Error ? err.message : String(err)}`,
      { status: 500 }
    )
  }
}
