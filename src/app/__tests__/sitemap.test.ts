import sitemap from '../sitemap'
import { MAIN_MENU, CMS_URL, SERVICES_MENU } from '@lib/constants'

const PRIORITY_URLS = new Set([
  '/categoria/sucesos/',
  '/categoria/costa-oriental/',
  '/categoria/zulia/',
  '/categoria/ciudad-ojeda/',
  '/categoria/nacionales/',
  '/dolar-hoy/'
])

describe('sitemap', () => {
  it('returns correct sitemap structure', () => {
    const result = sitemap()

    // Base URL is first with priority 1
    expect(result[0].url).toBe(CMS_URL)
    expect(result[0].priority).toBe(1)

    // Priority sections appear at 0.95
    PRIORITY_URLS.forEach(url => {
      const found = result.find(r => r.url === `${CMS_URL}${url}`)
      expect(found).toBeDefined()
      expect(found?.priority).toBe(0.95)
    })

    // Remaining main menu routes (not in priority list) appear at 0.85
    const remainingMenuRoutes = MAIN_MENU.filter(
      item =>
        item.href.startsWith('/') &&
        !PRIORITY_URLS.has(item.href) &&
        !PRIORITY_URLS.has(`${item.href}/`)
    )
    remainingMenuRoutes.forEach(item => {
      const found = result.find(r => r.url === `${CMS_URL}${item.href}`)
      expect(found).toBeDefined()
      expect(found?.priority).toBe(0.85)
    })

    // Services menu routes (not in priority list) appear at 0.7
    const servicesRoutes = SERVICES_MENU.filter(
      item =>
        item.href.startsWith('/') &&
        !PRIORITY_URLS.has(item.href) &&
        !PRIORITY_URLS.has(`${item.href}/`)
    )
    servicesRoutes.forEach(item => {
      const found = result.find(r => r.url === `${CMS_URL}${item.href}`)
      expect(found).toBeDefined()
      expect(found?.priority).toBe(0.7)
    })
  })
})
