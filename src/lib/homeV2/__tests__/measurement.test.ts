import { createHomeMeasurement } from '../measurement'

const context = {
  experiment_id: 'home_v2',
  home_variant: 'v2',
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
