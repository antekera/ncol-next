import { createClient, Client } from '@libsql/client/web'

const toHttpsUrl = (url: string | undefined): string =>
  (url ?? '').trim().replace(/^libsql:\/\//, 'https://')

const lazyClient = (
  urlEnv: string,
  tokenEnv: string,
  label: string
): (() => Client) => {
  let instance: Client | null = null
  return () => {
    if (!instance) {
      const url = toHttpsUrl(process.env[urlEnv])
      const authToken = (process.env[tokenEnv] ?? '').trim()
      if (!url || !authToken) {
        throw new Error(
          `Missing ${urlEnv} or ${tokenEnv} environment variables (${label})`
        )
      }
      instance = createClient({ url, authToken })
    }
    return instance
  }
}

export const getTursoViews = lazyClient(
  'TURSO_DB_URL',
  'TURSO_AUTH_TOKEN',
  'views'
)
const getTursoDolar = lazyClient(
  'TURSO_DOLAR_DB_URL',
  'TURSO_DOLAR_AUTH_TOKEN',
  'dolar'
)
export const getTursoHoroscopo = lazyClient(
  'TURSO_HOROSCOPO_DB_URL',
  'TURSO_HOROSCOPO_AUTH_TOKEN',
  'horoscopo'
)

const TURSO_MAX_ATTEMPTS = 3

/** Retry transient database failures without retrying configuration errors. */
export async function withTursoRetry<T>(
  operation: () => Promise<T>
): Promise<T> {
  for (let attempt = 1; attempt <= TURSO_MAX_ATTEMPTS; attempt += 1) {
    try {
      return await operation()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const isTransient =
        /(?:HTTP status 502|HTTP status 503|failed to fetch|networkerror)/i.test(
          message
        )
      if (!isTransient || attempt === TURSO_MAX_ATTEMPTS) throw error
    }
  }

  throw new Error('Turso retry attempts exhausted')
}

// Proxy exports preserve the previous import surface (tursoViews.execute(...))
// while deferring createClient() to first use — so build-time page data
// collection doesn't require valid URLs.
const makeProxy = (getter: () => Client): Client =>
  new Proxy({} as Client, {
    get(_target, prop) {
      const client = getter()
      const value = (client as unknown as Record<string | symbol, unknown>)[
        prop
      ]
      return typeof value === 'function' ? value.bind(client) : value
    }
  })

export const tursoViews = makeProxy(getTursoViews)
export const tursoDolar = makeProxy(getTursoDolar)
// Alias for backward compatibility
export const tursoNcol = tursoDolar
