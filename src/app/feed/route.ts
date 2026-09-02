import { NextResponse } from 'next/server'
import {
  CMS_URL,
  FILTERED_CATEGORIES,
  HOME_PAGE_TITLE,
  PAGE_DESCRIPTION
} from '@lib/constants'
import { fetchAPI } from '@app/actions/fetchAPI'

export const revalidate = 86400

const FEED_QUERY = `
  query RssFeed {
    posts(first: 50, where: { orderby: { field: DATE, order: DESC }, status: PUBLISH }) {
      edges {
        node {
          title
          uri
          date
          modified
          excerpt
          author {
            node {
              name
            }
          }
          categories {
            edges {
              node {
                name
                slug
                parentId
              }
            }
          }
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
      }
    }
  }
`

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&hellip;/g, '…')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&nbsp;/g, ' ')
}

function cleanExcerpt(html: string): string {
  // eslint-disable-next-line sonarjs/slow-regex -- input is trusted WP content, not user input
  const stripped = html.replace(/<[^>]*>/g, '').trim()
  // Remove WordPress "more" continuation marker e.g. [&hellip;] or […]
  return decodeHtmlEntities(stripped)
    .replace(/\[…\]/g, '')
    .replace(/\[&hellip;\]/g, '')
    .trim()
}

type Post = {
  title: string
  uri: string
  date: string
  modified: string
  excerpt: string
  author: { node: { name: string } }
  categories: {
    edges: { node: { name: string; slug: string; parentId: string | null } }[]
  }
  featuredImage: { node: { sourceUrl: string; altText: string } } | null
}

export async function GET() {
  const data = await fetchAPI<{ posts: { edges: { node: Post }[] } }>({
    query: FEED_QUERY
  })

  if (!data?.posts?.edges?.length) {
    return new NextResponse('Feed temporarily unavailable', {
      status: 503,
      headers: { 'Cache-Control': 'no-store' }
    })
  }

  const posts = data.posts.edges.map(e => e.node)
  const buildDate = new Date().toUTCString()

  const items = posts
    .map(post => {
      const url = `${CMS_URL}${post.uri}`
      const pubDate = new Date(post.date).toUTCString()
      const excerpt = cleanExcerpt(post.excerpt || '')
      const editorialCategory = post.categories.edges.find(
        e =>
          e.node.parentId !== null && !FILTERED_CATEGORIES.includes(e.node.slug)
      )
      const categoryName = editorialCategory?.node?.name ?? ''
      const image = post.featuredImage?.node

      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(excerpt)}</description>
      <dc:creator>${escapeXml(post.author?.node?.name ?? 'Noticiascol')}</dc:creator>
      ${categoryName ? `<category>${escapeXml(categoryName)}</category>` : ''}
      ${image ? `<enclosure url="${escapeXml(image.sourceUrl)}" type="image/jpeg" length="0" />` : ''}
      ${image ? `<media:content url="${escapeXml(image.sourceUrl)}" medium="image"><media:title type="html">${escapeXml(image.altText || post.title)}</media:title></media:content>` : ''}
    </item>`
    })
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(HOME_PAGE_TITLE)}</title>
    <link>${CMS_URL}</link>
    <description>${escapeXml(PAGE_DESCRIPTION)}</description>
    <language>es-ve</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${CMS_URL}/feed/" rel="self" type="application/rss+xml" />
    <image>
      <url>${CMS_URL}/favicon.ico</url>
      <title>${escapeXml(HOME_PAGE_TITLE)}</title>
      <link>${CMS_URL}</link>
    </image>
    ${items}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400'
    }
  })
}
