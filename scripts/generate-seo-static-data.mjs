import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const OUTPUT_PATH = path.join(
  process.cwd(),
  'src/lib/generated/seoStaticData.ts'
)

const TAG_PATH = '/etiqueta'

const PREFERRED_NATIONAL_TAG_SLUGS = [
  'venezuela',
  'politica',
  'economia',
  'sucesos',
  'deportes',
  'internacionales',
  'gobierno',
  'policia',
  'accidentes',
  'tribunales',
  'futbol',
  'beisbol',
  'vinotinto',
  'migracion',
  'seguridad',
  'actualidad'
]

const PREFERRED_CATEGORY_TAG_SLUGS = {
  nacionales: ['venezuela', 'politica', 'economia', 'gobierno', 'actualidad'],
  sucesos: ['sucesos', 'policia', 'accidentes', 'tribunales', 'seguridad'],
  deportes: ['deportes', 'futbol', 'beisbol', 'basket', 'vinotinto'],
  futbol: ['futbol', 'vinotinto', 'mundial-2026', 'deportes'],
  beisbol: ['beisbol', 'deportes', 'grandes-ligas'],
  internacionales: [
    'internacionales',
    'latinoamerica',
    'eeuu',
    'migracion',
    'geopolitica'
  ],
  entretenimiento: [
    'farandula',
    'entretenimiento',
    'cine',
    'television',
    'musica'
  ],
  farandula: ['farandula', 'entretenimiento', 'artistas', 'espectaculos'],
  tendencias: [
    'tecnologia',
    'inteligencia-artificial',
    'bienestar',
    'gastronomia',
    'ciencia'
  ],
  'ciencia-y-tecnologia': [
    'tecnologia',
    'inteligencia-artificial',
    'ciencia',
    'internet',
    'gadgets'
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
  nationalTags: [],
  categoryTags: {}
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
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    })

    if (!response.ok) return emptyData

    const payload = await response.json()
    const tagEdges = payload?.data?.tags?.edges

    if (!Array.isArray(tagEdges) || tagEdges.length === 0) return emptyData

    const mapped = tagEdges
      .map(edge => edge?.node)
      .filter(Boolean)
      .map(node => ({
        slug: String(node.slug ?? '').trim(),
        name: String(node.name ?? '').trim() || String(node.slug ?? '').trim(),
        href: `${TAG_PATH}/${String(node.slug ?? '').trim()}/`
      }))
      .filter(item => item.name && item.slug && item.href !== `${TAG_PATH}//`)

    if (!mapped.length) return emptyData

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
      nationalTags: pickTags(PREFERRED_NATIONAL_TAG_SLUGS, 16).map(
        ({ slug: _slug, ...tag }) => tag
      ),
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
