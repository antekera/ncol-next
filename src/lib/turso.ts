import { createClient } from '@libsql/client'

export const tursoViews = createClient({
  url: process.env.TURSO_DB_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!
})

export const tursoDolar = createClient({
  url: process.env.TURSO_DOLAR_DB_URL!,
  authToken: process.env.TURSO_DOLAR_AUTH_TOKEN!
})
