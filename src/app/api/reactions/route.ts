/**
 * Reactions API — BuzzFeed-style sentiment voting per post.
 *
 * GET  /api/reactions?slug=/section/2024/01/post-slug
 *   → { counts: Record<ReactionKey, number> }
 *
 * POST /api/reactions
 *   body: {
 *     slug: string,
 *     reaction: ReactionKey,
 *     prev?: ReactionKey,
 *     postDate?: string   // ISO date of the post (not the reaction)
 *   }
 *   → { counts: Record<ReactionKey, number> }
 *
 *   `prev` is used when a user changes their vote: the previous reaction is
 *   decremented (floored at 0) and the new one is incremented in the same
 *   batch. Client dedup lives in localStorage; the server trusts the
 *   `prev`/`reaction` pair but validates both are known keys.
 *
 *   `postDate` is written only when a row is first created. Subsequent
 *   votes ignore whatever the client sends, so a stale/hostile client
 *   can't rewrite history and skew time-windowed rankings.
 *
 * Storage: same Turso DB as `visits` (tursoViews), table `reactions`.
 */

import { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { and, eq, sql } from 'drizzle-orm'
import { tursoDb } from '@lib/db/turso'
import { reactions } from '@lib/db/tursoSchema'
import {
  emptyReactionCounts,
  isReactionKey,
  type ReactionCounts,
  type ReactionKey
} from '@lib/reactions'

const jsonError = (status: number, error: string) =>
  new Response(JSON.stringify({ error }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })

async function readCounts(slug: string): Promise<ReactionCounts> {
  const result = await tursoDb
    .select({ reaction: reactions.reaction, count: reactions.count })
    .from(reactions)
    .where(eq(reactions.postSlug, slug))

  const counts = emptyReactionCounts()
  for (const row of result) {
    const reaction = row.reaction
    const count = Number(row.count ?? 0)
    if (isReactionKey(reaction)) {
      // Safe: `reaction` is proven to be a ReactionKey (fixed literal union).

      counts[reaction] = count
    }
  }
  return counts
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')?.trim()
  if (!slug) {
    return jsonError(400, 'Missing slug')
  }

  try {
    const counts = await readCounts(slug)
    return Response.json({ counts })
  } catch (err) {
    Sentry.captureException(err)
    return jsonError(500, 'Database error')
  }
}

const toIsoDate = (value: unknown): string | null => {
  if (typeof value !== 'string' || !value) return null
  const ts = Date.parse(value)
  if (Number.isNaN(ts)) return null
  return new Date(ts).toISOString()
}

export async function POST(req: NextRequest) {
  let slug: unknown
  let reaction: unknown
  let prev: unknown
  let postDate: unknown

  try {
    const body = await req.json()
    slug = body?.slug
    reaction = body?.reaction
    prev = body?.prev
    postDate = body?.postDate
  } catch (err) {
    Sentry.captureException(err)
    return jsonError(400, 'Invalid or missing JSON body')
  }

  if (typeof slug !== 'string' || !slug) {
    return jsonError(400, 'Invalid payload types or missing fields')
  }
  if (!isReactionKey(reaction)) {
    return jsonError(400, 'Invalid reaction')
  }
  if (prev !== undefined && prev !== null && !isReactionKey(prev)) {
    return jsonError(400, 'Invalid prev reaction')
  }

  const now = new Date().toISOString()
  const prevKey: ReactionKey | null = isReactionKey(prev) ? prev : null
  const reactionKey: ReactionKey = reaction
  const shouldSwap = prevKey !== null && prevKey !== reactionKey
  // Optional; only stamped on INSERT via COALESCE. Malformed dates are dropped
  // silently — we'd rather have a null post_date than corrupt ranking queries.
  const postDateIso = toIsoDate(postDate)

  try {
    await tursoDb.transaction(async tx => {
      if (shouldSwap && prevKey) {
        // Floor at 0 so a stale localStorage `prev` can't drive the count
        // negative. No-op if the row doesn't exist yet.
        await tx
          .update(reactions)
          .set({
            count: sql`MAX(${reactions.count} - 1, 0)`,
            updatedAt: now
          })
          .where(
            and(eq(reactions.postSlug, slug), eq(reactions.reaction, prevKey))
          )
      }

      await tx
        .insert(reactions)
        .values({
          postSlug: slug,
          reaction: reactionKey,
          count: 1,
          updatedAt: now,
          postDate: postDateIso
        })
        .onConflictDoUpdate({
          target: [reactions.postSlug, reactions.reaction],
          set: {
            count: sql`${reactions.count} + 1`,
            updatedAt: now,
            postDate: sql`COALESCE(${reactions.postDate}, excluded.post_date)`
          }
        })
    })

    const counts = await readCounts(slug)
    return Response.json({ counts })
  } catch (err) {
    Sentry.captureException(err)
    return jsonError(500, 'Database error')
  }
}
