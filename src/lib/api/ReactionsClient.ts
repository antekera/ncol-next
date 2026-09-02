import { HttpClient } from '@lib/httpClient'
import type { ReactionCounts, ReactionKey } from '@lib/reactions'

// Modular client for the internal reactions API. Owns the endpoint URLs
// and the request/response contracts so UI code doesn't have to.
//
// HttpClient never throws — it resolves with `{ error }` on network/HTTP
// failures — so this client normalizes that into a real throw. Consumers
// can rely on a plain try/catch to detect a failed vote (which matters
// for optimistic UI rollback and to avoid writing localStorage on error).
export class ReactionsClient {
  constructor(private client: HttpClient) {}

  async getCounts(slug: string): Promise<ReactionCounts> {
    const res = await this.client.get<{ counts: ReactionCounts }>(
      `/api/reactions/?slug=${encodeURIComponent(slug)}`,
      { revalidate: 0 }
    )
    if (res.error || !res.data?.counts) {
      throw new Error(
        res.error?.message || `Failed to fetch reactions (${res.status})`
      )
    }
    return res.data.counts
  }

  async vote(input: {
    slug: string
    reaction: ReactionKey
    prev?: ReactionKey
    postDate?: string
  }): Promise<ReactionCounts> {
    const res = await this.client.post<{ counts: ReactionCounts }>(
      '/api/reactions/',
      {
        slug: input.slug,
        reaction: input.reaction,
        prev: input.prev,
        postDate: input.postDate
      }
    )
    if (res.error || !res.data?.counts) {
      throw new Error(
        res.error?.message || `Failed to submit reaction (${res.status})`
      )
    }
    return res.data.counts
  }
}
