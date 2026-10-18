import { isReadingTextVisible, isUncovered, type Box } from './occlusion'
import { watchVisibility } from './visibilityChecks'
import type { createReadingRuntime } from './readingRuntime'

type Runtime = Pick<
  ReturnType<typeof createReadingRuntime>,
  'hasContext' | 'open' | 'active' | 'activity'
>
const ROOT = '[data-reading-article-id][data-reading-uri]'
const own = (root: Element, selector: string) =>
  [...root.querySelectorAll<HTMLElement>(selector)].filter(
    node => node.closest(ROOT) === root
  )
type ReadingRecord = {
  uri: string
  id: string
  heading?: HTMLElement
  text: HTMLElement[]
  targets: HTMLElement[]
  intersecting: Set<Element>
  stop?: () => void
  since: number | null
  last: number | null
  bodyBefore: boolean
  opened: boolean
  engaged: boolean
  pendingMs: number
  touched: number
}
function readArticle(root: HTMLElement) {
  const bodies = own(root, '[data-reading-body]')
  const text = bodies
    .flatMap(body => [
      ...body.querySelectorAll<HTMLElement>('p, li, blockquote, h2, h3')
    ])
    .filter(
      node =>
        node.closest(ROOT) === root &&
        !node.closest(
          'nav, aside, [data-ad-container], [data-home-occluder], [role="dialog"]'
        ) &&
        (node.textContent?.trim().length ?? 0) >= 40
    )
  const heading = own(root, '[data-reading-heading]').find(
    node => !node.closest('[data-reading-body], aside, nav')
  )
  return { text, heading, targets: [...(heading ? [heading] : []), ...bodies] }
}

/** Destination exposure only: does not emit or replace the existing page view. */
export function mountReadingDom(runtime: Runtime) {
  if (typeof IntersectionObserver === 'undefined') return () => {}
  const records = new Map<HTMLElement, ReadingRecord>()
  const targetRoots = new Map<Element, HTMLElement>()
  const foreground = () =>
    document.visibilityState === 'visible' && document.hasFocus()
  const flush = (record: ReadingRecord) => {
    const elapsed = Math.min(5000, record.pendingMs)
    record.pendingMs = 0
    if (elapsed > 0 && !record.engaged)
      void runtime.active(record.uri, record.id, elapsed).then(result => {
        if (result?.engaged) record.engaged = true
      })
  }
  const geometry = (record: ReadingRecord, blockers: Box[]) => {
    const body = record.text.some(node => isReadingTextVisible(node, blockers))
    return {
      body,
      visible:
        body || !!(record.heading && isUncovered(record.heading, blockers))
    }
  }
  const arm = (root: HTMLElement) => {
    const record = records.get(root)
    if (
      !record ||
      record.stop ||
      !record.intersecting.size ||
      !foreground() ||
      !runtime.hasContext(record.uri)
    )
      return
    record.stop = watchVisibility({
      element: record.heading ?? record.targets[0],
      isAffected: blockers => !geometry(record, blockers).visible,
      check(blockers, reset) {
        const now = Date.now()
        const { body, visible } = geometry(record, blockers)
        if (reset || !foreground() || !root.isConnected || !visible) {
          flush(record)
          record.since = null
          record.last = null
          record.bodyBefore = false
          return
        }
        record.since ??= now
        if (!record.opened && now - record.since >= 1000) {
          record.opened = true
          void runtime.open(record.uri, record.id)
        }
        if (
          record.opened &&
          body &&
          record.bodyBefore &&
          record.last !== null
        ) {
          const elapsed = now - record.last
          if (elapsed > 0 && elapsed <= 5000) record.pendingMs += elapsed
          if (record.pendingMs >= 5000) flush(record)
        }
        if (record.engaged && body && now - record.touched >= 60000) {
          record.touched = now
          void runtime.activity()
        }
        record.last = now
        record.bodyBefore = body
      }
    })
  }
  const pause = (root: HTMLElement) => {
    const record = records.get(root)
    if (!record) return
    record.stop?.()
    record.stop = undefined
    flush(record)
    record.since = null
    record.last = null
    record.bodyBefore = false
  }
  const observer = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        const root = targetRoots.get(entry.target)
        const record = root && records.get(root)
        if (!root || !record) continue
        if (entry.isIntersecting) record.intersecting.add(entry.target)
        else record.intersecting.delete(entry.target)
        if (record.intersecting.size) arm(root)
        else pause(root)
      }
    },
    { threshold: 0, rootMargin: '0px' }
  )
  const removeDetached = () => {
    for (const [root, record] of records) {
      if (
        !root.isConnected ||
        root.dataset.readingArticleId !== record.id ||
        root.dataset.readingUri !== record.uri
      ) {
        pause(root)
        for (const target of record.targets) {
          observer.unobserve(target)
          targetRoots.delete(target)
        }
        records.delete(root)
      }
    }
  }
  const observeTargets = (root: HTMLElement, targets: HTMLElement[]) => {
    for (const target of targets) {
      targetRoots.set(target, root)
      observer.observe(target)
    }
  }
  const updateRecord = (
    root: HTMLElement,
    existing: ReadingRecord,
    next: ReturnType<typeof readArticle>
  ) => {
    if (existing.heading !== next.heading) pause(root)
    for (const target of existing.targets) {
      if (next.targets.includes(target)) continue
      observer.unobserve(target)
      targetRoots.delete(target)
      existing.intersecting.delete(target)
    }
    observeTargets(
      root,
      next.targets.filter(target => !existing.targets.includes(target))
    )
    Object.assign(existing, next)
    if (existing.intersecting.size) arm(root)
    else pause(root)
  }
  const reconcile = () => {
    removeDetached()
    for (const root of document.querySelectorAll<HTMLElement>(ROOT)) {
      const next = readArticle(root)
      const existing = records.get(root)
      if (existing) {
        updateRecord(root, existing, next)
        continue
      }
      if (!next.targets.length) continue
      records.set(root, {
        uri: root.dataset.readingUri!,
        id: root.dataset.readingArticleId!,
        ...next,
        intersecting: new Set(),
        since: null,
        last: null,
        bodyBefore: false,
        opened: false,
        engaged: false,
        pendingMs: 0,
        touched: Date.now()
      })
      observeTargets(root, next.targets)
    }
  }
  const stateChanged = () => {
    for (const root of records.keys()) {
      pause(root)
      if (foreground()) arm(root)
    }
  }
  const storageChanged = () => {
    for (const root of records.keys()) arm(root)
  }
  const mutations = new MutationObserver(reconcile)
  mutations.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['data-reading-article-id', 'data-reading-uri']
  })
  document.addEventListener('visibilitychange', stateChanged)
  window.addEventListener('blur', stateChanged)
  window.addEventListener('focus', stateChanged)
  window.addEventListener('storage', storageChanged)
  reconcile()
  return () => {
    mutations.disconnect()
    for (const root of records.keys()) pause(root)
    observer.disconnect()
    document.removeEventListener('visibilitychange', stateChanged)
    window.removeEventListener('blur', stateChanged)
    window.removeEventListener('focus', stateChanged)
    window.removeEventListener('storage', storageChanged)
  }
}
