import type { createHomeMeasurement, EditorialPlacement } from './measurement'
import { observeVisible } from './visibility'

type Measurement = ReturnType<typeof createHomeMeasurement>
const readPlacement = (element: HTMLElement): EditorialPlacement => {
  const section = element.closest<HTMLElement>('section[data-module-id]')
  const card = element.closest<HTMLElement>('[data-article-id]')
  const component = element.closest<HTMLElement>('[data-component-type]')
  return {
    module_id: section?.dataset.moduleId,
    editorial_position: Number(section?.dataset.editorialPosition),
    article_id: card?.dataset.articleId,
    item_position: card ? Number(card.dataset.itemPosition) : undefined,
    component_type: component?.dataset.componentType,
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
  measurement: Measurement
): () => void {
  const observed = new Map<
    HTMLElement,
    { identity: string; stop: () => void }
  >()
  let stopped = false
  const reconcile = () => {
    if (stopped) return
    const targets = new Set<HTMLElement>(
      root.querySelectorAll('[data-article-id]')
    )
    for (const section of root.querySelectorAll<HTMLElement>(
      'section[data-module-id]'
    )) {
      // Empty feeds/skeletons are not editorial impressions. Header exposure is
      // explicitly separate from card exposure and never implies all cards read.
      if (
        !section.querySelector(
          '[data-article-id], [data-service-id], [data-rate-ready="true"]'
        )
      )
        continue
      const marker = section.querySelector<HTMLElement>(
        '[data-module-marker], h1, h2'
      )
      if (marker && marker.getBoundingClientRect().height <= 200)
        targets.add(marker)
    }
    for (const [element, record] of observed) {
      if (
        !targets.has(element) ||
        record.identity !== JSON.stringify(readPlacement(element))
      ) {
        record.stop()
        observed.delete(element)
      }
    }
    for (const target of targets) {
      if (observed.has(target)) continue
      observed.set(target, {
        identity: JSON.stringify(readPlacement(target)),
        stop: observeVisible(target, () =>
          measurement.impression(readPlacement(target))
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
    const link = event.target.closest<HTMLAnchorElement>('a[href]')
    if (!link || !root.contains(link)) return
    measurement.click(readPlacement(link))
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
      'data-rate-ready'
    ]
  })
  root.addEventListener('click', click)
  root.addEventListener('auxclick', click)
  reconcile()
  return () => {
    stopped = true
    mutation.disconnect()
    for (const record of observed.values()) record.stop()
    observed.clear()
    root.removeEventListener('click', click)
    root.removeEventListener('auxclick', click)
  }
}
