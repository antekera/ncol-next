import { GA_EVENTS } from '@lib/constants'
import { GAEvent } from '@lib/utils/ga'
import type { HomeEventContext } from './measurementContext'

export type HomeViewContext = Required<
  Pick<
    HomeEventContext,
    'experiment_id' | 'home_variant' | 'home_view_id' | 'opening_treatment'
  >
>
export type EditorialPlacement = Pick<
  HomeEventContext,
  | 'module_id'
  | 'editorial_position'
  | 'item_position'
  | 'article_id'
  | 'section_id'
  | 'component_type'
  | 'region_id'
  | 'service_id'
>

const positiveInteger = (value: number | undefined) =>
  Number.isSafeInteger(value) && (value ?? 0) > 0
const valid = (placement: EditorialPlacement) =>
  !!placement.module_id &&
  positiveInteger(placement.editorial_position) &&
  (placement.item_position === undefined ||
    positiveInteger(placement.item_position))

function clickConvention(placement: EditorialPlacement) {
  if (placement.module_id === 'opening' && placement.component_type === 'hero')
    return {
      category: GA_EVENTS.POST_LINK.COVER.CATEGORY,
      label: GA_EVENTS.POST_LINK.COVER.LABEL
    }
  if (placement.component_type === 'section_link')
    return { category: 'HOME_SECTION', label: 'VIEW_MORE' }
  if (placement.component_type === 'service_link')
    return {
      category: 'HOME_SERVICE',
      label: placement.service_id ?? placement.module_id!
    }
  return {
    category: GA_EVENTS.POST_LINK.SINGLE.CATEGORY,
    label: placement.module_id === 'ranking' ? 'MOST_VISITED' : 'GO_TO_POST'
  }
}

/** The exposure owner retains this ledger across component mounts and filters. */
export function createHomeMeasurement(
  initial: HomeViewContext,
  ledger: Set<string>
) {
  const context = { ...initial }
  return {
    setOpeningTreatment(treatment: HomeViewContext['opening_treatment']) {
      context.opening_treatment = treatment
    },
    impression(placement: EditorialPlacement) {
      if (!valid(placement)) return
      const key = JSON.stringify([
        context.home_view_id,
        context.experiment_id,
        context.home_variant,
        placement.module_id,
        placement.article_id ?? null,
        placement.article_id ? placement.component_type : null,
        placement.article_id ? placement.item_position : null
      ])
      if (ledger.has(key)) return
      ledger.add(key)
      GAEvent({
        ...placement,
        ...context,
        action: placement.article_id ? 'CARD_IMPRESSION' : 'MODULE_IMPRESSION',
        category: placement.article_id
          ? GA_EVENTS.POST_LINK.SINGLE.CATEGORY
          : 'HOME_MODULE',
        label: placement.module_id!,
        component_type: placement.component_type ?? 'module',
        non_interaction: true,
        visibility_rule: 'visible_v1'
      })
    },
    click(placement: EditorialPlacement) {
      if (!valid(placement)) return
      if (
        !placement.article_id &&
        !['section_link', 'service_link'].includes(
          placement.component_type ?? ''
        )
      )
        return
      GAEvent({
        ...placement,
        ...context,
        ...clickConvention(placement)
      })
    }
  }
}
