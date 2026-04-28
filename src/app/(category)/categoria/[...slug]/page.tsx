export const revalidate = 3600

import { MENU, MENU_B, MAIN_MENU, CATEGORY_PATH } from '@lib/constants'
import { Content } from '@blocks/content/CategoryPosts'
import { Container } from '@components/Container'
import { PageTitle } from '@components/PageTitle'
import { Sidebar } from '@components/Sidebar'
import {
  TodayHeroSection,
  TodaySecondaryGrid,
  getSecondaryPosts
} from '@blocks/content/TodayYesterdayModule'
import { getTodayYesterdayPosts } from '@app/actions/getTodayYesterdayPosts'
import { sharedOpenGraph } from '@lib/sharedOpenGraph'
import { categoryName, titleFromSlug } from '@lib/utils'
import { getStaticSlugs } from '@lib/utils/getStaticSlugs'
import { Suspense } from 'react'
import { Loading } from '@components/LoadingCategory'
import { NcolAdSlot } from '@components/NcolAdSlot'
import { CMS_URL } from '@lib/constants'

const SLUGS_WITH_TODAY_MODULE = new Set(
  MAIN_MENU.map(item => item.href.split('/').pop()).filter(Boolean)
)

// Slugs that benefit from "Hoy" in the title (news/location categories)
const HOY_SLUGS = new Set([
  'cabimas',
  'maracaibo',
  'ciudad-ojeda',
  'sucesos',
  'costa-oriental',
  'zulia',
  'nacionales',
  'internacionales'
])

// Category-specific meta descriptions for key pages
const CATEGORY_DESCRIPTIONS = new Map<string, string>([
  [
    'cabimas',
    'Últimas noticias de Cabimas hoy. Sucesos, accidentes y actualidad de Cabimas, Costa Oriental del Lago de Maracaibo en Noticiascol.'
  ],
  [
    'maracaibo',
    'Últimas noticias de Maracaibo hoy. Sucesos, política y actualidad de Maracaibo, capital del estado Zulia en Noticiascol.'
  ],
  [
    'ciudad-ojeda',
    'Últimas noticias de Ciudad Ojeda hoy. Sucesos y actualidad de Ciudad Ojeda, Lagunillas, Costa Oriental del Lago de Maracaibo en Noticiascol.'
  ],
  [
    'sucesos',
    'Noticias de sucesos en Venezuela hoy. Accidentes, crímenes y actualidad policial del Zulia, Cabimas y Maracaibo en Noticiascol.'
  ],
  [
    'costa-oriental',
    'Noticias de la Costa Oriental del Lago hoy. Cabimas, Ciudad Ojeda y toda la actualidad del sur del lago de Maracaibo en Noticiascol.'
  ],
  [
    'zulia',
    'Últimas noticias del Zulia hoy. Sucesos, política y actualidad del estado Zulia, Venezuela en Noticiascol.'
  ],
  [
    'nacionales',
    'Últimas noticias nacionales de Venezuela hoy. Política, economía y actualidad del país en Noticiascol.'
  ],
  [
    'internacionales',
    'Noticias internacionales hoy. Actualidad del mundo, Latinoamérica y Venezuela en Noticiascol.'
  ]
])

type Params = { slug: string[] }
type SearchParams = { [key: string]: string | string[] | undefined }

export async function generateMetadata({
  params
}: {
  params: Promise<Params>
  searchParams: Promise<SearchParams>
}) {
  const { slug } = await params
  const slugArray = Array.isArray(slug) ? slug : [slug]
  const lastSlug = slugArray[slugArray.length - 1]
  const canonicalUrl = `${CMS_URL}/categoria/${slugArray.join('/')}/`

  const name = categoryName(titleFromSlug(String(lastSlug)), true)
  const title = HOY_SLUGS.has(lastSlug) ? `${name} Hoy` : name
  const description =
    CATEGORY_DESCRIPTIONS.get(lastSlug) ?? sharedOpenGraph.description

  return {
    ...sharedOpenGraph,
    title,
    description,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      ...sharedOpenGraph.openGraph,
      title,
      description,
      url: canonicalUrl
    },
    twitter: {
      ...sharedOpenGraph.twitter,
      title,
      description
    }
  }
}

export async function generateStaticParams() {
  const hrefs = getStaticSlugs([...MENU, ...MENU_B])
  // Use only category hrefs and strip the "/categoria/" prefix, then split into segments
  const params = hrefs
    .filter(href => href.startsWith(`${CATEGORY_PATH}/`))
    .map(href => href.replace(`${CATEGORY_PATH}/`, ''))
    .filter(Boolean)
    .map(path => ({ slug: path.split('/') }))

  return params
}

export default async function Page(props: {
  params: Promise<Params>
  searchParams: Promise<SearchParams>
}) {
  const params = await props.params
  const slug = Array.isArray(params.slug)
    ? params.slug[params.slug.length - 1]
    : params.slug

  const hasTodayModule = SLUGS_WITH_TODAY_MODULE.has(slug)
  const todayPosts = hasTodayModule
    ? await getTodayYesterdayPosts({ slug })
    : null

  const todayEdges = todayPosts?.edges ?? []
  const secondaryPosts = getSecondaryPosts(todayEdges)
  const renderedCount = todayEdges[0] ? 1 + secondaryPosts.length : 0
  const excludeIds = todayEdges.slice(0, renderedCount).map(e => e.node.id)
  const shownCount = todayEdges.length

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: CMS_URL
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: categoryName(titleFromSlug(slug), true),
        item: `${CMS_URL}/categoria/${slug}/`
      }
    ]
  }

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PageTitle text={titleFromSlug(slug)} />

      {/* <div className='container mx-auto py-4'>
        <div className='show-desktop px-4'>
          <AdSenseBanner
            className={'min-h-[280px]'}
            {...ad.global.top_header}
          />
        </div>
        <div className='show-mobile px-4'>
          <AdSenseBanner className={'min-h-[70px]'} {...ad.global.top_header} />
        </div>
      </div> */}
      {shownCount >= 1 && <TodayHeroSection posts={todayPosts!} />}
      <Container className='py-10' sidebar>
        <section className='w-full md:w-2/3 md:pr-8 lg:w-3/4'>
          {shownCount >= 1 && <TodaySecondaryGrid posts={todayPosts!} />}
          <NcolAdSlot slot='article-top' className='my-4 flex justify-center' />
          <Suspense fallback={<Loading />}>
            <Content slug={slug} excludeIds={excludeIds} />
          </Suspense>
        </section>
        <Sidebar />
      </Container>
    </>
  )
}
