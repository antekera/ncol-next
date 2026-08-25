import { createClient, Client } from '@libsql/client/web'

let _client: Client | null = null

const getClient = (): Client => {
  if (!_client) {
    const url = (process.env.NEXT_PUBLIC_TURSO_VIEWS_URL ?? '')
      .trim()
      .replace(/^libsql:\/\//, 'https://')
    const authToken = (process.env.NEXT_PUBLIC_TURSO_VIEWS_TOKEN ?? '').trim()
    if (!url || !authToken) {
      throw new Error(
        'Missing NEXT_PUBLIC_TURSO_VIEWS_URL or NEXT_PUBLIC_TURSO_VIEWS_TOKEN'
      )
    }
    _client = createClient({ url, authToken })
  }
  return _client
}

export const tursoViewsPublic: Client = new Proxy({} as Client, {
  get(_target, prop) {
    const client = getClient()
    const value = (client as unknown as Record<string | symbol, unknown>)[prop]
    return typeof value === 'function' ? value.bind(client) : value
  }
})
