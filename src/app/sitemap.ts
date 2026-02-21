import { MetadataRoute } from 'next'
import { MAIN_MENU, MENU_B, CMS_URL, ONLY_SITEMAP_MENU } from '@lib/constants'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = CMS_URL

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1
    }
  ]

  // Add pages from MAIN_MENU
  MAIN_MENU.forEach(item => {
    if (item.href.startsWith('/')) {
      routes.push({
        url: `${baseUrl}${item.href}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8
      })
    }
  })

  // Add pages from MENU_B (Categories/Subcategories)
  MENU_B.forEach(item => {
    if (item.href.startsWith('/')) {
      routes.push({
        url: `${baseUrl}${item.href}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6
      })
    }
  })

  // Add pages from ONLY_SITEMAP_MENU
  ONLY_SITEMAP_MENU.forEach(item => {
    if (item.href.startsWith('/')) {
      routes.push({
        url: `${baseUrl}${item.href}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.4
      })
    }
  })

  return routes
}
