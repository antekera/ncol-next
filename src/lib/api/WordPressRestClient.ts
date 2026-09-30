import * as Sentry from '@sentry/nextjs'
import { log } from '@logtail/next'

const MAX_PER_PAGE = 100

export type WordPressNewsPost = {
  link: string
  date_gmt: string
  title: { rendered: string }
}

export class WordPressRestClient {
  private readonly apiUrl: string

  constructor(apiUrl?: string) {
    const explicit =
      [
        apiUrl,
        process.env.WORDPRESS_JSON_URL,
        process.env.NEXT_PUBLIC_WORDPRESS_JSON_URL
      ]
        .find(value => value?.trim())
        ?.trim() ?? ''

    this.apiUrl = explicit
      ? explicit.replace(/\/$/, '')
      : (process.env.WORDPRESS_API_URL ?? '')
          .trim()
          .replace(/\/graphql\/?$/, '/wp-json')
  }

  async getRecentNewsPosts(
    after: string,
    limit: number
  ): Promise<WordPressNewsPost[] | null> {
    if (!this.apiUrl) {
      log.error('WordPressRestClient: REST API URL is not defined')
      return null
    }

    const url = new URL(`${this.apiUrl}/wp/v2/posts`)
    url.searchParams.set(
      'per_page',
      String(Math.min(Math.max(limit, 1), MAX_PER_PAGE))
    )
    url.searchParams.set('status', 'publish')
    url.searchParams.set('after', after)
    url.searchParams.set('orderby', 'date')
    url.searchParams.set('order', 'desc')
    url.searchParams.set('_fields', 'link,date_gmt,title')

    const user = process.env.WP_USER
    const password = process.env.WP_PASSWORD
    const credentials =
      user && password
        ? Buffer.from(`${user}:${password}`).toString('base64')
        : null
    const headers: HeadersInit = credentials
      ? {
          Authorization: `Basic ${credentials}`
        }
      : {}

    try {
      const response = await fetch(url, {
        headers,
        cache: 'no-store',
        signal: AbortSignal.timeout(8000)
      })

      if (!response.ok) {
        log.error('WordPressRestClient: News posts request failed', {
          status: response.status
        })
        return null
      }

      return (await response.json()) as WordPressNewsPost[]
    } catch (error) {
      Sentry.captureException(error)
      return null
    }
  }
}
