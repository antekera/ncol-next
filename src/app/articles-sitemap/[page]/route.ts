import { NextResponse } from 'next/server'
import { CMS_URL } from '@lib/constants'

export const revalidate = 3600

const PER_PAGE = 100

function getWpJsonBase() {
  return (process.env.WORDPRESS_API_URL ?? '')
    .trim()
    .replace(/\/graphql\/?$/, '/wp-json')
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
    return new NextResponse('WORDPRESS_API_URL not configured', { status: 500 })
  }

  try {
    const res = await fetch(
      `${wpJson}/wp/v2/posts?per_page=${PER_PAGE}&page=${pageNum}&_fields=link,modified&status=publish&orderby=modified&order=desc`,
      { next: { revalidate: 3600 } }
    )

    if (res.status === 400) {
      return new NextResponse('Page out of range', { status: 404 })
    }

    if (!res.ok) {
      return new NextResponse('Failed to fetch posts', { status: 502 })
    }

    const posts: WpPost[] = await res.json()

    const urls = posts
      .map(post => {
        // Convert WP URL (noticiascol.com/slug/) → frontend URL (www.noticiascol.com/slug/)
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
  } catch {
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}
