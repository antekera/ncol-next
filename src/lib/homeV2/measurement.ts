import { GA_EVENTS } from '@lib/constants'
import { GAEvent, beginHomeGesture } from '@lib/utils/ga'
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
  const sendClick = (placement: EditorialPlacement) =>
    GAEvent({
      ...placement,
      ...context,
      ...clickConvention(placement)
    })
  return {
    videoPlay(
      placement: EditorialPlacement,
      provider: 'youtube' | 'dailymotion',
      videoId: string
    ) {
      if (
        !valid(placement) ||
        placement.module_id !== 'videos' ||
        !placement.article_id ||
        !['youtube', 'dailymotion'].includes(provider) ||
        !/^[a-zA-Z0-9_-]{6,64}$/.test(videoId)
      )
        return
      const key = JSON.stringify([
        'video',
        context.home_view_id,
        placement.module_id,
        placement.article_id,
        provider,
        videoId
      ])
      if (ledger.has(key)) return
      ledger.add(key)
      GAEvent({
        ...placement,
        ...context,
        action: GA_EVENTS.VIDEO_WIDGET.PLAY_VIDEO,
        category: GA_EVENTS.VIDEO_WIDGET.CATEGORY,
        label:
          provider === 'youtube'
            ? `https://www.youtube.com/watch?v=${videoId}`
            : `https://www.dailymotion.com/video/${videoId}`,
        video_provider: provider,
        video_id: videoId
      })
    },
    carouselNavigation(
      placement: EditorialPlacement,
      from: number,
      to: number,
      method: 'arrow' | 'gesture'
    ) {
      if (
        !valid(placement) ||
        placement.module_id !== 'videos' ||
        !positiveInteger(from) ||
        !positiveInteger(to) ||
        from === to ||
        !['arrow', 'gesture'].includes(method)
      )
        return
      GAEvent({
        ...placement,
        ...context,
        category: GA_EVENTS.VIDEO_WIDGET.CATEGORY,
        label: 'CAROUSEL_NAVIGATION',
        from_item_position: from,
        to_item_position: to,
        direction: to > from ? 'next' : 'previous',
        navigation_method: method
      })
    },
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
      sendClick(placement)
    },
    captureClick(placement: EditorialPlacement) {
      if (
        !valid(placement) ||
        (!placement.article_id &&
          !['section_link', 'service_link'].includes(
            placement.component_type ?? ''
          ))
      )
        return
      const snapshot = { ...placement, ...context }
      beginHomeGesture(snapshot, () =>
        GAEvent({ ...snapshot, ...clickConvention(placement) })
      )
    },
    regionSelect(placement: EditorialPlacement, region: string) {
      if (
        !valid(placement) ||
        placement.module_id !== 'zulia' ||
        !/^[a-z0-9-]{1,100}$/.test(region)
      )
        return
      GAEvent({
        ...placement,
        ...context,
        category: 'HOME_REGION_FILTER',
        label: 'SELECT_REGION',
        region_id: region,
        component_type: 'region_filter'
      })
    }
  }
}
