import {
  OCCLUDER_SELECTOR,
  isUncovered,
  readOccluders,
  type Box
} from './occlusion'

type Candidate = {
  element: Element
  check: (blockers: Box[], reset: boolean) => void
}
const candidates = new Set<Candidate>()
let poll: ReturnType<typeof setInterval> | undefined
let mutations: MutationObserver | undefined
let previousBounds: Box[] = []

function notify(reset = false) {
  const blockers = readOccluders()
  previousBounds = readOccluders(true)
  for (const candidate of [...candidates]) candidate.check(blockers, reset)
}
const scrolled = () => notify()
const resized = () => notify(true)
const owned = (node: Node) =>
  node instanceof Element && node.closest(OCCLUDER_SELECTOR) !== null
const carriesOverlay = (node: Node) =>
  owned(node) ||
  (node instanceof Element && node.querySelector(OCCLUDER_SELECTOR) !== null)

function changed(records: MutationRecord[]) {
  const overlayChanged = records.some(
    record =>
      record.attributeName === 'data-home-occluder' ||
      owned(record.target) ||
      [...record.addedNodes, ...record.removedNodes].some(carriesOverlay)
  )
  const blockers = readOccluders()
  const currentBounds = readOccluders(true)
  // Include previous geometry for removal and transparent animation entry.
  const changedBounds = [...previousBounds, ...currentBounds]
  previousBounds = currentBounds
  for (const candidate of [...candidates]) {
    const ancestorChanged = records.some(
      record =>
        record.type === 'attributes' &&
        record.target instanceof Element &&
        record.target.contains(candidate.element)
    )
    const affected =
      overlayChanged && !isUncovered(candidate.element, changedBounds)
    candidate.check(blockers, affected || ancestorChanged)
  }
}

/** One pool for currently intersecting candidates, no offscreen polling. */
export function watchVisibility(candidate: Candidate) {
  candidates.add(candidate)
  previousBounds = readOccluders(true)
  if (candidates.size === 1) {
    poll = setInterval(scrolled, 100)
    mutations = new MutationObserver(changed)
    mutations.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: [
        'class',
        'style',
        'hidden',
        'aria-hidden',
        'data-state',
        'data-home-occluder'
      ]
    })
    window.addEventListener('scroll', scrolled, {
      capture: true,
      passive: true
    })
    window.addEventListener('resize', resized)
  }
  candidate.check(readOccluders(), false)
  return () => {
    candidates.delete(candidate)
    if (candidates.size) return
    clearInterval(poll)
    poll = undefined
    mutations?.disconnect()
    mutations = undefined
    previousBounds = []
    window.removeEventListener('scroll', scrolled, true)
    window.removeEventListener('resize', resized)
  }
}
