import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Direct Postgres connection to the Supabase project shared with
// ncol-legales — used only for ncol_tag_subscriptions. Auth itself still
// goes through @lib/supabase/* (session cookies), never through here.
const connectionString = process.env.SUPABASE_DATABASE_URL!

const globalForDb = global as unknown as {
  client: postgres.Sql | undefined
}

export const client =
  globalForDb.client ?? postgres(connectionString, { prepare: false })

if (process.env.NODE_ENV !== 'production') {
  globalForDb.client = client
}

export const db = drizzle(client, { schema })
