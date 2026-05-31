import { NextResponse } from 'next/server'
import { CMS_URL } from '@lib/constants'

export const revalidate = 3600

const PER_PAGE = 100

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
  modified: string
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ page: string }> }
) {
  const { page } = await params
  const pageNum = parseInt(page, 10)

  if (isNaN(pageNum) || pageNum < 1) {
    return new NextResponse('Invalid page number', { status: 400 })
  }

  const wpJson = getWpJsonBase()
  if (!wpJson) {
    return new NextResponse('WORDPRESS_JSON_URL not configured', {
      status: 500
    })
  }

  const url = `${wpJson}/wp/v2/posts?per_page=${PER_PAGE}&page=${pageNum}&_fields=link,modified&status=publish&orderby=modified&order=desc`

  try {
    const res = await fetch(url, {
      headers: getAuthHeader(),
      cache: 'no-store',
      signal: AbortSignal.timeout(8000)
    })

    if (res.status === 400) {
      return new NextResponse('Page out of range', { status: 404 })
    }

    if (!res.ok) {
      return new NextResponse(`WP REST API error ${res.status} — URL: ${url}`, {
        status: 502
      })
    }

    const posts: WpPost[] = await res.json()

    const urls = posts
      .map(post => {
        const path = post.link.replace(/^https?:\/\/[^/]+/, '')
        return `  <url>\n    <loc>${CMS_URL}${path}</loc>\n    <lastmod>${new Date(post.modified).toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`
      })
      .join('\n')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`

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
