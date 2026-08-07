import { createClient, Client } from '@libsql/client/web'

let _tursoViews: Client | null = null

/**
 * Creates the private views client only when a route needs it. This keeps a
 * malformed deployment environment from crashing route module initialization
 * before the route can return a useful service response.
 */
export const getTursoViews = (): Client => {
  if (!_tursoViews) {
    const url = process.env.TURSO_DB_URL?.trim()
    const authToken = process.env.TURSO_AUTH_TOKEN?.trim()
    if (!url || !authToken) {
      throw new Error(
        'Missing TURSO_DB_URL or TURSO_AUTH_TOKEN environment variables'
      )
    }
    _tursoViews = createClient({ url, authToken })
  }
  return _tursoViews
}

/** Retry a single transient database failure without retrying configuration errors. */
export async function withTursoRetry<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const isTransient =
      /(?:HTTP status 502|HTTP status 503|failed to fetch|networkerror)/i.test(
        message
      )
    if (!isTransient) throw error

    return operation()
  }
}

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
