import { NextResponse } from 'next/server'
import { cachedFetchAPI } from '@app/actions/fetchAPI'
import { query } from '@app/actions/getRecentPosts/query'
import {
  CMS_NAME,
  CMS_URL,
  PAGE_DESCRIPTION,
  TIME_REVALIDATE
} from '@lib/constants'
import { cleanExcerpt } from '@lib/utils/cleanExcerpt'

export const revalidate = 900 // 15 min

const ITEMS = 30

type FeedNode = {
  title?: string
  excerpt?: string
  uri?: string
  date?: string
  id?: string
  featuredImage?: { node?: { sourceUrl?: string } }
  categories?: { edges?: { node?: { name?: string } }[] }
}

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const stripTags = (value: string): string => value.replace(/<[^>]{0,512}>/g, '')

export async function GET() {
  const data = await cachedFetchAPI<{ posts: { edges: { node: FeedNode }[] } }>(
    {
      query,
      variables: { qty: ITEMS, offset: 0 },
      revalidate: TIME_REVALIDATE.MINUTE * 15,
      tags: ['feed']
    }
  )

  const edges = data?.posts?.edges ?? []

  if (edges.length === 0) {
    return new NextResponse('Feed temporarily unavailable', { status: 503 })
  }

  const items = edges
    .map(({ node }) => {
      const link = `${CMS_URL}${node.uri ?? '/'}`
      const description = stripTags(cleanExcerpt(node.excerpt)).trim()
      const category = node.categories?.edges?.[0]?.node?.name
      const image = node.featuredImage?.node?.sourceUrl

      return [
        '    <item>',
        `      <title>${escapeXml(node.title ?? '')}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
        node.date
          ? `      <pubDate>${new Date(node.date).toUTCString()}</pubDate>`
          : '',
        description
          ? `      <description>${escapeXml(description)}</description>`
          : '',
        category ? `      <category>${escapeXml(category)}</category>` : '',
        image
          ? `      <enclosure url="${escapeXml(image)}" type="image/jpeg" />`
          : '',
        '    </item>'
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(CMS_NAME)}</title>
    <link>${CMS_URL}</link>
    <description>${escapeXml(PAGE_DESCRIPTION)}</description>
    <language>es-VE</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${CMS_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=900, s-maxage=900'
    }
  })
}
