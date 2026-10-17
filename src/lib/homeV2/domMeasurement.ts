import type { createHomeMeasurement, EditorialPlacement } from './measurement'
import { observeVisible } from './visibility'

type Measurement = ReturnType<typeof createHomeMeasurement>
const CONTENT_SELECTOR =
  '[data-article-id], [data-service-id], [data-rate-ready="true"]'
const hasEditorialContent = (section: HTMLElement) =>
  section.matches(CONTENT_SELECTOR) ||
  section.querySelector(CONTENT_SELECTOR) !== null
const readPlacement = (
  element: HTMLElement,
  moduleMarker = false
): EditorialPlacement => {
  const section = element.closest<HTMLElement>('section[data-module-id]')
  const marker = moduleMarker || element.hasAttribute('data-module-marker')
  const card = marker ? null : element.closest<HTMLElement>('[data-article-id]')
  const component = element.closest<HTMLElement>('[data-component-type]')
  return {
    module_id: section?.dataset.moduleId,
    editorial_position: Number(section?.dataset.editorialPosition),
    article_id: card?.dataset.articleId,
    item_position: card ? Number(card.dataset.itemPosition) : undefined,
    component_type: marker ? undefined : component?.dataset.componentType,
    section_id: card?.dataset.sectionId,
    region_id: section?.dataset.regionId,
    service_id:
      element.closest<HTMLElement>('[data-service-id]')?.dataset.serviceId
  }
}

/** One delegated click listener and visibility observers for an active exposure.
 * Mount only on an eligible measured Home; this function never starts an A/B.
 */
export function mountHomeMeasurement(
  root: HTMLElement,
  measurement: Measurement,
  { enrichExistingClicks = false }: { enrichExistingClicks?: boolean } = {}
): () => void {
  const observed = new Map<
    HTMLElement,
    { identity: string; stop: () => void }
  >()
  let stopped = false
  const reconcile = () => {
    if (stopped) return
    const targets = new Map<HTMLElement, boolean>()
    for (const card of root.querySelectorAll<HTMLElement>('[data-article-id]'))
      targets.set(card, false)
    for (const section of root.querySelectorAll<HTMLElement>(
      'section[data-module-id]'
    )) {
      // Empty feeds/skeletons are not editorial impressions. Header exposure is
      // explicitly separate from card exposure and never implies all cards read.
      if (!hasEditorialContent(section)) continue
      const marker = section.querySelector<HTMLElement>(
        '[data-module-marker], h1, h2'
      )
      if (marker && marker.getBoundingClientRect().height <= 200)
        targets.set(marker, true)
    }
    for (const [element, record] of observed) {
      if (
        !targets.has(element) ||
        record.identity !==
          JSON.stringify(readPlacement(element, targets.get(element)))
      ) {
        record.stop()
        observed.delete(element)
      }
    }
    for (const [target, moduleMarker] of targets) {
      if (observed.has(target)) continue
      observed.set(target, {
        identity: JSON.stringify(readPlacement(target, moduleMarker)),
        stop: observeVisible(target, () =>
          measurement.impression(readPlacement(target, moduleMarker))
        )
      })
    }
  }
  const click = (event: MouseEvent) => {
    if (
      (event.type === 'click' && event.button !== 0) ||
      (event.type === 'auxclick' && event.button !== 1)
    )
      return
    if (!(event.target instanceof Element)) return
    const filter = event.target.closest<HTMLButtonElement>(
      'button[data-home-region-select]'
    )
    if (filter && root.contains(filter)) {
      if (filter.getAttribute('aria-pressed') !== 'true')
        measurement.regionSelect(
          readPlacement(filter),
          filter.dataset.homeRegionSelect ?? ''
        )
      return
    }
    const link = event.target.closest<HTMLAnchorElement>('a[href]')
    if (!link || !root.contains(link)) return
    const card = link.closest<HTMLElement>('[data-article-id]')
    if (
      card?.dataset.articleUri &&
      new URL(card.dataset.articleUri, window.location.href).pathname !==
        new URL(link.href).pathname
    )
      return
    if (enrichExistingClicks) measurement.captureClick(readPlacement(link))
    else measurement.click(readPlacement(link))
  }
  const change = (event: Event) => {
    const select = event.target
    if (
      select instanceof HTMLSelectElement &&
      select.hasAttribute('data-home-region-select')
    )
      measurement.regionSelect(readPlacement(select), select.value)
  }
  const mutation = new MutationObserver(reconcile)
  mutation.observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [
      'data-article-id',
      'data-item-position',
      'data-component-type',
      'data-region-id',
      'data-rate-ready',
      'data-module-marker'
    ]
  })
  root.addEventListener('click', click, true)
  root.addEventListener('auxclick', click, true)
  root.addEventListener('change', change)
  reconcile()
  return () => {
    stopped = true
    mutation.disconnect()
    for (const record of observed.values()) record.stop()
    observed.clear()
    root.removeEventListener('click', click, true)
    root.removeEventListener('auxclick', click, true)
    root.removeEventListener('change', change)
  }
}
