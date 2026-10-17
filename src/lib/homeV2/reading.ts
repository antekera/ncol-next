import { CMS_URL } from '@lib/constants'
import { canonicalPath } from '@lib/siteUrl'
import type { HomeViewContext, EditorialPlacement } from './measurement'
import type { HomeEventContext } from './measurementContext'

type Origin = HomeViewContext & EditorialPlacement
type StorageAccess = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
type Destination = {
  path: string
  id: string
  context: Origin
  activeMs: number
}
interface Snapshot {
  updatedAt: number
  pending: { path: string; context: Origin } | null
  current: Destination | null
  opened: { path: string; id: string }[]
  engaged: string[]
  secondSent: boolean
}
const KEY = 'ncol:home-v2-reading:v1'
const INACTIVITY_MS = 30 * 60 * 1000
const empty = (now: number): Snapshot => ({
  updatedAt: now,
  pending: null,
  current: null,
  opened: [],
  engaged: [],
  secondSent: false
})
const object = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

/** Only public dated article paths, with all query/hash/credentials discarded. */
function articlePath(value: string): string | null {
  try {
    const url = new URL(value, CMS_URL)
    if (
      !['www.noticiascol.com', 'noticiascol.com'].includes(url.hostname) ||
      url.username ||
      url.password
    )
      return null
    if (!/^\/\d{4}\/\d{2}\/\d{2}\/[^/]+\/?$/.test(url.pathname)) return null
    return canonicalPath(url.pathname)
  } catch {
    return null
  }
}
const publicId = (value: unknown): value is string =>
  typeof value === 'string' &&
  (/^[A-Za-z0-9+/_=-]{1,160}$/.test(value) || articlePath(value) === value)
const slug = (value: unknown): value is string =>
  typeof value === 'string' && /^[a-z0-9_-]{1,100}$/.test(value)
function openingTreatment(
  value: unknown
): HomeViewContext['opening_treatment'] {
  if (value === 'photographic') return 'photographic'
  if (value === 'traditional') return 'traditional'
  return 'current'
}
function safeOrigin(value: unknown): Origin | null {
  if (
    !object(value) ||
    value.experiment_id !== 'home_v2' ||
    !['control', 'v2'].includes(String(value.home_variant))
  )
    return null
  if (
    !slug(value.home_view_id) ||
    !['current', 'photographic', 'traditional'].includes(
      String(value.opening_treatment)
    )
  )
    return null
  if (
    !slug(value.module_id) ||
    !Number.isSafeInteger(value.editorial_position) ||
    Number(value.editorial_position) < 1
  )
    return null
  return {
    experiment_id: 'home_v2',
    home_variant: value.home_variant === 'v2' ? 'v2' : 'control',
    home_view_id: value.home_view_id,
    opening_treatment: openingTreatment(value.opening_treatment),
    module_id: value.module_id,
    editorial_position: Number(value.editorial_position),
    item_position:
      Number.isSafeInteger(value.item_position) &&
      Number(value.item_position) > 0
        ? Number(value.item_position)
        : undefined,
    article_id: publicId(value.article_id) ? value.article_id : undefined,
    section_id: slug(value.section_id) ? value.section_id : undefined,
    component_type: slug(value.component_type)
      ? value.component_type
      : undefined,
    region_id: slug(value.region_id) ? value.region_id : undefined
  }
}
function readPending(value: unknown): Snapshot['pending'] {
  const pending = object(value) ? value : null
  const origin = safeOrigin(pending?.context)
  const path =
    typeof pending?.path === 'string' ? articlePath(pending.path) : null
  return path && origin ? { path, context: origin } : null
}
function readCurrent(value: unknown): Destination | null {
  const current = object(value) ? value : null
  const currentOrigin = safeOrigin(current?.context)
  const currentPath =
    typeof current?.path === 'string' ? articlePath(current.path) : null
  if (currentPath && currentOrigin && publicId(current?.id))
    return {
      path: currentPath,
      id: current.id,
      context: currentOrigin,
      activeMs:
        typeof current.activeMs === 'number' && current.activeMs >= 0
          ? Math.min(current.activeMs, 30000)
          : 0
    }
  return null
}
function readOpened(value: unknown): Snapshot['opened'] {
  const opened: Snapshot['opened'] = []
  if (Array.isArray(value))
    for (const entry of value.slice(0, 50)) {
      if (
        object(entry) &&
        typeof entry.path === 'string' &&
        articlePath(entry.path) === entry.path &&
        publicId(entry.id)
      )
        opened.push({ path: entry.path, id: entry.id })
    }
  return opened
}
function restore(raw: string | null, now: number): Snapshot {
  const state = empty(now)
  if (!raw) return state
  const parsed: unknown = JSON.parse(raw)
  if (
    !object(parsed) ||
    typeof parsed.updatedAt !== 'number' ||
    now - parsed.updatedAt >= INACTIVITY_MS ||
    parsed.updatedAt > now
  )
    return state
  state.updatedAt = parsed.updatedAt
  state.pending = readPending(parsed.pending)
  state.current = readCurrent(parsed.current)
  state.opened = readOpened(parsed.opened)
  if (Array.isArray(parsed.engaged))
    state.engaged = parsed.engaged
      .filter(
        (entry): entry is string =>
          typeof entry === 'string' && articlePath(entry) === entry
      )
      .slice(0, 50)
  state.secondSent = parsed.secondSent === true
  return state
}

/** Attribution state only: no user ID, cookies, new transport or inferred consent.
 * The existing consent integration must explicitly allow this before activation.
 */
export function createReadingSession({
  allowed = false,
  storage,
  now = Date.now
}: { allowed?: boolean; storage?: StorageAccess; now?: () => number } = {}) {
  let permitted = allowed
  let state = empty(now())
  const load = () => {
    try {
      state = restore(storage?.getItem(KEY) ?? null, now())
    } catch {
      state = empty(now())
    }
  }
  if (permitted) load()
  const persist = () => {
    try {
      storage?.setItem(KEY, JSON.stringify(state))
    } catch {
      /* memory-only coverage if storage is denied */
    }
  }
  const ready = () => {
    if (!permitted) return false
    if (now() - state.updatedAt >= INACTIVITY_MS) state = empty(now())
    return true
  }
  const touch = () => {
    state.updatedAt = now()
    persist()
  }
  return {
    setAllowed(next: boolean) {
      if (next === permitted) return
      permitted = next
      state = empty(now())
      // A late grant starts fresh; do not replay exposures from earlier permission.
      try {
        storage?.removeItem(KEY)
      } catch {
        /* memory was cleared even if persisted storage becomes inaccessible */
      }
    },
    rememberClick(destination: string, context: Origin) {
      if (!ready()) return
      const path = articlePath(destination)
      const origin = safeOrigin(context)
      if (!path || !origin) return
      state.pending = { path, context: origin }
      touch()
    },
    openArticle(destination: string, id: string) {
      if (!ready() || !publicId(id)) return null
      const path = articlePath(destination)
      if (!path) return null
      const pending = state.pending?.path === path ? state.pending : null
      const context = pending?.context ?? state.current?.context
      if (!context) return null
      // A pending click cannot attribute another article until its own destination opens.
      if (state.pending && !pending && !state.current) return null
      state.pending = null
      const previous = state.current
      state.current = {
        path,
        id,
        context: { ...context, article_id: id },
        activeMs: previous?.path === path ? previous.activeMs : 0
      }
      if (!state.opened.some(article => article.path === path))
        state.opened.push({ path, id })
      const secondArticle = state.opened.length >= 2 && !state.secondSent
      if (secondArticle) state.secondSent = true
      touch()
      return {
        context: state.current.context,
        secondArticle,
        firstArticleId: state.opened[0].id
      }
    },
    addActiveReading(
      destination: string,
      elapsedMs: number
    ): HomeEventContext | null {
      if (
        !ready() ||
        !Number.isFinite(elapsedMs) ||
        elapsedMs <= 0 ||
        elapsedMs > 5000
      )
        return null
      const path = articlePath(destination)
      const current = state.current
      if (!path || current?.path !== path) return null
      if (state.engaged.includes(path)) {
        touch()
        return null
      }
      current.activeMs += elapsedMs
      touch()
      if (current.activeMs < 30000) return null
      state.engaged.push(path)
      persist()
      return {
        ...current.context,
        active_reading_seconds: Math.floor(current.activeMs / 1000)
      }
    }
  }
}
