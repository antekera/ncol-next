import sitemap from '../sitemap'
import { MAIN_MENU, CMS_URL, SERVICES_MENU } from '@lib/constants'

describe('sitemap', () => {
  it('returns correct sitemap structure', () => {
    const result = sitemap()

    // Base URL
    expect(result[0].url).toBe(CMS_URL)

    // Main menu routes
    const mainMenuRoutes = MAIN_MENU.filter(item => item.href.startsWith('/'))
    mainMenuRoutes.forEach(item => {
      const found = result.find(r => r.url === `${CMS_URL}${item.href}`)
      expect(found).toBeDefined()
      expect(found?.priority).toBe(0.8)
    })

    // Services menu routes
    const servicesRoutes = SERVICES_MENU.filter(item =>
      item.href.startsWith('/')
    )
    servicesRoutes.forEach(item => {
      const found = result.find(r => r.url === `${CMS_URL}${item.href}`)
      expect(found).toBeDefined()
      expect(found?.priority).toBe(0.6)
    })
  })
})
