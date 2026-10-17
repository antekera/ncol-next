import { createReadingSession } from '../reading'

const origin = {
  experiment_id: 'home_v2',
  home_variant: 'v2',
  home_view_id: 'view-1',
  opening_treatment: 'photographic',
  module_id: 'zulia',
  editorial_position: 2,
  item_position: 1,
  article_id: 'wp-1',
  component_type: 'lead_card'
} as const
const first = '/2026/10/17/first/'
const second = '/2026/10/17/second/'
describe('attributed reading without reader identity', () => {
  let now: number
  beforeEach(() => {
    now = 1000
    sessionStorage.clear()
  })
  const session = (allowed = true) =>
    createReadingSession({ allowed, storage: sessionStorage, now: () => now })
  it('confirms a second distinct destination, never clicks, prefetches or reloading the first', () => {
    const reading = session()
    reading.rememberClick(first, origin)
    expect(reading.openArticle(second, 'wp-2')).toBeNull()
    expect(reading.openArticle(first, 'wp-1')).toMatchObject({
      secondArticle: false,
      context: origin
    })
    expect(reading.openArticle(first, 'wp-1')).toMatchObject({
      secondArticle: false
    })
    expect(reading.openArticle(second, 'wp-2')).toMatchObject({
      secondArticle: true,
      firstArticleId: 'wp-1',
      context: { ...origin, article_id: 'wp-2' }
    })
    expect(reading.openArticle('/2026/10/17/third/', 'wp-3')).toMatchObject({
      secondArticle: false
    })
  })
  it('keeps only approved session context across reload, strips query/hash and stores no reader identifier', () => {
    const reading = session()
    reading.rememberClick(`${first}?email=private@example.com#test`, origin)
    const restored = session()
    expect(restored.openArticle(first, 'wp-1')).not.toBeNull()
    const saved = JSON.stringify(Object.values(sessionStorage))
    expect(saved).not.toMatch(/email|private@example|reader_id|user_id/)
  })
  it('expires at 30 minutes of inactivity; old clicks cannot attribute a new session', () => {
    const reading = session()
    reading.rememberClick(first, origin)
    now += 30 * 60 * 1000
    expect(reading.openArticle(first, 'wp-1')).toBeNull()
    reading.rememberClick(second, origin)
    expect(reading.openArticle(second, 'wp-2')?.secondArticle).toBe(false)
  })
  it('does not restore historical context when permission is granted late', () => {
    session().rememberClick(first, origin)
    const denied = session(false)
    denied.setAllowed(true)
    expect(denied.openArticle(first, 'wp-1')).toBeNull()
    expect(sessionStorage.length).toBe(0)
  })
  it('keeps an actively read session alive after its engagement event has already fired', () => {
    const reading = session()
    reading.rememberClick(first, origin)
    reading.openArticle(first, 'wp-1')
    for (let n = 0; n < 6; n++) {
      now += 5000
      reading.addActiveReading(first, 5000)
    }
    now += 30 * 60 * 1000 - 1000
    expect(reading.addActiveReading(first, 1000)).toBeNull()
    now += 1000
    expect(reading.openArticle(second, 'wp-2')?.secondArticle).toBe(true)
  })
  it('accumulates only explicitly active body time and emits engagement once', () => {
    const reading = session()
    reading.rememberClick(first, origin)
    reading.openArticle(first, 'wp-1')
    for (let n = 0; n < 29; n++) {
      now += 1000
      expect(reading.addActiveReading(first, 1000)).toBeNull()
    }
    expect(reading.addActiveReading(first, -1)).toBeNull()
    expect(reading.addActiveReading(first, 60_000)).toBeNull()
    expect(reading.addActiveReading(first, 1000)).toMatchObject({
      ...origin,
      active_reading_seconds: 30
    })
    expect(reading.addActiveReading(first, 1000)).toBeNull()
  })
  it('does not collect before permission, supports late permission and clears state on revocation', () => {
    const reading = session(false)
    reading.rememberClick(first, origin)
    expect(sessionStorage.length).toBe(0)
    reading.setAllowed(true)
    expect(reading.openArticle(first, 'wp-1')).toBeNull()
    reading.rememberClick(first, origin)
    reading.openArticle(first, 'wp-1')
    reading.setAllowed(false)
    expect(sessionStorage.length).toBe(0)
    expect(reading.openArticle(second, 'wp-2')).toBeNull()
    reading.setAllowed(true)
    expect(reading.openArticle(second, 'wp-2')).toBeNull()
  })
  it('tolerates denied/corrupt storage and rejects external or nonarticle destinations', () => {
    const broken = {
      getItem: () => {
        throw new Error('denied')
      },
      setItem: () => {
        throw new Error('denied')
      },
      removeItem: () => {
        throw new Error('denied')
      }
    }
    const reading = createReadingSession({
      allowed: true,
      storage: broken,
      now: () => now
    })
    reading.rememberClick(
      'https://external.example/2026/10/17/private/',
      origin
    )
    expect(reading.openArticle(first, 'wp-1')).toBeNull()
    reading.rememberClick('/busqueda/?q=private', origin)
    expect(reading.openArticle(first, 'wp-1')).toBeNull()
    reading.rememberClick(first, origin)
    expect(reading.openArticle(first, 'wp-1')).not.toBeNull()
  })
  it.each([
    'not-json',
    '{"updatedAt":99999999}',
    '{"updatedAt":1000,"pending":{"path":"/busqueda/","context":{}}}'
  ])('ignores corrupt or invalid stored context: %s', raw => {
    session().rememberClick(first, origin)
    sessionStorage.setItem(sessionStorage.key(0)!, raw)
    expect(session().openArticle(first, 'wp-1')).toBeNull()
  })
})
