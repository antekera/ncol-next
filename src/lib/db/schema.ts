import {
  pgSchema,
  pgTable,
  text,
  timestamp,
  uuid,
  unique,
  index
} from 'drizzle-orm/pg-core'

// auth.users lives in Supabase's own "auth" schema, managed by Supabase
// Auth itself (shared with ncol-legales, same project) — declared here
// only so ncol_tag_subscriptions can reference it. Not owned by this repo.
const authSchema = pgSchema('auth')
export const authUsers = authSchema.table('users', {
  id: uuid('id').primaryKey()
})

// Suscripciones de lectores de noticiascol.com a tags de WordPress, para
// notificarles por push (ver /api/webhooks/wp-publish) cuando se publique
// un post con ese tag. Vive en ncol-next — no en ncol-legales — porque los
// tags son un concepto del sitio de noticias, no de avisos legales. Ambos
// repos comparten el mismo proyecto Supabase, así que esta tabla se
// conecta directo a esa Postgres sin pasar por ningún otro servicio.
export const ncolTagSubscriptions = pgTable(
  'ncol_tag_subscriptions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => authUsers.id, { onDelete: 'cascade' })
      .notNull(),
    tagSlug: text('tag_slug').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  table => [
    unique().on(table.userId, table.tagSlug),
    // The composite unique index above leads with user_id, so it can't be
    // used to seek by tag_slug alone — needed for the recipients lookup
    // (WHERE tag_slug IN (...)) on every post publish.
    index('ncol_tag_subscriptions_tag_slug_idx').on(table.tagSlug)
  ]
)
