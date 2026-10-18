import { GAPageView } from '@lib/utils/ga'
import { GA_EVENTS } from '@lib/constants'
import { createHomeMeasurement, type HomeViewContext } from './measurement'
import { mountHomeMeasurement } from './domMeasurement'
import { rememberReadingClick } from './readingBridge'

/** Manual localhost QA only. This never selects a public experimental cohort. */
function qaVariant(pathname: string) {
  if (pathname !== '/' || document.body.dataset.homeMeasurementQa !== 'true')
    return null
  const url = new URL(window.location.href)
  if (
    !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ||
    url.searchParams.get('__ncol_home_measurement') !== '1'
  )
    return null
  const selected = url.searchParams.get('__ncol_home_audit')
  return selected === 'control' || selected === 'v2' ? selected : null
}

function treatment(root: HTMLElement, variant: 'control' | 'v2') {
  if (variant === 'control') return 'current'
  return root.querySelector<HTMLElement>('[data-opening-treatment]')?.dataset
    .openingTreatment === 'photographic'
    ? 'photographic'
    : 'traditional'
}

/** One owner per template navigation; remounting effects retains its ledger. */
export function createPageMeasurement(pathname: string) {
  let sent = false
  let context: HomeViewContext | undefined
  let measurement: ReturnType<typeof createHomeMeasurement> | undefined
  const ledger = new Set<string>()
  const view = () => {
    if (sent) return
    sent = true
    GAPageView({
      pageType: GA_EVENTS.VIEW.PAGE,
      pageUrl: pathname,
      pageTitle: document.title,
      ...context,
      ...(context ? { module_id: 'home', component_type: 'home' } : {})
    })
  }
  return {
    mount() {
      const variant = qaVariant(pathname)
      let root: HTMLElement | null = null
      let stopRoot = () => {}
      const reconcile = () => {
        if (!variant) {
          view()
          return
        }
        const next = document.querySelector<HTMLElement>(
          `[data-home-variant="${variant}"]`
        )
        if (!next) return
        const opening = treatment(next, variant)
        if (!context)
          context = {
            experiment_id: 'home_v2',
            home_variant: variant,
            home_view_id: `home-${crypto.randomUUID()}`,
            opening_treatment: opening
          }
        context.opening_treatment = opening
        measurement ??= createHomeMeasurement(context, ledger)
        measurement.setOpeningTreatment(opening)
        if (root !== next) {
          stopRoot()
          root = next
          stopRoot = mountHomeMeasurement(root, measurement, {
            enrichExistingClicks: true,
            onArticleClick: (destination, placement) => {
              if (context)
                rememberReadingClick(destination, { ...context, ...placement })
            }
          })
        }
        view()
      }
      const restored = (event: PageTransitionEvent) => {
        if (!event.persisted) return
        stopRoot()
        root = null
        context = undefined
        measurement = undefined
        ledger.clear()
        sent = false
        reconcile()
      }
      const observer = new MutationObserver(reconcile)
      if (variant)
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['data-opening-treatment']
        })
      window.addEventListener('pageshow', restored)
      reconcile()
      return () => {
        observer.disconnect()
        stopRoot()
        window.removeEventListener('pageshow', restored)
      }
    }
  }
}
