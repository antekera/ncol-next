import { createClient } from '@libsql/client'

export const turso = createClient({
  url: process.env.TURSO_DB_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!
})
