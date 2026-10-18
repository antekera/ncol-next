import { createReadingRuntime } from '../readingRuntime'

const origin = {
  experiment_id: 'home_v2',
  home_variant: 'v2',
  home_view_id: 'test-view',
  opening_treatment: 'photographic',
  module_id: 'opening',
  editorial_position: 1,
  article_id: 'post-1',
  component_type: 'hero'
} as const
const first = '/2026/10/17/first/'
const second = '/2026/10/17/second/'
const events = () =>
  (window.dataLayer ?? []).filter(
    (value): value is Record<string, unknown> => 'event' in value
  )

describe('permission-gated shared reading runtime', () => {
  beforeEach(() => {
    localStorage.clear()
    window.dataLayer = []
    window.history.replaceState({}, '', '/')
  })
  const lockQueue = () => {
    let tail = Promise.resolve()
    return <T>(action: () => T): Promise<T> => {
      const result = tail.then(action)
      tail = result.then(() => undefined)
      return result
    }
  }
  it('does not write or emit before permission and clears on revocation', async () => {
    const runtime = createReadingRuntime({
      storage: localStorage,
      exclusive: lockQueue()
    })
    runtime.remember(first, origin)
    await runtime.open(first, 'post-1')
    expect(localStorage.length).toBe(0)
    expect(events()).toHaveLength(0)
    runtime.setAllowed(true)
    runtime.remember(first, origin)
    await runtime.open(first, 'post-1')
    expect(events()[0]).toMatchObject({
      event: 'ARTICLE_DESTINATION_OPEN',
      origin_article_id: 'post-1'
    })
    runtime.setAllowed(false)
    expect(localStorage.length).toBe(0)
    expect(await runtime.open(second, 'post-2')).toBeNull()
  })
  it('records the pending public origin synchronously, without queries or PII', () => {
    const runtime = createReadingRuntime({
      allowed: true,
      storage: localStorage,
      exclusive: lockQueue()
    })
    runtime.remember(`${first}?email=private@example.com#secret`, origin)
    expect(localStorage.length).toBe(1)
    expect(JSON.stringify(Object.values(localStorage))).not.toMatch(
      /private@example|email|secret/
    )
  })
  it('shares state across fresh runtimes and serializes simultaneous second openings', async () => {
    const exclusive = lockQueue()
    const a = createReadingRuntime({
      allowed: true,
      storage: localStorage,
      exclusive
    })
    a.remember(first, origin)
    await a.open(first, 'post-1')
    const b = createReadingRuntime({
      allowed: true,
      storage: localStorage,
      exclusive
    })
    await Promise.all([a.open(second, 'post-2'), b.open(second, 'post-2')])
    expect(
      events().filter(value => value.event === 'ARTICLE_DESTINATION_OPEN')
    ).toHaveLength(2)
    expect(
      events().filter(value => value.event === 'SECOND_ARTICLE_OPEN')
    ).toHaveLength(1)
    for (let n = 0; n < 6; n++) await b.active(second, 'post-2', 5000)
    expect(
      events().filter(value => value.event === 'ARTICLE_ENGAGEMENT')
    ).toHaveLength(1)
    await a.active(second, 'post-2', 5000)
    expect(
      events().filter(value => value.event === 'ARTICLE_ENGAGEMENT')
    ).toHaveLength(1)
  })
  it('hands a synchronous pending origin to a fresh first-article tab', async () => {
    const source = createReadingRuntime({
      allowed: true,
      storage: localStorage,
      exclusive: lockQueue()
    })
    source.remember(first, origin)
    const destination = createReadingRuntime({
      allowed: true,
      storage: localStorage,
      exclusive: lockQueue()
    })
    await destination.open(first, 'post-1')
    expect(events()).toHaveLength(1)
    expect(events()[0]).toMatchObject({
      event: 'ARTICLE_DESTINATION_OPEN',
      origin_article_id: 'post-1',
      module_id: 'opening'
    })
  })
  it('drops queued work after revocation and expires stale click origins', async () => {
    let now = 1000
    const runtime = createReadingRuntime({
      allowed: true,
      storage: localStorage,
      exclusive: lockQueue(),
      now: () => now
    })
    runtime.remember(first, origin)
    now += 30 * 60 * 1000
    expect(await runtime.open(first, 'post-1')).toBeNull()
    runtime.remember(first, origin)
    const pending = runtime.open(first, 'post-1')
    runtime.setAllowed(false)
    await pending
    expect(events()).toHaveLength(0)
  })
  it('uses memory-only state when storage or cross-tab locking is unavailable', async () => {
    const broken = {
      getItem() {
        throw Error('denied')
      },
      setItem() {
        throw Error('denied')
      },
      removeItem() {
        throw Error('denied')
      }
    }
    const runtime = createReadingRuntime({ allowed: true, storage: broken })
    runtime.remember(first, origin)
    await runtime.open(first, 'post-1')
    await runtime.open(second, 'post-2')
    expect(
      events().filter(value => value.event === 'SECOND_ARTICLE_OPEN')
    ).toHaveLength(1)
  })
  it('preserves deduplication if storage becomes unavailable during the visit', async () => {
    const runtime = createReadingRuntime({
      allowed: true,
      storage: localStorage,
      exclusive: lockQueue()
    })
    runtime.remember(first, origin)
    await runtime.open(first, 'post-1')
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw Error('denied')
    })
    await runtime.open(first, 'post-1')
    await runtime.open(second, 'post-2')
    expect(runtime.mode()).toBe('memory')
    expect(
      events().filter(value => value.event === 'ARTICLE_DESTINATION_OPEN')
    ).toHaveLength(2)
    expect(
      events().filter(value => value.event === 'SECOND_ARTICLE_OPEN')
    ).toHaveLength(1)
    jest.restoreAllMocks()
  })
  it('falls back when locking rejects before the operation, without replaying an operation that ran', async () => {
    const denied = createReadingRuntime({
      allowed: true,
      storage: localStorage,
      exclusive: async () => {
        throw Error('denied')
      }
    })
    denied.remember(first, origin)
    await denied.open(first, 'post-1')
    expect(events()).toHaveLength(1)
    window.dataLayer = []
    localStorage.clear()
    const seed = createReadingRuntime({
      allowed: true,
      storage: localStorage,
      exclusive: lockQueue()
    })
    seed.remember(first, origin)
    await seed.open(first, 'post-1')
    const interrupted = createReadingRuntime({
      allowed: true,
      storage: localStorage,
      exclusive: async action => {
        action()
        throw Error('interrupted')
      }
    })
    interrupted.remember(second, origin)
    await interrupted.open(second, 'post-2')
    expect(
      events().filter(value => value.event === 'SECOND_ARTICLE_OPEN')
    ).toHaveLength(1)
    expect(
      events().filter(value => value.event === 'ARTICLE_DESTINATION_OPEN')
    ).toHaveLength(2)
  })
})
