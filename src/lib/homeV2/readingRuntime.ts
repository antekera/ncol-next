import { GAEvent } from '@lib/utils/ga'
import {
  articlePath,
  createReadingSession,
  READING_INACTIVITY_MS,
  READING_STORAGE_KEY,
  safeReadingOrigin,
  type ReadingOrigin
} from './reading'

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> &
  Partial<Pick<Storage, 'key' | 'length'>>
type Exclusive = <T>(action: () => T) => Promise<T>
const PREFIX = 'ncol:home-v2-origin:v2:'
type Pending = { at: number; path: string; context: ReadingOrigin }

/** Approved-state coordination, not an analytics transport or reader identity. */
export function createReadingRuntime({
  allowed = false,
  storage,
  exclusive,
  now = Date.now
}: {
  allowed?: boolean
  storage?: Store | null
  exclusive?: Exclusive
  now?: () => number
} = {}) {
  let permitted = allowed
  let shared = !!storage && !!exclusive
  let memory = createReadingSession({ allowed, now })
  const guardedStorage = storage
    ? {
        getItem(key: string) {
          try {
            return storage.getItem(key)
          } catch (error) {
            shared = false
            throw error
          }
        },
        setItem(key: string, value: string) {
          try {
            storage.setItem(key, value)
          } catch (error) {
            shared = false
            throw error
          }
        },
        removeItem(key: string) {
          try {
            storage.removeItem(key)
          } catch (error) {
            shared = false
            throw error
          }
        }
      }
    : undefined
  const origins = new Map<string, Pending>()
  const keys = () =>
    Array.from({ length: storage?.length ?? 0 }, (_, index) =>
      storage?.key?.(index)
    ).filter((key): key is string => !!key?.startsWith(PREFIX))
  const clear = () => {
    origins.clear()
    try {
      storage?.removeItem(READING_STORAGE_KEY)
      for (const key of keys()) storage?.removeItem(key)
    } catch {
      /* Optional storage. */
    }
  }
  const validPending = (raw: string | null, path: string): Pending | null => {
    try {
      const value: unknown = JSON.parse(raw ?? 'null')
      if (
        !value ||
        typeof value !== 'object' ||
        !('at' in value) ||
        typeof value.at !== 'number' ||
        value.at > now() ||
        now() - value.at >= READING_INACTIVITY_MS ||
        !('context' in value)
      )
        return null
      const context = safeReadingOrigin(value.context)
      return context ? { at: value.at, path, context } : null
    } catch {
      return null
    }
  }
  const pending = (path: string) => {
    if (shared) {
      try {
        const key = PREFIX + encodeURIComponent(path)
        const result = validPending(storage!.getItem(key), path)
        if (!result) storage!.removeItem(key)
        return result
      } catch {
        shared = false
      }
    }
    const value = origins.get(path)
    return value && now() - value.at < READING_INACTIVITY_MS ? value : null
  }
  const persistOrigin = (value: Pending) => {
    if (!shared) return
    try {
      const all = keys()
      for (const key of all) {
        const path = decodeURIComponent(key.slice(PREFIX.length))
        if (!validPending(storage!.getItem(key), path)) storage!.removeItem(key)
      }
      for (const key of keys().slice(0, Math.max(0, keys().length - 49)))
        storage!.removeItem(key)
      // One atomic write before a click can navigate/unload the source document.
      storage!.setItem(
        PREFIX + encodeURIComponent(value.path),
        JSON.stringify(value)
      )
    } catch {
      shared = false
    }
  }
  const transact = async <T>(
    action: (session: ReturnType<typeof createReadingSession>) => T
  ): Promise<T | null> => {
    const run = () => {
      if (!permitted) return null
      let session = shared
        ? createReadingSession({ allowed: true, storage: guardedStorage, now })
        : memory
      if (!shared) session = memory
      const result = action(session)
      memory = session
      return result
    }
    if (!permitted) return null
    if (!shared || !exclusive) return run()
    let started = false
    try {
      return await exclusive(() => {
        started = true
        return run()
      })
    } catch {
      shared = false
      return started ? null : run()
    }
  }
  const open = (
    session: ReturnType<typeof createReadingSession>,
    destination: string,
    id: string
  ) => {
    const path = articlePath(destination)
    if (!path) return null
    const source = pending(path)
    if (source) session.rememberClick(path, source.context)
    const result = session.openArticle(path, id)
    if (!result) return null
    if (result.newArticle)
      GAEvent({
        ...result.context,
        action: 'ARTICLE_DESTINATION_OPEN',
        category: 'READING',
        label: 'VISIBLE_ARTICLE',
        non_interaction: true
      })
    if (result.secondArticle)
      GAEvent({
        ...result.context,
        action: 'SECOND_ARTICLE_OPEN',
        category: 'READING',
        label: 'SECOND_DISTINCT_ARTICLE',
        first_article_id: result.firstArticleId,
        non_interaction: true
      })
    return result
  }
  return {
    setAllowed(next: boolean) {
      if (next === permitted) return
      permitted = next
      clear()
      memory = createReadingSession({ allowed: next, now })
    },
    remember(destination: string, rawOrigin: ReadingOrigin) {
      if (!permitted) return
      const path = articlePath(destination)
      const context = safeReadingOrigin(rawOrigin)
      if (!path || !context) return
      const value = { path, context, at: now() }
      origins.set(path, value)
      if (origins.size > 50) origins.delete(origins.keys().next().value!)
      memory.rememberClick(path, context)
      persistOrigin(value)
    },
    open(destination: string, id: string) {
      return transact(session => open(session, destination, id))
    },
    active(destination: string, id: string, elapsedMs: number) {
      return transact(session => {
        const opened = open(session, destination, id)
        if (!opened) return null
        const engagement = session.addActiveReading(destination, elapsedMs)
        if (engagement)
          GAEvent({
            ...engagement,
            action: 'ARTICLE_ENGAGEMENT',
            category: 'READING',
            label: 'ACTIVE_BODY',
            non_interaction: false
          })
        return { engaged: session.hasEngaged(id) }
      })
    },
    activity() {
      return transact(session => session.activity())
    },
    mode() {
      return shared ? 'shared' : 'memory'
    },
    hasContext(destination: string) {
      if (!permitted) return false
      const path = articlePath(destination)
      if (!path) return false
      if (pending(path)) return true
      const session = shared
        ? createReadingSession({ allowed: true, storage: guardedStorage, now })
        : memory
      return session.hasAttribution()
    }
  }
}
