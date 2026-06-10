import { createClient } from '@libsql/client/web'

export const tursoViewsPublic = createClient({
  url: process.env.NEXT_PUBLIC_TURSO_VIEWS_URL!,
  authToken: process.env.NEXT_PUBLIC_TURSO_VIEWS_TOKEN!
})
