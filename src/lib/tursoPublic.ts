import { createClient } from '@libsql/client/web'

const url = (process.env.NEXT_PUBLIC_TURSO_VIEWS_URL ?? '')
  .trim()
  .replace(/^libsql:\/\//, 'https://')

export const tursoViewsPublic = createClient({
  url,
  authToken: process.env.NEXT_PUBLIC_TURSO_VIEWS_TOKEN!
})
