const sample = {
  name: 'LCP',
  value: 1800,
  rating: 'good',
  id: 'v6-1792291000000-1234567890123',
  navigationType: 'navigate',
  navigationId: 0,
  navigationStartTime: 0,
  navigationURL:
    'http://localhost/?__ncol_home_audit=v2&__ncol_home_measurement=1'
}
const markup =
  '<div data-home-variant="v2"><section data-opening-treatment="photographic"><h1>Portada editorial</h1></section></div>'
const webVitals = () =>
  (window.dataLayer ?? []).filter(
    (entry): entry is Record<string, unknown> =>
      'event' in entry && entry.event === 'WEB_VITAL'
  )
beforeEach(() => {
  window.dataLayer = []
  document.body.innerHTML = markup
  document.body.dataset.homeMeasurementQa = 'true'
  window.history.replaceState(
    {},
    '',
    '/?__ncol_home_audit=v2&__ncol_home_measurement=1'
  )
})
afterEach(() => {
  delete document.body.dataset.homeMeasurementQa
  delete document.body.dataset.homeVersion
  delete document.body.dataset.homeVitalsEnvironment
  document.body.innerHTML = ''
  window.history.replaceState({}, '', '/')
})

it.each(['production', 'preview', 'local'] as const)(
  'uses the existing public Home owner for native metrics in %s without QA',
  async environment => {
    delete document.body.dataset.homeMeasurementQa
    document.body.dataset.homeVersion = 'v2'
    document.body.dataset.homeVitalsEnvironment = environment
    window.history.replaceState({}, '', '/')
    await jest.isolateModulesAsync(async () => {
      const { createPageMeasurement } = await import('../pageMeasurement')
      const { reportHomeWebVital } = await import('../vitals')
      const stop = createPageMeasurement('/').mount()
      reportHomeWebVital({ ...sample, navigationURL: 'http://localhost/' })
      reportHomeWebVital({ ...sample, navigationURL: 'http://localhost/' })
      expect(webVitals()).toHaveLength(1)
      expect(webVitals()[0]).toMatchObject({
        home_version: 'v2',
        web_vital_environment: environment,
        web_vital_scope: 'document'
      })
      const view = (window.dataLayer ?? []).find(
        (entry): entry is Record<string, unknown> =>
          'event' in entry && entry.event === 'CUSTOM_PAGE_VIEW'
      )
      expect(view).toMatchObject({
        home_version: 'v2',
        home_view_id: expect.any(String)
      })
      expect(webVitals()[0].home_view_id).toBe(view?.home_view_id)
      stop()
      const stopArticle = createPageMeasurement('/article/').mount()
      reportHomeWebVital({
        ...sample,
        navigationURL: 'http://localhost/',
        name: 'CLS',
        value: 0.05
      })
      expect(webVitals()).toHaveLength(2)
      expect(webVitals()[1].home_view_id).toBe(view?.home_view_id)
      expect(webVitals()[1].web_vital_environment).toBe(environment)
      stopArticle()
    })
  }
)

it.each([
  { version: undefined, environment: undefined },
  { version: undefined, environment: 'production' },
  { version: 'v2', environment: undefined },
  { version: 'v2', environment: 'untrusted' }
])(
  'does not enable public metrics from QA query parameters or incomplete server metadata: %j',
  async ({ version, environment }) => {
    delete document.body.dataset.homeMeasurementQa
    if (version) document.body.dataset.homeVersion = version
    if (environment) document.body.dataset.homeVitalsEnvironment = environment
    await jest.isolateModulesAsync(async () => {
      const { createPageMeasurement } = await import('../pageMeasurement')
      const { reportHomeWebVital } = await import('../vitals')
      const stop = createPageMeasurement('/').mount()
      reportHomeWebVital(sample)
      expect(webVitals()).toHaveLength(0)
      stop()
    })
  }
)

it('binds the existing exposure across effect remounts and leaves late document callbacks attributed after leaving Home', async () => {
  await jest.isolateModulesAsync(async () => {
    const { createPageMeasurement } = await import('../pageMeasurement')
    const { reportHomeWebVital } = await import('../vitals')
    const owner = createPageMeasurement('/')
    owner.mount()()
    const stop = owner.mount()
    reportHomeWebVital(sample)
    reportHomeWebVital(sample)
    expect(webVitals()).toHaveLength(1)
    const origin = webVitals()[0].home_view_id
    stop()
    const stopArticle = createPageMeasurement('/2026/10/17/article/').mount()
    reportHomeWebVital({ ...sample, name: 'CLS', value: 0.04 })
    expect(webVitals()).toHaveLength(2)
    expect(webVitals()[1].home_view_id).toBe(origin)
    stopArticle()
  })
})

it('waits for streamed Home content and assigns restored metrics to a new BFCache exposure', async () => {
  jest.useRealTimers()
  await jest.isolateModulesAsync(async () => {
    const { createPageMeasurement } = await import('../pageMeasurement')
    const { reportHomeWebVital } = await import('../vitals')
    document.body.innerHTML = ''
    const stop = createPageMeasurement('/').mount()
    reportHomeWebVital(sample)
    expect(webVitals()).toHaveLength(0)
    document.body.innerHTML = markup
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(webVitals()).toHaveLength(1)
    const first = webVitals()[0].home_view_id
    const restore = new PageTransitionEvent('pageshow', { persisted: true })
    window.dispatchEvent(restore)
    reportHomeWebVital({
      ...sample,
      id: 'v6-1792291000001-1234567890123',
      navigationType: 'back-forward-cache',
      navigationStartTime: restore.timeStamp,
      value: 16
    })
    expect(webVitals()).toHaveLength(2)
    expect(webVitals()[1].home_view_id).not.toBe(first)
    expect(webVitals()[1].web_vital_scope).toBe('back-forward-cache')
    stop()
  })
})
