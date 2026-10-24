import { articlePath } from './articlePath'
export { articlePath } from './articlePath'
import type { HomeViewContext, EditorialPlacement } from './measurement'
import type { HomeEventContext } from './measurementContext'

export type ReadingOrigin = HomeViewContext &
  EditorialPlacement &
  Pick<HomeEventContext, 'origin_article_id'>
type StorageAccess = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
type Destination = {
  path: string
  id: string
  context: ReadingOrigin
  activeMs: number
}
interface Snapshot {
  updatedAt: number
  pending: { path: string; context: ReadingOrigin } | null
  current: Destination | null
  destinations: Destination[]
  opened: { path: string; id: string }[]
  engaged: string[]
  secondSent: boolean
}
export const READING_STORAGE_KEY = 'ncol:home-v2-reading:v3'
export const READING_INACTIVITY_MS = 30 * 60 * 1000
const KEY = READING_STORAGE_KEY
const INACTIVITY_MS = READING_INACTIVITY_MS
const empty = (now: number): Snapshot => ({
  updatedAt: now,
  pending: null,
  current: null,
  destinations: [],
  opened: [],
  engaged: [],
  secondSent: false
})
const object = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

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
export function safeReadingOrigin(value: unknown): ReadingOrigin | null {
  if (
    !object(value) ||
    !['current', 'v2'].includes(String(value.home_version)) ||
    'experiment_id' in value ||
    'home_variant' in value
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
  const articleId = publicId(value.article_id) ? value.article_id : undefined
  const originArticleId = publicId(value.origin_article_id)
    ? value.origin_article_id
    : articleId
  return {
    home_version: value.home_version === 'v2' ? 'v2' : 'current',
    home_view_id: value.home_view_id,
    opening_treatment: openingTreatment(value.opening_treatment),
    module_id: value.module_id,
    editorial_position: Number(value.editorial_position),
    item_position:
      Number.isSafeInteger(value.item_position) &&
      Number(value.item_position) > 0
        ? Number(value.item_position)
        : undefined,
    article_id: articleId,
    origin_article_id: originArticleId,
    section_id: slug(value.section_id) ? value.section_id : undefined,
    component_type: slug(value.component_type)
      ? value.component_type
      : undefined,
    region_id: slug(value.region_id) ? value.region_id : undefined
  }
}
const safeOrigin = safeReadingOrigin
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
  if (Array.isArray(parsed.destinations))
    state.destinations = parsed.destinations
      .map(readCurrent)
      .filter((value): value is Destination => value !== null)
      .slice(-50)
  if (
    state.current &&
    !state.destinations.some(item => item.id === state.current?.id)
  )
    state.destinations.push(state.current)
  state.opened = readOpened(parsed.opened)
  if (Array.isArray(parsed.engaged))
    state.engaged = parsed.engaged.filter(publicId).slice(0, 50)
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
  const rememberCurrent = () => {
    if (!state.current) return
    state.destinations = [
      ...state.destinations.filter(item => item.id !== state.current?.id),
      state.current
    ].slice(-50)
  }
  return {
    activity() {
      if (ready() && (state.current || state.pending)) touch()
    },
    hasAttribution() {
      return ready() && !!(state.current || state.pending)
    },
    hasEngaged(id: string) {
      return ready() && state.engaged.includes(id)
    },
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
    rememberClick(destination: string, context: ReadingOrigin) {
      if (!ready()) return
      const path = articlePath(destination)
      const origin = safeOrigin(context)
      if (!path || !origin) return
      state.pending = {
        path,
        context: { ...origin, origin_article_id: origin.article_id }
      }
      touch()
    },
    openArticle(destination: string, id: string) {
      if (!ready() || !publicId(id)) return null
      const path = articlePath(destination)
      if (!path) return null
      const pending = state.pending?.path === path ? state.pending : null
      const known = state.opened.find(
        article => article.path === path || article.id === id
      )
      const stableId = id
      const previous =
        state.destinations.find(article => article.id === stableId) ??
        state.current
      const context =
        pending?.context ??
        (previous?.id === stableId ? previous.context : state.current?.context)
      if (!context) return null
      // A pending click cannot attribute another article until its own destination opens.
      if (state.pending && !pending && !state.current) return null
      state.pending = null
      state.current = {
        path,
        id: stableId,
        context: { ...context, article_id: stableId },
        activeMs: previous?.id === stableId ? previous.activeMs : 0
      }
      rememberCurrent()
      const newArticle = !known
      if (newArticle) state.opened.push({ path, id: stableId })
      const secondArticle = state.opened.length >= 2 && !state.secondSent
      if (secondArticle) state.secondSent = true
      touch()
      return {
        context: state.current.context,
        newArticle,
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
      if (state.engaged.includes(current.id)) {
        touch()
        return null
      }
      current.activeMs += elapsedMs
      rememberCurrent()
      touch()
      if (current.activeMs < 30000) return null
      state.engaged.push(current.id)
      persist()
      return {
        ...current.context,
        active_reading_seconds: Math.floor(current.activeMs / 1000)
      }
    }
  }
}
