import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text
} from 'drizzle-orm/sqlite-core'
import type { HomeV2Data } from '@lib/homeV2/types'

// Separate versioned deployment keys; never stores a reader/session identifier.
export const homeSnapshots = sqliteTable('home_v2_snapshots', {
  cacheKey: text('cache_key').primaryKey(),
  payload: text('payload', { mode: 'json' }).$type<HomeV2Data>(),
  fetchedAt: integer('fetched_at'),
  requestedRevision: integer('requested_revision').notNull().default(0),
  appliedRevision: integer('applied_revision').notNull().default(0),
  snapshotRevision: integer('snapshot_revision').notNull().default(0),
  invalidatedRevision: integer('invalidated_revision').notNull().default(0),
  dueAt: integer('due_at'),
  leaseToken: text('lease_token'),
  leaseUntil: integer('lease_until').notNull().default(0),
  claimedRevision: integer('claimed_revision').notNull().default(0),
  lastAttemptAt: integer('last_attempt_at').notNull().default(0)
})

export const reactions = sqliteTable(
  'reactions',
  {
    postSlug: text('post_slug').notNull(),
    reaction: text('reaction').notNull(),
    count: integer('count').notNull().default(0),
    updatedAt: text('updated_at').notNull(),
    postDate: text('post_date')
  },
  table => [
    primaryKey({ columns: [table.postSlug, table.reaction] }),
    index('reactions_slug_idx').on(table.postSlug),
    index('reactions_reaction_date_idx').on(table.reaction, table.postDate)
  ]
)
