import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text
} from 'drizzle-orm/sqlite-core'

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
