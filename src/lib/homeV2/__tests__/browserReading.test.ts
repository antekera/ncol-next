import { mountBrowserReading, readingQaAllowed } from '../browserReading'
import { rememberReadingClick } from '../readingBridge'
import { mountReadingDom } from '../readingDom'

jest.mock('../readingDom', () => ({
  mountReadingDom: jest.fn(() => jest.fn())
}))
const origin = {
  home_version: 'v2',
  home_view_id: 'qa-view',
  opening_treatment: 'traditional',
  module_id: 'opening',
  editorial_position: 1,
  article_id: 'post-1'
} as const
describe('explicit localhost reading permission fixture', () => {
  let stop: (() => void) | undefined
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
    delete document.body.dataset.homeMeasurementQa
    delete document.body.dataset.homeReadingQa
    Object.defineProperty(navigator, 'locks', {
      configurable: true,
      value: { request: jest.fn((_key, action) => Promise.resolve(action())) }
    })
  })
  afterEach(() => {
    stop?.()
    stop = undefined
  })
  it('does not mount, persist or infer permission from the analytics QA flag alone', () => {
    document.body.dataset.homeMeasurementQa = 'true'
    expect(readingQaAllowed()).toBe(false)
    stop = mountBrowserReading()
    rememberReadingClick('/2026/10/17/example/', origin)
    expect(mountReadingDom).not.toHaveBeenCalled()
    expect(localStorage.length).toBe(0)
  })
  it('accepts only same-origin or public-news links and clears immediately on revocation', async () => {
    document.body.dataset.homeMeasurementQa = 'true'
    document.body.dataset.homeReadingQa = 'granted'
    stop = mountBrowserReading()
    expect(mountReadingDom).toHaveBeenCalledTimes(1)
    rememberReadingClick(
      'https://unrelated.example/2026/10/17/example/',
      origin
    )
    expect(localStorage.length).toBe(0)
    rememberReadingClick('/2026/10/17/example/?email=private#secret', origin)
    expect(localStorage.length).toBe(1)
    expect(JSON.stringify(Object.values(localStorage))).not.toMatch(
      /private|secret|email/
    )
    document.body.dataset.homeReadingQa = 'denied'
    await Promise.resolve()
    expect(localStorage.length).toBe(0)
    rememberReadingClick('/2026/10/17/another/', origin)
    expect(localStorage.length).toBe(0)
  })
  it('revokes pending origin storage before the permission observer delivers', () => {
    document.body.dataset.homeMeasurementQa = 'true'
    document.body.dataset.homeReadingQa = 'granted'
    stop = mountBrowserReading()
    rememberReadingClick('/2026/10/17/example/', origin)
    expect(localStorage.length).toBe(1)
    document.body.dataset.homeReadingQa = 'denied'
    rememberReadingClick('/2026/10/17/another/', origin)
    expect(localStorage.length).toBe(0)
  })
})
