export type Box = Pick<DOMRectReadOnly, 'left' | 'right' | 'top' | 'bottom'>

const area = (box: Box) =>
  Math.max(0, box.right - box.left) * Math.max(0, box.bottom - box.top)
const intersect = (a: Box, b: Box): Box => ({
  left: Math.max(a.left, b.left),
  right: Math.min(a.right, b.right),
  top: Math.max(a.top, b.top),
  bottom: Math.min(a.bottom, b.bottom)
})

/** Rectangle union by vertical slabs: overlapping overlays cover pixels once. */
function coveredArea(box: Box, blockers: Box[]) {
  const clipped = blockers
    .map(blocker => intersect(box, blocker))
    .filter(rect => area(rect) > 0)
  const edges = [
    ...new Set(clipped.flatMap(rect => [rect.left, rect.right]))
  ].sort((a, b) => a - b)
  let covered = 0
  for (let index = 1; index < edges.length; index++) {
    const left = edges[index - 1]
    const right = edges[index]
    const intervals = clipped
      .filter(rect => rect.left <= left && rect.right >= right)
      .sort((a, b) => a.top - b.top)
    let bottom = -Infinity
    let height = 0
    for (const rect of intervals) {
      height += Math.max(0, rect.bottom - Math.max(bottom, rect.top))
      bottom = Math.max(bottom, rect.bottom)
    }
    covered += (right - left) * height
  }
  return covered
}

export function uncoveredFraction(target: Box, clip: Box, blockers: Box[]) {
  const total = area(target)
  if (!total) return 0
  const visible = intersect(target, clip)
  return Math.max(0, area(visible) - coveredArea(visible, blockers)) / total
}

export const OCCLUDER_SELECTOR =
  '[data-home-occluder], [data-slot="dialog-overlay"], [data-slot="alert-dialog-overlay"], [data-slot="dialog-content"], [data-slot="alert-dialog-content"]'

function paints(style: CSSStyleDeclaration, includeTransparent = false) {
  return (
    style.display !== 'none' &&
    style.contentVisibility !== 'hidden' &&
    !['hidden', 'collapse'].includes(style.visibility) &&
    (includeTransparent || style.opacity === '' || Number(style.opacity) > 0)
  )
}

function painted(element: Element, includeTransparent = false) {
  if (element.matches('[data-home-occluder^="ad-"][aria-hidden="true"]'))
    return false
  for (let node: Element | null = element; node; node = node.parentElement)
    if (!paints(getComputedStyle(node), includeTransparent)) return false
  return element.isConnected
}

export function readOccluders(includeTransparent = false): Box[] {
  return Array.from(document.querySelectorAll(OCCLUDER_SELECTOR))
    .filter(element => painted(element, includeTransparent))
    .map(element => element.getBoundingClientRect())
    .filter(box => area(box) > 0)
}

function clipParent(
  parent: HTMLElement,
  style: CSSStyleDeclaration,
  clip: Box
) {
  const clipsX = /^(auto|scroll|hidden|clip)$/.test(
    style.overflowX || style.overflow
  )
  const clipsY = /^(auto|scroll|hidden|clip)$/.test(
    style.overflowY || style.overflow
  )
  if (!clipsX && !clipsY) return clip
  const bounds = parent.getBoundingClientRect()
  const scaleX = parent.offsetWidth ? bounds.width / parent.offsetWidth : 1
  const scaleY = parent.offsetHeight ? bounds.height / parent.offsetHeight : 1
  const left = bounds.left + parent.clientLeft * scaleX
  const top = bounds.top + parent.clientTop * scaleY
  return intersect(clip, {
    left: clipsX ? left : clip.left,
    right: clipsX ? left + parent.clientWidth * scaleX : clip.right,
    top: clipsY ? top : clip.top,
    bottom: clipsY ? top + parent.clientHeight * scaleY : clip.bottom
  })
}

/** Fresh viewport/scroll-container geometry; never use a stale IO rectangle. */
export function isUncovered(element: Element, blockers: Box[]) {
  if (!element.isConnected) return false
  const target = element.getBoundingClientRect()
  let clip: Box = {
    left: 0,
    top: 0,
    right: window.innerWidth,
    bottom: window.innerHeight
  }
  // A full overlay needs no repeated ancestor style reads for each candidate.
  if (
    uncoveredFraction(target, clip, blockers) < 0.5 ||
    !paints(getComputedStyle(element))
  )
    return false
  for (
    let parent = element.parentElement;
    parent;
    parent = parent.parentElement
  ) {
    const style = getComputedStyle(parent)
    if (!paints(style)) return false
    clip = clipParent(parent, style, clip)
  }
  return uncoveredFraction(target, clip, blockers) >= 0.5
}
