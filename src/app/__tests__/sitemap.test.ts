import sitemap from '../sitemap'
import { CMS_URL } from '@lib/constants'

describe('sitemap', () => {
  it('returns the correct sitemap routes', () => {
    const routes = sitemap()

    // Basic check for home route
    expect(routes).toContainEqual(
      expect.objectContaining({
        url: CMS_URL,
        changeFrequency: 'daily',
        priority: 1
      })
    )

    // Check for denunicias (part of ONLY_SITEMAP_MENU)
    const denunciasRoute = routes.find(r => r.url.endsWith('/denuncias'))
    expect(denunciasRoute).toBeDefined()
    expect(denunciasRoute?.url).toBe(`${CMS_URL}/denuncias`)
  })
})
