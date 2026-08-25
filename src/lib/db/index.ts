import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Direct Postgres connection to the Supabase project shared with
// ncol-legales — used only for ncol_tag_subscriptions. Auth itself still
// goes through @lib/supabase/* (session cookies), never through here.

const globalForDb = global as unknown as {
  client: postgres.Sql | undefined
  db: ReturnType<typeof drizzle<typeof schema>> | undefined
}

const getClient = (): postgres.Sql => {
  if (globalForDb.client) return globalForDb.client
  const connectionString = (process.env.SUPABASE_DATABASE_URL ?? '').trim()
  if (!connectionString) {
    throw new Error('Missing SUPABASE_DATABASE_URL environment variable')
  }
  const client = postgres(connectionString, { prepare: false })
  if (process.env.NODE_ENV !== 'production') {
    globalForDb.client = client
  }
  return client
}

const getDb = (): ReturnType<typeof drizzle<typeof schema>> => {
  if (!globalForDb.db) {
    globalForDb.db = drizzle(getClient(), { schema })
  }
  return globalForDb.db
}

// Lazy proxy — postgres() / drizzle() only run on first real query, so
// build-time page data collection doesn't require a valid DB URL.
type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>

export const db: DrizzleDb = new Proxy({} as DrizzleDb, {
  get(_target, prop) {
    const instance = getDb()
    const value = (instance as unknown as Record<string | symbol, unknown>)[
      prop
    ]
    return typeof value === 'function' ? value.bind(instance) : value
  }
})

export const client: postgres.Sql = new Proxy({} as postgres.Sql, {
  get(_target, prop) {
    const instance = getClient()
    const value = (instance as unknown as Record<string | symbol, unknown>)[
      prop
    ]
    return typeof value === 'function' ? value.bind(instance) : value
  }
})
