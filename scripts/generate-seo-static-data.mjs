import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const OUTPUT_PATH = path.join(
  process.cwd(),
  'src/lib/generated/seoStaticData.ts'
)

const TAG_PATH = '/etiqueta'

const fallbackData = {
  generatedAt: new Date().toISOString(),
  nationalTags: [
    { name: 'Venezuela', href: `${TAG_PATH}/venezuela/` },
    { name: 'Política', href: `${TAG_PATH}/politica/` },
    { name: 'Economía', href: `${TAG_PATH}/economia/` },
    { name: 'Sucesos', href: `${TAG_PATH}/sucesos/` },
    { name: 'Deportes', href: `${TAG_PATH}/deportes/` },
    { name: 'Internacionales', href: `${TAG_PATH}/internacionales/` },
    { name: 'Servicios', href: `${TAG_PATH}/servicios/` },
    { name: 'Actualidad', href: `${TAG_PATH}/actualidad/` }
  ],
  categoryTags: {
    nacionales: [
      { name: 'Política', href: `${TAG_PATH}/politica/` },
      { name: 'Economía', href: `${TAG_PATH}/economia/` },
      { name: 'Servicios', href: `${TAG_PATH}/servicios/` },
      { name: 'Gobierno', href: `${TAG_PATH}/gobierno/` }
    ],
    sucesos: [
      { name: 'Policía', href: `${TAG_PATH}/policia/` },
      { name: 'Accidentes', href: `${TAG_PATH}/accidentes/` },
      { name: 'Tribunales', href: `${TAG_PATH}/tribunales/` },
      { name: 'Seguridad', href: `${TAG_PATH}/seguridad/` }
    ],
    deportes: [
      { name: 'Fútbol', href: `${TAG_PATH}/futbol/` },
      { name: 'Béisbol', href: `${TAG_PATH}/beisbol/` },
      { name: 'Vinotinto', href: `${TAG_PATH}/vinotinto/` },
      { name: 'Torneo', href: `${TAG_PATH}/torneo/` }
    ],
    internacionales: [
      { name: 'Latinoamérica', href: `${TAG_PATH}/latinoamerica/` },
      { name: 'EEUU', href: `${TAG_PATH}/eeuu/` },
      { name: 'Migración', href: `${TAG_PATH}/migracion/` },
      { name: 'Geopolítica', href: `${TAG_PATH}/geopolitica/` }
    ]
  }
}

async function fetchSeoData() {
  const apiUrl = (process.env.WORDPRESS_API_URL ?? '').trim()
  if (!apiUrl) return fallbackData

  const query = `
    query SeoStaticData {
      tags(first: 24) {
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

    if (!response.ok) return fallbackData

    const payload = await response.json()
    const tagEdges = payload?.data?.tags?.edges

    if (!Array.isArray(tagEdges) || tagEdges.length === 0) return fallbackData

    const mapped = tagEdges
      .map(edge => edge?.node)
      .filter(Boolean)
      .map(node => ({
        name: String(node.name ?? '').trim() || String(node.slug ?? '').trim(),
        href: `${TAG_PATH}/${String(node.slug ?? '').trim()}/`
      }))
      .filter(item => item.name && item.href !== `${TAG_PATH}//`)
      .slice(0, 24)

    if (!mapped.length) return fallbackData

    return {
      ...fallbackData,
      generatedAt: new Date().toISOString(),
      nationalTags: mapped.slice(0, 8)
    }
  } catch {
    return fallbackData
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
