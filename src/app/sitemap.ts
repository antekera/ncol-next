import { MetadataRoute } from 'next'
import { MAIN_MENU, CMS_URL, SERVICES_MENU } from '@lib/constants'

// Priority sections to highlight for Google Sitelinks
const PRIORITY_SECTIONS = [
  { url: '/categoria/sucesos/', name: 'Sucesos' },
  { url: '/categoria/costa-oriental/', name: 'Costa Oriental' },
  { url: '/categoria/zulia/', name: 'Zulia' },
  { url: '/categoria/ciudad-ojeda/', name: 'Ciudad Ojeda' },
  { url: '/categoria/nacionales/', name: 'Nacionales' },
  { url: '/dolar-hoy/', name: 'Calculadora Dólar' }
]

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = CMS_URL

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1
    }
  ]

  // Priority sections for sitelinks — highest frequency and priority
  PRIORITY_SECTIONS.forEach(item => {
    routes.push({
      url: `${baseUrl}${item.url}`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.95
    })
  })

  // Add remaining pages from MAIN_MENU (skip already added priority ones)
  const priorityUrls = new Set(PRIORITY_SECTIONS.map(s => s.url))
  MAIN_MENU.forEach(item => {
    if (
      item.href.startsWith('/') &&
      !priorityUrls.has(item.href) &&
      !priorityUrls.has(`${item.href}/`)
    ) {
      routes.push({
        url: `${baseUrl}${item.href}`,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 0.85
      })
    }
  })

  // Services
  SERVICES_MENU.forEach(item => {
    if (
      item.href.startsWith('/') &&
      !priorityUrls.has(item.href) &&
      !priorityUrls.has(`${item.href}/`)
    ) {
      routes.push({
        url: `${baseUrl}${item.href}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7
      })
    }
  })

  return routes
}
