import { createPageMeasurement } from '../pageMeasurement'
import { GAEvent } from '@lib/utils/ga'
import { connectReadingClicks } from '../readingBridge'

const events = () =>
  (window.dataLayer ?? []).filter(
    (value): value is Record<string, unknown> => 'event' in value
  )
const home = () => document.querySelector<HTMLElement>('[data-home-variant]')!
const markup = `<div data-home-variant="v2"><section data-module-id="opening" data-editorial-position="1" data-opening-treatment="photographic"><h1 data-module-marker>Portada</h1><article data-article-id="post-1" data-article-uri="/2026/10/17/news/" data-item-position="1" data-component-type="hero"><a href="/2026/10/17/news/">Noticia</a><a href="/categoria/zulia/">Categoría</a></article></section></div>`

describe('page measurement lifecycle', () => {
  const stops: Array<() => void> = []
  const mount = (owner: ReturnType<typeof createPageMeasurement>) => {
    const stop = owner.mount()
    stops.push(stop)
    return stop
  }
  beforeEach(() => {
    jest.useRealTimers()
    window.dataLayer = []
    document.body.innerHTML = markup
    document.body.dataset.homeMeasurementQa = 'true'
    window.history.replaceState(
      {},
      '',
      '/?__ncol_home_audit=v2&__ncol_home_measurement=1'
    )
  })
  afterEach(async () => {
    for (const stop of stops.splice(0)) stop()
    await new Promise(resolve => setTimeout(resolve, 0))
    delete document.body.dataset.homeMeasurementQa
    document.body.innerHTML = ''
    window.history.replaceState({}, '', '/')
  })

  it('enriches one existing view and keeps the exposure across setup-cleanup-setup', () => {
    const owner = createPageMeasurement('/')
    owner.mount()()
    const stop = mount(owner)
    expect(events()).toHaveLength(1)
    expect(events()[0]).toMatchObject({
      event: 'CUSTOM_PAGE_VIEW',
      module_id: 'home',
      component_type: 'home',
      experiment_id: 'home_v2',
      home_variant: 'v2',
      opening_treatment: 'photographic'
    })
    stop()
  })

  it('waits for streamed editorial content before enriching the existing view', async () => {
    document.body.innerHTML = '<p>Cargando…</p>'
    const stop = mount(createPageMeasurement('/'))
    expect(events()).toHaveLength(0)
    document.body.insertAdjacentHTML('beforeend', markup)
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(events()).toHaveLength(1)
    stop()
  })

  it('hands the origin to the optional reading owner synchronously without another click event', async () => {
    const remember = jest.fn()
    stops.push(connectReadingClicks(remember))
    mount(createPageMeasurement('/'))
    home()
      .querySelector('a')!
      .dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true })
      )
    expect(remember).toHaveBeenCalledTimes(1)
    expect(remember).toHaveBeenCalledWith(
      expect.stringContaining('/2026/10/17/news/'),
      expect.objectContaining({
        experiment_id: 'home_v2',
        home_variant: 'v2',
        opening_treatment: 'photographic',
        module_id: 'opening',
        editorial_position: 1,
        article_id: 'post-1',
        component_type: 'hero'
      })
    )
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(
      events().filter(value => value.event === 'CLICK_EVENT')
    ).toHaveLength(1)
  })

  it('uses independent exposure tokens across documents created at the same instant', async () => {
    const clock = jest.spyOn(Date, 'now').mockReturnValue(1792280000000)
    try {
      await jest.isolateModulesAsync(async () => {
        const isolated = await import('../pageMeasurement')
        mount(isolated.createPageMeasurement('/'))
      })
      await jest.isolateModulesAsync(async () => {
        const isolated = await import('../pageMeasurement')
        mount(isolated.createPageMeasurement('/'))
      })
      expect(events()).toHaveLength(2)
      expect(events()[0].home_view_id).not.toBe(events()[1].home_view_id)
    } finally {
      clock.mockRestore()
    }
  })

  it('uses a new exposure on BFCache restore without losing subsequent clicks', async () => {
    const stop = mount(createPageMeasurement('/'))
    const first = events()[0]
    window.dispatchEvent(
      new PageTransitionEvent('pageshow', { persisted: true })
    )
    expect(events()).toHaveLength(2)
    expect(events()[1]).not.toMatchObject({ home_view_id: first.home_view_id })
    home()
      .querySelector('a')!
      .dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true })
      )
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(events()[2]).toMatchObject({
      event: 'CLICK_EVENT',
      home_view_id: events()[1].home_view_id,
      article_id: 'post-1'
    })
    stop()
  })

  it('enriches the legacy click once, preserves its convention and clears context afterward', async () => {
    const link = home().querySelector('a')!
    link.addEventListener('click', () =>
      GAEvent({ category: 'COVER', label: 'LINK_COVER' })
    )
    const stop = mount(createPageMeasurement('/'))
    link.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true })
    )
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(events()).toHaveLength(2)
    expect(events()[1]).toMatchObject({
      category: 'COVER',
      label: 'LINK_COVER',
      module_id: 'opening',
      article_id: 'post-1'
    })
    GAEvent({ category: 'OTHER', label: 'unrelated' })
    expect(events()[2]).not.toHaveProperty('experiment_id')
    stop()
  })

  it('does not attribute taxonomy links inside a news card as article clicks', async () => {
    const stop = mount(createPageMeasurement('/'))
    home()
      .querySelectorAll('a')[1]
      .dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true })
      )
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(events()).toHaveLength(1)
    stop()
  })

  it('records native region choices once and ignores an already-selected tab', () => {
    home().insertAdjacentHTML(
      'beforeend',
      `<section data-module-id="zulia" data-editorial-position="2"><button data-home-region-select="maracaibo" aria-pressed="false">Maracaibo</button><button data-home-region-select="zulia" aria-pressed="true">Todo</button><select data-home-region-select><option value="zulia">Todos</option><option value="cabimas">Cabimas</option></select></section>`
    )
    const stop = mount(createPageMeasurement('/'))
    for (const button of home().querySelectorAll('button'))
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    const select = home().querySelector('select')!
    select.value = 'cabimas'
    select.dispatchEvent(new Event('change', { bubbles: true }))
    const choices = events().filter(
      event => event.category === 'HOME_REGION_FILTER'
    )
    expect(choices).toHaveLength(2)
    expect(choices[0]).toMatchObject({
      event: 'CLICK_EVENT',
      region_id: 'maracaibo',
      module_id: 'zulia',
      home_variant: 'v2'
    })
    expect(choices[1]).toMatchObject({ region_id: 'cabimas' })
    stop()
  })

  it('updates the presented treatment after image failure without another home view', async () => {
    const stop = mount(createPageMeasurement('/'))
    home().querySelector<HTMLElement>('section')!.dataset.openingTreatment =
      'traditional'
    await new Promise(resolve => setTimeout(resolve, 0))
    home()
      .querySelector('a')!
      .dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true })
      )
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(events()).toHaveLength(2)
    expect(events()[1]).toMatchObject({ opening_treatment: 'traditional' })
    stop()
  })

  it.each([
    'missing-capability',
    'missing-opt-in',
    'internal-preview',
    'category'
  ])('keeps %s on the existing measurement path', scenario => {
    let path = '/'
    if (scenario === 'missing-capability')
      delete document.body.dataset.homeMeasurementQa
    if (scenario === 'missing-opt-in')
      window.history.replaceState({}, '', '/?__ncol_home_audit=v2')
    if (scenario === 'internal-preview') {
      path = '/home-v2-preview/'
      window.history.replaceState({}, '', path)
    }
    if (scenario === 'category') {
      path = '/categoria/zulia/'
      window.history.replaceState({}, '', path)
    }
    const stop = mount(createPageMeasurement(path))
    expect(events()).toHaveLength(scenario === 'internal-preview' ? 0 : 1)
    if (events().length) expect(events()[0]).not.toHaveProperty('experiment_id')
    stop()
  })
})
