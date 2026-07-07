import sitemap from '../sitemap'
import { MAIN_MENU, CMS_URL, SERVICES_MENU } from '@lib/constants'

const PRIORITY_URLS = new Set([
  '/categoria/nacionales/',
  '/categoria/sucesos/',
  '/categoria/internacionales/',
  '/categoria/deportes/',
  '/categoria/costa-oriental/',
  '/categoria/zulia/',
  '/categoria/ciudad-ojeda/',
  '/categoria/mundial-2026/',
  '/dolar-hoy/'
])

const DISCOVERY_URLS = new Set(['/por-fecha/'])
const EXCLUDED_STATIC_URLS = new Set([
  '/contacto/',
  '/privacidad/',
  '/terminos-y-condiciones/'
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
      const normalizedUrl = item.href.endsWith('/')
        ? item.href
        : `${item.href}/`
      const found = result.find(r => r.url === `${CMS_URL}${normalizedUrl}`)
      expect(found).toBeDefined()
      expect(found?.priority).toBe(0.85)
    })

    DISCOVERY_URLS.forEach(url => {
      const found = result.find(r => r.url === `${CMS_URL}${url}`)
      expect(found).toBeDefined()
      expect(found?.priority).toBe(0.85)
    })

    const aboutPage = result.find(r => r.url === `${CMS_URL}/quienes-somos/`)
    expect(aboutPage).toBeDefined()
    expect(aboutPage?.priority).toBe(0.5)

    EXCLUDED_STATIC_URLS.forEach(url => {
      const found = result.find(r => r.url === `${CMS_URL}${url}`)
      expect(found).toBeUndefined()
    })

    // Services menu routes (not in priority list) appear at 0.7
    const servicesRoutes = SERVICES_MENU.filter(
      item =>
        item.href.startsWith('/') &&
        !PRIORITY_URLS.has(item.href) &&
        !PRIORITY_URLS.has(`${item.href}/`)
    )
    servicesRoutes.forEach(item => {
      const normalizedUrl = item.href.endsWith('/')
        ? item.href
        : `${item.href}/`
      const found = result.find(r => r.url === `${CMS_URL}${normalizedUrl}`)
      expect(found).toBeDefined()
      expect(found?.priority).toBe(0.7)
    })
  })
})
