import * as Sentry from '@sentry/nextjs'

// Modular client for ncol-legales' internal tag-subscriptions API. The
// caller (route handlers under src/app/api/tags and
// src/app/api/webhooks/wp-publish) is responsible for resolving the
// Supabase user id — this client only carries requests across the wire,
// authenticated with a server-to-server shared secret.
export class NcolLegalesClient {
  private baseUrl: string
  private secret: string

  constructor() {
    this.baseUrl = (process.env.NCOL_LEGALES_API_URL || '').replace(/\/$/, '')
    this.secret = process.env.NCOL_INTERNAL_API_SECRET || ''
  }

  private headers(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'x-internal-secret': this.secret
    }
  }

  async getSubscriptionStatus(
    userId: string,
    tagSlug: string
  ): Promise<boolean | null> {
    try {
      const res = await fetch(
        `${this.baseUrl}/api/internal/tag-subscriptions?userId=${encodeURIComponent(userId)}&tagSlug=${encodeURIComponent(tagSlug)}`,
        { headers: this.headers(), cache: 'no-store' }
      )
      if (!res.ok) return null
      const data = await res.json()
      return Boolean(data.subscribed)
    } catch (error) {
      Sentry.captureException(error, {
        tags: { client: 'NcolLegalesClient', method: 'getSubscriptionStatus' }
      })
      return null
    }
  }

  async subscribe(userId: string, tagSlug: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/internal/tag-subscriptions`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({ userId, tagSlug })
      })
      return res.ok
    } catch (error) {
      Sentry.captureException(error, {
        tags: { client: 'NcolLegalesClient', method: 'subscribe' }
      })
      return false
    }
  }

  async unsubscribe(userId: string, tagSlug: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/internal/tag-subscriptions`, {
        method: 'DELETE',
        headers: this.headers(),
        body: JSON.stringify({ userId, tagSlug })
      })
      return res.ok
    } catch (error) {
      Sentry.captureException(error, {
        tags: { client: 'NcolLegalesClient', method: 'unsubscribe' }
      })
      return false
    }
  }

  /**
   * Deduplicated user ids subscribed to any of the given tag slugs — used
   * when a post publishes with multiple tags so a reader following more
   * than one gets exactly one push.
   */
  async getTagSubscribers(tagSlugs: string[]): Promise<string[]> {
    const res = await fetch(
      `${this.baseUrl}/api/internal/tag-subscriptions/recipients`,
      {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({ tagSlugs })
      }
    )

    if (!res.ok) {
      throw new Error(`ncol-legales recipients lookup failed: HTTP ${res.status}`)
    }

    const data = await res.json()
    return Array.isArray(data.userIds) ? data.userIds : []
  }
}

export const ncolLegalesClient = new NcolLegalesClient()
