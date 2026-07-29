import * as Sentry from '@sentry/nextjs'

type AllowedCategory = { slug: string; name: string }

export type AuthorInfoResult =
  | { ok: true; name: string; slug: string; categories: AllowedCategory[] }
  | { ok: false; reason: 'config' | 'unauthorized' | 'no_categories' | 'error' }

export type PublishArticlePayload = {
  title: string
  content: string
  authorToken: string
  category: string
  termsVersion: string
  acceptedAt: string
  submittedBy: string
  featuredMediaId?: number
}

export type PublishArticleResult = {
  post: {
    id: number
    slug: string
    url?: string
    publishedAt?: string
    author: { id: number; slug: string; name: string }
  }
  postStatus: string
  success: boolean
}

export class OpinionClient {
  private readonly endpoint: string
  private readonly secret: string

  constructor() {
    this.endpoint = process.env.WORDPRESS_OPINION_API_URL ?? ''
    this.secret = process.env.WORDPRESS_OPINION_API_SECRET ?? ''
  }

  get isConfigured(): boolean {
    return this.endpoint !== '' && this.secret !== ''
  }

  async getAuthorInfo(token: string): Promise<AuthorInfoResult> {
    if (!this.isConfigured) return { ok: false, reason: 'config' }

    const authorUrl = this.endpoint.replace(/\/articles$/, '/author')
    try {
      const res = await fetch(
        `${authorUrl}?token=${encodeURIComponent(token)}`,
        { headers: { 'X-Opinion-Secret': this.secret }, cache: 'no-store' }
      )
      if (!res.ok) return { ok: false, reason: 'unauthorized' }

      const data = await res.json()
      const categories: AllowedCategory[] = Array.isArray(
        data.allowedCategories
      )
        ? data.allowedCategories
        : []

      if (categories.length === 0) return { ok: false, reason: 'no_categories' }

      return {
        ok: true,
        name: data.name ?? '',
        slug: data.slug ?? '',
        categories
      }
    } catch (err) {
      Sentry.captureException(err)
      return { ok: false, reason: 'error' }
    }
  }

  async publishArticle(
    payload: PublishArticlePayload
  ): Promise<{ data: PublishArticleResult; status: number } | null> {
    if (!this.isConfigured) return null
    try {
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'X-Opinion-Secret': this.secret,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        cache: 'no-store'
      })
      const data = await res.json()
      return { data, status: res.status }
    } catch (err) {
      Sentry.captureException(err)
      return null
    }
  }
}
