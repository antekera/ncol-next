import type { MostVisitedApiResponse } from '@lib/types'
import { articlePath } from './articlePath'

export type HomeRankingPost = MostVisitedApiResponse['posts'][number] & {
  homeArticleId?: string | null
}

async function rankingArticleId(uri: string): Promise<string | null> {
  const path = articlePath(uri)
  if (!path) return null
  // Preserve the existing short URI convention. GA4 custom values allow 100
  // characters; a full public-path digest keeps long stories distinguishable.
  if (path.length <= 100) return path
  try {
    const digest = await globalThis.crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(path)
    )
    return `uri_${Array.from(new Uint8Array(digest), byte =>
      byte.toString(16).padStart(2, '0')
    ).join('')}`
  } catch {
    // Preserve navigation when Web Crypto is unavailable; never invent or
    // truncate an identity, nor send an over-limit raw URI instead.
    return null
  }
}

// Prepare before SWR exposes the rows: visibility/click listeners must see the
// final identity from their first observation. API and navigation stay intact.
export async function prepareRankingPosts<T extends { slug: string }>(
  posts: readonly T[]
): Promise<(T & { homeArticleId: string | null })[]> {
  return Promise.all(
    posts.map(async post => ({
      ...post,
      homeArticleId: await rankingArticleId(post.slug)
    }))
  )
}
