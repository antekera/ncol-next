import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const OUTPUT_PATH = path.join(
  process.cwd(),
  'src/lib/generated/seoStaticData.ts'
)

const TAG_PATH = '/etiqueta'

const PREFERRED_CATEGORY_TAG_SLUGS = {
  nacionales: [
    'venezuela',
    'politica',
    'economia',
    'sistema-patria',
    'actualidad'
  ],
  sucesos: ['sucesos', 'policia', 'accidentes', 'seguridad'],
  deportes: ['deportes', 'futbol', 'beisbol', 'basket', 'vinotinto'],
  futbol: ['futbol', 'vinotinto', 'mundial-2026', 'deportes'],
  beisbol: ['beisbol', 'deportes', 'grandes-ligas'],
  internacionales: [
    'internacionales',
    'narcotrafico',
    'donald-trump',
    'migracion',
    'tramites-legales/'
  ],
  entretenimiento: [
    'farandula',
    'entretenimiento',
    'cine',
    'television',
    'musica'
  ],
  farandula: ['farandula', 'entretenimiento'],
  tendencias: [
    'tecnologia',
    'inteligencia-artificial',
    'gastronomia',
    'ciencia'
  ],
  'ciencia-y-tecnologia': [
    'tecnologia',
    'inteligencia-artificial',
    'ciencia',
    'internet'
  ],
  zulia: ['zulia', 'maracaibo', 'cabimas', 'sucesos', 'costa-oriental'],
  'costa-oriental': [
    'cabimas',
    'ciudad-ojeda',
    'lagunillas',
    'sucesos',
    'zulia'
  ],
  cabimas: ['cabimas', 'sucesos', 'costa-oriental', 'zulia'],
  maracaibo: ['maracaibo', 'zulia', 'sucesos', 'politica'],
  politica: ['politica', 'venezuela', 'gobierno', 'economia', 'actualidad']
}

const emptyData = {
  generatedAt: new Date().toISOString(),
  popularTags: [],
  nationalTags: [],
  categoryTags: {}
}

/**
 * Fetches the top post URIs from Turso's visits table and queries WordPress
 * GraphQL to collect tags from those posts. Returns the most-used tags across
 * popular content, ranked by frequency.
 */
async function fetchPopularTags(wpApiUrl) {
  const tursoUrl = (process.env.TURSO_DB_URL ?? '')
    .trim()
    .replace('libsql://', 'https://')
  const tursoToken = (process.env.TURSO_AUTH_TOKEN ?? '').trim()

  if (!tursoUrl || !tursoToken || !wpApiUrl) return []

  // 1. Get top 50 post URIs from Turso
  let postUris = []
  try {
    const res = await fetch(`${tursoUrl}/v2/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tursoToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            type: 'execute',
            stmt: {
              sql: 'SELECT post_slug FROM visits GROUP BY post_slug ORDER BY SUM(count) DESC LIMIT 50'
            }
          }
        ]
      })
    })
    if (!res.ok) return []
    const data = await res.json()
    const rows = data.results?.[0]?.response?.result?.rows ?? []
    postUris = rows.map(row => row[0]?.value).filter(Boolean)
  } catch {
    return []
  }

  if (!postUris.length) return []

  // 2. Batch query WP GraphQL for post tags (10 posts per request using aliases)
  const tagCounts = new Map()
  const batchSize = 10

  for (let i = 0; i < postUris.length; i += batchSize) {
    const batch = postUris.slice(i, i + batchSize)
    const aliases = batch
      .map(
        (uri, j) =>
          `p${i + j}: post(id: ${JSON.stringify(uri)}, idType: URI) { tags { edges { node { name slug } } } }`
      )
      .join('\n')

    try {
      const res = await fetch(wpApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `query PopularTags { ${aliases} }` })
      })
      if (!res.ok) continue

      const payload = await res.json()
      for (const post of Object.values(payload?.data ?? {})) {
        if (!post?.tags?.edges) continue
        for (const { node } of post.tags.edges) {
          if (!node?.slug || node.slug.startsWith('_')) continue
          const slug = String(node.slug).trim()
          const existing = tagCounts.get(slug)
          if (existing) {
            existing.count++
          } else {
            tagCounts.set(slug, {
              name: String(node.name ?? slug).trim(),
              href: `${TAG_PATH}/${slug}/`,
              count: 1
            })
          }
        }
      }
    } catch {
      // skip batch on error
    }
  }

  // 3. Return top 20 tags that appear in at least 2 posts
  return Array.from(tagCounts.values())
    .filter(t => t.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)
    .map(({ name, href }) => ({ name, href }))
}

async function fetchSeoData() {
  const apiUrl = (process.env.WORDPRESS_API_URL ?? '').trim()
  if (!apiUrl) return emptyData

  const query = `
    query SeoStaticData {
      tags(first: 200) {
        edges {
          node {
            name
            slug
          }
        }
      }
    }
  `

  try {
    const [response, popularTags] = await Promise.all([
      fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      }),
      fetchPopularTags(apiUrl)
    ])

    if (!response.ok) return { ...emptyData, popularTags }

    const payload = await response.json()
    const tagEdges = payload?.data?.tags?.edges

    if (!Array.isArray(tagEdges) || tagEdges.length === 0) {
      return { ...emptyData, popularTags }
    }

    const mapped = tagEdges
      .map(edge => edge?.node)
      .filter(Boolean)
      .map(node => ({
        slug: String(node.slug ?? '').trim(),
        name: String(node.name ?? '').trim() || String(node.slug ?? '').trim(),
        href: `${TAG_PATH}/${String(node.slug ?? '').trim()}/`
      }))
      .filter(item => item.name && item.slug && item.href !== `${TAG_PATH}//`)

    if (!mapped.length) return { ...emptyData, popularTags }

    const tagMap = new Map(mapped.map(item => [item.slug, item]))

    const pickTags = (slugs, limit) => {
      const picked = slugs.map(slug => tagMap.get(slug)).filter(Boolean)
      if (picked.length >= limit) return picked.slice(0, limit)
      const remaining = mapped.filter(
        item => !picked.some(pickedItem => pickedItem.slug === item.slug)
      )
      return [...picked, ...remaining].slice(0, limit)
    }

    const categoryTags = Object.fromEntries(
      Object.entries(PREFERRED_CATEGORY_TAG_SLUGS)
        .map(([slug, preferredSlugs]) => [slug, pickTags(preferredSlugs, 6)])
        .filter(([, tags]) => tags.length > 0)
        .map(([slug, tags]) => [
          slug,
          tags.map(({ slug: _slug, ...tag }) => tag)
        ])
    )

    return {
      generatedAt: new Date().toISOString(),
      popularTags,
      nationalTags: [],
      categoryTags
    }
  } catch {
    return emptyData
  }
}

async function main() {
  const data = await fetchSeoData()
  const content = `export type SeoStaticLink = {
  name: string
  href: string
}

export type SeoStaticData = {
  generatedAt: string
  popularTags: SeoStaticLink[]
  nationalTags: SeoStaticLink[]
  categoryTags: Record<string, SeoStaticLink[]>
}

export const seoStaticData: SeoStaticData = ${JSON.stringify(data, null, 2)} as const
`

  // The output path is constrained to a generated file inside the repo.
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await writeFile(OUTPUT_PATH, content)
}

main().catch(error => {
  console.error('Failed to generate SEO static data', error)
  process.exit(1)
})
