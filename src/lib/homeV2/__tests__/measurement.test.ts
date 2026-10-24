import { createHomeMeasurement } from '../measurement'

const context = {
  home_version: 'v2',
  home_view_id: 'view-1',
  opening_treatment: 'photographic'
} as const
const card = {
  module_id: 'zulia',
  editorial_position: 2,
  article_id: 'post-1',
  component_type: 'compact_card',
  item_position: 1,
  section_id: 'cabimas'
}
describe('Home editorial measurement through GAEvent', () => {
  beforeEach(() => {
    window.dataLayer = []
    window.history.replaceState({}, '', '/')
  })
  const events = () =>
    (window.dataLayer ?? []).filter(
      (event): event is Record<string, unknown> => 'event' in event
    )
  it('attributes confirmed video playback once per exposure without treating navigation as playback', () => {
    const ledger = new Set<string>()
    const measurement = createHomeMeasurement(context, ledger)
    if (
      !('videoPlay' in measurement) ||
      typeof measurement.videoPlay !== 'function'
    )
      throw new Error('Confirmed video playback measurement is missing')
    const placement = {
      ...card,
      module_id: 'videos',
      editorial_position: 6,
      component_type: 'video_card'
    }
    measurement.videoPlay(placement, 'youtube', 'M7lc1UVf-VE')
    measurement.videoPlay(placement, 'youtube', 'M7lc1UVf-VE')
    expect(events()).toHaveLength(1)
    expect(events()[0]).toMatchObject({
      ...context,
      ...placement,
      event: 'PLAY_VIDEO',
      category: 'VIDEO_WIDGET',
      video_provider: 'youtube',
      video_id: 'M7lc1UVf-VE'
    })
    expect(window.dataLayer?.at(-1)).toMatchObject({
      video_id: null,
      video_provider: null
    })
  })
  it('records completed carousel changes with positions, ignoring no movement and invalid placement', () => {
    const measurement = createHomeMeasurement(context, new Set())
    if (
      !('carouselNavigation' in measurement) ||
      typeof measurement.carouselNavigation !== 'function'
    )
      throw new Error('Completed carousel measurement is missing')
    const placement = {
      module_id: 'videos',
      editorial_position: 6,
      component_type: 'video_carousel'
    }
    measurement.carouselNavigation(placement, 1, 1, 'arrow')
    measurement.carouselNavigation(placement, 0, 2, 'arrow')
    measurement.carouselNavigation(placement, 1, 3, 'gesture')
    expect(events()).toHaveLength(1)
    expect(events()[0]).toMatchObject({
      ...context,
      ...placement,
      event: 'CLICK_EVENT',
      category: 'VIDEO_WIDGET',
      label: 'CAROUSEL_NAVIGATION',
      from_item_position: 1,
      to_item_position: 3,
      direction: 'next',
      navigation_method: 'gesture'
    })
  })
  it('shares impression keys across remounts; new articles/placements/views remain eligible', () => {
    const ledger = new Set<string>()
    const first = createHomeMeasurement(context, ledger)
    first.impression({ module_id: 'zulia', editorial_position: 2 })
    first.impression(card)
    const remounted = createHomeMeasurement(context, ledger)
    remounted.impression({ ...card, region_id: 'maracaibo' })
    remounted.impression({ ...card, region_id: 'zulia' })
    remounted.impression({ ...card, article_id: 'post-2' })
    remounted.impression({ ...card, item_position: 2 })
    createHomeMeasurement(
      { ...context, home_view_id: 'view-2' },
      ledger
    ).impression(card)
    expect(events().map(event => event.event)).toEqual([
      'MODULE_IMPRESSION',
      'CARD_IMPRESSION',
      'CARD_IMPRESSION',
      'CARD_IMPRESSION',
      'CARD_IMPRESSION'
    ])
    expect(events()[1]).toMatchObject({
      ...context,
      ...card,
      non_interaction: true,
      visibility_rule: 'visible_v1'
    })
  })
  it('keeps intentional repeated clicks, reuses existing COVER and LINK_SINGLE conventions', () => {
    const measurement = createHomeMeasurement(context, new Set())
    measurement.click(card)
    measurement.click(card)
    measurement.click({ ...card, module_id: 'opening', component_type: 'hero' })
    expect(events()).toHaveLength(3)
    expect(events()[0]).toMatchObject({
      event: 'CLICK_EVENT',
      category: 'LINK_SINGLE',
      ...card
    })
    expect(events()[2]).toMatchObject({
      category: 'COVER',
      label: 'LINK_COVER',
      opening_treatment: 'photographic'
    })
  })
  it('updates failed-photo context without another page view and ignores invalid geometry metadata', () => {
    const measurement = createHomeMeasurement(context, new Set())
    measurement.setOpeningTreatment('traditional')
    measurement.impression({ ...card, editorial_position: 0 })
    measurement.impression({ ...card, item_position: -1 })
    measurement.impression({ ...card, item_position: Number.NaN })
    measurement.click({ module_id: 'opinion', editorial_position: 4 })
    expect(events()).toEqual([])
    measurement.click(card)
    expect(events()[0]).toMatchObject({ opening_treatment: 'traditional' })
  })
})
