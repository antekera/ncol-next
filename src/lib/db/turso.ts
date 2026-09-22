import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql'
import { getTursoViews } from '@lib/turso'
import * as schema from './tursoSchema'

type TursoDb = LibSQLDatabase<typeof schema>

let instance: TursoDb | null = null

const getTursoDb = (): TursoDb => {
  if (!instance) {
    instance = drizzle({ client: getTursoViews(), schema })
  }
  return instance
}

// Keep Turso connection creation lazy so build-time page data collection does
// not require database environment variables.
export const tursoDb: TursoDb = new Proxy({} as TursoDb, {
  get(_target, prop) {
    const db = getTursoDb()
    const value = (db as unknown as Record<string | symbol, unknown>)[prop]
    return typeof value === 'function' ? value.bind(db) : value
  }
})
