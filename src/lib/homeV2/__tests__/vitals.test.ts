import { createHomeVitals } from '../vitals'
import { GAEvent } from '@lib/utils/ga'

const context = {
  home_version: 'v2',
  home_view_id: 'view-first',
  opening_treatment: 'photographic'
} as const
const metric = {
  name: 'LCP',
  value: 1800,
  rating: 'good',
  id: 'v6-1792291000000-1234567890123',
  navigationType: 'navigate',
  navigationId: 1,
  navigationStartTime: 0,
  navigationURL: 'http://localhost/?private_query=never-send',
  entries: []
}
const events = () =>
  (window.dataLayer ?? []).filter(
    (value): value is Record<string, unknown> => 'event' in value
  )
beforeEach(() => {
  window.dataLayer = []
  window.history.replaceState({}, '', '/')
})

it('queues until the actual Home owner binds and never sends URLs or performance entries', () => {
  const runtime = createHomeVitals()
  const navigation = runtime.navigation('/', 20)
  const ad = document.createElement('div')
  ad.dataset.ncolSlot = 'sticky-bottom'
  ad.innerHTML =
    '<img alt="private text" src="https://example.com/private?token=secret">'
  runtime.report({ ...metric, entries: [{ element: ad.firstElementChild }] })
  expect(events()).toHaveLength(0)
  navigation.bind(context)
  expect(events()).toHaveLength(1)
  expect(events()[0]).toMatchObject({
    event: 'WEB_VITAL',
    non_interaction: true,
    home_version: 'v2',
    home_view_id: 'view-first',
    module_id: 'home',
    web_vital_name: 'LCP',
    web_vital_value: 1800,
    web_vital_unit: 'ms',
    web_vital_revision: 1,
    web_vital_scope: 'document',
    web_vital_environment: 'local-qa',
    lcp_element_role: 'advertisement'
  })
  expect(JSON.stringify(events())).not.toMatch(
    /private|secret|navigationURL|entries/
  )
  expect(window.dataLayer?.at(-1)).toMatchObject({
    web_vital_name: null,
    web_vital_value: null,
    lcp_element_role: null
  })
  GAEvent({ category: 'MENU', label: 'OPEN' })
  expect(events().at(-1)).not.toHaveProperty('web_vital_value')
})

it('deduplicates repeated framework registrations and reports genuine INP revisions, including decreases', () => {
  const runtime = createHomeVitals()
  runtime.navigation('/', 20).bind(context)
  const input = {
    ...metric,
    name: 'INP',
    value: 250,
    rating: 'needs-improvement'
  }
  runtime.report(input)
  runtime.report(input)
  runtime.report({ ...input, id: 'v6-1792291000000-9999999999999', value: 300 })
  runtime.report({ ...input, value: 150, rating: 'good' })
  expect(events()).toHaveLength(2)
  expect(events()[1]).toMatchObject({
    web_vital_revision: 2,
    web_vital_value: 150,
    web_vital_delta: -100,
    web_vital_id: metric.id
  })
})

it('retains the document origin after SPA navigation and assigns soft metrics to their actual Home transition', () => {
  const runtime = createHomeVitals()
  runtime.navigation('/', 20).bind(context)
  runtime.navigation('/2026/10/17/article/', 100)
  runtime.navigation('/', 200).bind({
    ...context,
    home_view_id: 'view-return',
    opening_treatment: 'traditional'
  })
  runtime.report(metric)
  runtime.report({
    ...metric,
    id: 'v6-1792291000001-1234567890123',
    navigationType: 'soft-navigation',
    navigationId: 8,
    navigationStartTime: 190
  })
  expect(events().map(e => e.home_view_id)).toEqual([
    'view-first',
    'view-return'
  ])
  expect(events()[1]).toMatchObject({
    web_vital_scope: 'soft-navigation',
    opening_treatment: 'traditional'
  })
})

it('does not relabel a hard article document as Home after an SPA visit', () => {
  const runtime = createHomeVitals()
  runtime.navigation('/2026/10/17/article/', 20)
  runtime.navigation('/', 200).bind(context)
  runtime.report(metric)
  expect(events()).toHaveLength(0)
})

it('waits for the first actual soft transition and never jumps over an unrelated route to a later Home', () => {
  const runtime = createHomeVitals()
  runtime.navigation('/2026/10/17/article/', 20)
  runtime.report({
    ...metric,
    navigationType: 'soft-navigation',
    navigationId: 8,
    navigationStartTime: 90
  })
  runtime.navigation('/categoria/zulia/', 100)
  runtime.navigation('/', 200).bind(context)
  expect(events()).toHaveLength(0)
})

it('separates BFCache visits using pageshow time and uses the restored route, even when the framework inherited the original URL', () => {
  const runtime = createHomeVitals()
  runtime.navigation('/2026/10/17/article/', 20)
  runtime.navigation('/', 200).bind(context)
  runtime
    .navigation('/', 300, true)
    .bind({ ...context, home_view_id: 'view-restored' })
  runtime.report({
    ...metric,
    navigationType: 'back-forward-cache',
    navigationStartTime: 300,
    navigationURL: 'http://localhost/2026/10/17/article/'
  })
  expect(events()).toHaveLength(1)
  expect(events()[0]).toMatchObject({
    home_view_id: 'view-restored',
    web_vital_scope: 'back-forward-cache'
  })
})

it.each([
  { name: 'FCP' },
  { value: -1 },
  { value: NaN },
  { value: Infinity },
  { navigationURL: 'https://other.example/' },
  { navigationURL: 'http://localhost/?ver-banners=1' },
  { navigationType: 'soft-navigation', navigationStartTime: 0 },
  { id: 'email@example.com' },
  { navigationType: 'unknown' },
  { rating: 'unknown' }
])(
  'rejects unavailable, unsupported or unsafe metrics without inventing values: %j',
  invalid => {
    const runtime = createHomeVitals()
    runtime.navigation('/', 20).bind(context)
    runtime.report({ ...metric, ...invalid })
    expect(events()).toHaveLength(0)
  }
)

it('keeps the initial document owner while bounding long SPA navigation histories', () => {
  const runtime = createHomeVitals()
  runtime.navigation('/', 20).bind(context)
  for (let index = 1; index <= 300; index++)
    runtime.navigation('/categoria/zulia/', index * 100)
  runtime.report(metric)
  expect(events()).toHaveLength(1)
  expect(events()[0].home_view_id).toBe('view-first')
})

it('drops late soft metrics whose navigation owner was evicted instead of attributing them to a newer Home', () => {
  const runtime = createHomeVitals()
  runtime.navigation('/article/', 20)
  runtime
    .navigation('/', 100)
    .bind({ ...context, home_view_id: 'original-home' })
  for (let index = 1; index <= 51; index++)
    runtime.navigation('/', 100 + index * 100).bind({
      ...context,
      home_view_id: `later-home-${index}`
    })
  runtime.report({
    ...metric,
    name: 'CLS',
    value: 0.03,
    navigationType: 'soft-navigation',
    navigationId: 8,
    navigationStartTime: 90
  })
  runtime.navigation('/', 5400).bind(context)
  expect(events()).toHaveLength(0)
  runtime.report({
    ...metric,
    navigationType: 'soft-navigation',
    navigationId: 60,
    navigationStartTime: 5390
  })
  expect(events()).toHaveLength(1)
  expect(events()[0].home_view_id).toBe('view-first')
})
