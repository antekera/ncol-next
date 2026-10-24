import { GAEvent } from '@lib/utils/ga'
import { isAdDemoMode } from '@lib/adDemo'
import type { HomeViewContext } from './measurement'
import type { HomeEventContext } from './measurementContext'

const names = ['LCP', 'INP', 'CLS'] as const
const ratings = ['good', 'needs-improvement', 'poor'] as const
const navigations = [
  'navigate',
  'reload',
  'prerender',
  'back-forward',
  'restore',
  'soft-navigation',
  'back-forward-cache'
] as const
type Scope = 'document' | 'soft-navigation' | 'back-forward-cache'
type Role = 'editorial' | 'advertisement' | 'other' | 'unknown'
type Environment = NonNullable<HomeEventContext['web_vital_environment']>
interface Sample {
  name: (typeof names)[number]
  rating: (typeof ratings)[number]
  navigation: (typeof navigations)[number]
  scope: Scope
  start: number
  navigationId: number
  id: string
  value: number
  role: Role
}
interface Navigation {
  home: boolean
  kind: Scope
  start: number
  environment: Environment
  context?: HomeViewContext
}
interface Group {
  sample: Sample
  owner?: Navigation
  ignored?: boolean
  previous?: number
  revision: number
}

const oneOf = <T extends string>(
  options: readonly T[],
  value: unknown
): value is T => options.some(option => option === value)
const nonnegative = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0

function lcpRole(entries: unknown): Role {
  if (!Array.isArray(entries)) return 'unknown'
  const entry: unknown = entries.at(-1)
  if (
    !entry ||
    typeof entry !== 'object' ||
    !('element' in entry) ||
    !(entry.element instanceof Element)
  )
    return 'unknown'
  const element = entry.element
  if (
    element.closest(
      '[data-ncol-slot], [data-ad-demo-slot], [data-home-occluder="ad-sticky"], [data-home-occluder="ad-popup"], .bloque-adv'
    )
  )
    return 'advertisement'
  return element.closest('[data-article-id]') ? 'editorial' : 'other'
}

function isHomeSource(url: unknown, scope: Scope): boolean {
  if (typeof url !== 'string') return false
  try {
    const source = new URL(url)
    return (
      source.origin === window.location.origin &&
      !source.username &&
      !source.password &&
      !isAdDemoMode(source.searchParams) &&
      (scope === 'back-forward-cache' || source.pathname === '/')
    )
  } catch {
    return false
  }
}

function readSample(input: unknown): Sample | undefined {
  if (!input || typeof input !== 'object') return
  const value = input as Record<string, unknown>
  if (
    !oneOf(names, value.name) ||
    !oneOf(ratings, value.rating) ||
    !oneOf(navigations, value.navigationType) ||
    !nonnegative(value.value)
  )
    return
  if (
    typeof value.id !== 'string' ||
    !/^v\d+-\d{10,16}-\d{8,16}$/.test(value.id)
  )
    return
  if (
    !nonnegative(value.navigationStartTime) ||
    !nonnegative(value.navigationId) ||
    !Number.isSafeInteger(value.navigationId)
  )
    return
  const scope =
    value.navigationType === 'soft-navigation' ||
    value.navigationType === 'back-forward-cache'
      ? value.navigationType
      : 'document'
  if (scope !== 'document' && value.navigationStartTime <= 0) return
  if (scope === 'soft-navigation' && value.navigationId <= 0) return
  if (!isHomeSource(value.navigationURL, scope)) return
  return {
    name: value.name,
    rating: value.rating,
    navigation: value.navigationType,
    scope,
    start: value.navigationStartTime,
    navigationId: value.navigationId,
    id: value.id,
    value: value.value,
    role: value.name === 'LCP' ? lcpRole(value.entries) : 'unknown'
  }
}

/** Native framework samples, attributed by their navigation rather than report time.
 * No observers, identifiers, storage or transport are created here.
 */
export function createHomeVitals() {
  let documentOwner: Navigation | undefined
  const history: Navigation[] = []
  let evictedThrough = -Infinity
  const groups = new Map<string, Group>()
  const resolve = (sample: Sample) => {
    if (sample.scope === 'document') return documentOwner
    if (sample.start <= evictedThrough) return
    return history.find(
      record =>
        record.kind === sample.scope &&
        (sample.scope === 'back-forward-cache'
          ? record.start === sample.start
          : record.start >= sample.start)
    )
  }
  const flush = (group: Group) => {
    if (group.ignored) return
    group.owner ??= resolve(group.sample)
    const owner = group.owner
    if (!owner) return
    if (!owner.home) {
      group.ignored = true
      return
    }
    if (!owner.context || group.previous === group.sample.value) return
    const sample = group.sample
    group.revision++
    const delta = sample.value - (group.previous ?? 0)
    group.previous = sample.value
    GAEvent({
      ...owner.context,
      action: 'WEB_VITAL',
      category: 'WEB_VITALS',
      label: sample.name,
      non_interaction: true,
      module_id: 'home',
      component_type: 'home_vitals',
      web_vital_name: sample.name,
      web_vital_value: sample.value,
      web_vital_delta: delta,
      web_vital_id: sample.id,
      web_vital_revision: group.revision,
      web_vital_unit: sample.name === 'CLS' ? 'score' : 'ms',
      web_vital_rating: sample.rating,
      web_vital_navigation: sample.navigation,
      web_vital_scope: sample.scope,
      web_vital_environment: owner.environment,
      ...(sample.name === 'LCP' ? { lcp_element_role: sample.role } : {})
    })
  }
  const flushPending = () => {
    for (const group of groups.values()) flush(group)
  }
  const trimGroups = () => {
    if (groups.size <= 256) return
    for (const [oldKey, old] of groups) {
      if (old.sample.scope !== 'document') {
        groups.delete(oldKey)
        return
      }
    }
  }
  return {
    navigation(
      pathname: string,
      startedAt: number,
      restored = false,
      environment: Environment = 'local-qa'
    ) {
      let kind: Scope = documentOwner ? 'soft-navigation' : 'document'
      if (restored) kind = 'back-forward-cache'
      const record: Navigation = {
        home: pathname === '/',
        kind,
        environment,
        start: restored || documentOwner ? startedAt : 0
      }
      if (!documentOwner && !restored) documentOwner = record
      else {
        history.push(record)
        if (history.length > 50) {
          const evicted = history.shift()!
          evictedThrough = Math.max(evictedThrough, evicted.start)
        }
      }
      flushPending()
      return {
        bind(context: HomeViewContext) {
          const pending = !record.context
          record.context = { ...context }
          if (pending) flushPending()
        }
      }
    },
    report(input: unknown) {
      const sample = readSample(input)
      if (!sample) return
      const key = JSON.stringify([
        sample.scope,
        sample.scope === 'document' ? 0 : sample.start,
        sample.scope === 'soft-navigation' ? sample.navigationId : 0,
        sample.name
      ])
      let group = groups.get(key)
      if (group && group.sample.id !== sample.id) return
      if (!group) {
        group = { sample, revision: 0 }
        groups.set(key, group)
        trimGroups()
      } else group.sample = sample
      flush(group)
    }
  }
}

const homeVitals = createHomeVitals()

function measurementEnvironment(): Environment | undefined {
  const { homeVersion, homeVitalsEnvironment, homeMeasurementQa } =
    document.body.dataset
  if (homeVersion === 'v2') {
    if (
      homeVitalsEnvironment === 'production' ||
      homeVitalsEnvironment === 'preview' ||
      homeVitalsEnvironment === 'local'
    )
      return homeVitalsEnvironment
    return
  }
  if (homeMeasurementQa === 'true') return 'local-qa'
}

export function beginHomeVitalsNavigation(
  pathname: string,
  restoredAt?: number
) {
  const environment = measurementEnvironment()
  if (!environment) return
  return homeVitals.navigation(
    pathname,
    restoredAt ?? performance.now(),
    restoredAt !== undefined,
    environment
  )
}
/** Stable callback for the one root-layout Next.js hook, never a template hook. */
export function reportHomeWebVital(metric: unknown) {
  if (measurementEnvironment()) homeVitals.report(metric)
}
