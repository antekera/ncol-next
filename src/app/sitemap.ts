import { MetadataRoute } from 'next'
import { MAIN_MENU, CMS_URL, SERVICES_MENU, MENU_C } from '@lib/constants'

// Priority sections to highlight for Google Sitelinks
const PRIORITY_SECTIONS = [
  { url: '/categoria/nacionales/', name: 'Nacionales' },
  { url: '/categoria/sucesos/', name: 'Sucesos' },
  { url: '/categoria/internacionales/', name: 'Internacionales' },
  { url: '/categoria/deportes/', name: 'Deportes' },
  { url: '/categoria/cabimas/', name: 'Cabimas' },
  { url: '/categoria/maracaibo/', name: 'Maracaibo' },
  { url: '/categoria/costa-oriental/', name: 'Costa Oriental' },
  { url: '/categoria/zulia/', name: 'Zulia' },
  { url: '/categoria/ciudad-ojeda/', name: 'Ciudad Ojeda' },
  { url: '/categoria/mundial-2026/', name: 'Mundial 2026' },
  { url: '/dolar-hoy/', name: 'Calculadora Dólar' }
]

const DISCOVERY_ROUTES = [{ url: '/por-fecha/', priority: 0.85 as const }]

const normalizePath = (href: string) => {
  const trimmed = href.trim()
  if (trimmed === '/') return trimmed
  return trimmed.endsWith('/') ? trimmed : `${trimmed}/`
}

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
  const seen = new Set(routes.map(item => item.url))
  PRIORITY_SECTIONS.forEach(item => {
    const url = `${baseUrl}${normalizePath(item.url)}`
    if (seen.has(url)) return
    seen.add(url)
    routes.push({
      url,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.95
    })
  })

  // Add remaining pages from MAIN_MENU (skip already added priority ones)
  const priorityUrls = new Set(
    PRIORITY_SECTIONS.map(section => normalizePath(section.url))
  )
  MAIN_MENU.forEach(item => {
    const normalizedHref = normalizePath(item.href)
    if (!item.href.startsWith('/') || priorityUrls.has(normalizedHref)) return
    const url = `${baseUrl}${normalizedHref}`
    if (seen.has(url)) return
    seen.add(url)
    routes.push({
      url,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.85
    })
  })

  DISCOVERY_ROUTES.forEach(item => {
    const url = `${baseUrl}${normalizePath(item.url)}`
    if (seen.has(url)) return
    seen.add(url)
    routes.push({
      url,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: item.priority
    })
  })

  // Services
  SERVICES_MENU.forEach(item => {
    const normalizedHref = normalizePath(item.href)
    if (!item.href.startsWith('/') || priorityUrls.has(normalizedHref)) return
    const url = `${baseUrl}${normalizedHref}`
    if (seen.has(url)) return
    seen.add(url)
    routes.push({
      url,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7
    })
  })

  // Static footer pages
  MENU_C.forEach(item => {
    const normalizedHref = normalizePath(item.href)
    if (!item.href.startsWith('/') || priorityUrls.has(normalizedHref)) return
    const url = `${baseUrl}${normalizedHref}`
    if (seen.has(url)) return
    seen.add(url)
    routes.push({
      url,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5
    })
  })

  return routes
}
