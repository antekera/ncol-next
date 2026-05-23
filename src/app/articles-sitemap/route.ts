import { NextResponse } from 'next/server'
import { CMS_URL } from '@lib/constants'

export const revalidate = 3600

const PER_PAGE = 100

function getWpJsonBase() {
  return (process.env.WORDPRESS_API_URL ?? '')
    .trim()
    .replace(/\/graphql\/?$/, '/wp-json')
}

export async function GET() {
  const wpJson = getWpJsonBase()
  if (!wpJson) {
    return new NextResponse('WORDPRESS_API_URL not configured', { status: 500 })
  }

  try {
    const res = await fetch(
      `${wpJson}/wp/v2/posts?per_page=1&_fields=id&status=publish`,
      { next: { revalidate: 3600 } }
    )

    if (!res.ok) {
      return new NextResponse('Failed to fetch post count', { status: 502 })
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
  } catch {
    return new NextResponse('Error generating sitemap index', { status: 500 })
  }
}
