import { createClient, Client } from '@libsql/client/web'

export const tursoViews = createClient({
  url: process.env.TURSO_DB_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!
})

// Dolar database client
export const tursoDolar = createClient({
  url: process.env.TURSO_DOLAR_DB_URL!,
  authToken: process.env.TURSO_DOLAR_AUTH_TOKEN!
})

// Horoscopo database client (lazy-initialized to avoid crashes when env vars are missing)
let _tursoHoroscopo: Client | null = null
export const getTursoHoroscopo = (): Client => {
  if (!_tursoHoroscopo) {
    const url = process.env.TURSO_HOROSCOPO_DB_URL!
    const authToken = process.env.TURSO_HOROSCOPO_AUTH_TOKEN!
    if (!url || !authToken) {
      throw new Error(
        'Missing TURSO_HOROSCOPO_DB_URL or TURSO_HOROSCOPO_AUTH_TOKEN environment variables'
      )
    }
    _tursoHoroscopo = createClient({ url, authToken })
  }
  return _tursoHoroscopo
}

// Alias for backward compatibility
export const tursoNcol = tursoDolar
