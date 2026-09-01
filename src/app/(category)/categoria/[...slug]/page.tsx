export const revalidate = 86400

import {
  MENU,
  MENU_B,
  CATEGORY_PATH,
  getCategoryPageDescription
} from '@lib/constants'
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
import { MatchesSection } from '@components/mundial'
import { CategorySubmenu } from '@components/CategorySubmenu'
import { CategoryIntro } from '@components/CategoryIntro'
import { CategoryTagCloud } from '@components/CategoryTagCloud'

const SLUGS_WITH_TODAY_MODULE = new Set([
  'sucesos',
  'zulia',
  'nacionales',
  'internacionales',
  'deportes',
  'tendencias',
  'entretenimiento'
])

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
    getCategoryPageDescription(lastSlug) ?? sharedOpenGraph.description

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

  // Declara qué contiene la sección, no solo dónde está en la jerarquía. El
  // ItemList sale de `todayEdges`, que ya se resolvió en servidor arriba; las
  // categorías sin módulo "hoy" emiten la colección sin lista de artículos.
  const collectionPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${CMS_URL}/categoria/${slug}/`,
    name: categoryName(titleFromSlug(slug), true),
    description: getCategoryPageDescription(slug) ?? undefined,
    inLanguage: 'es-VE',
    isPartOf: { '@id': `${CMS_URL}/#website` },
    publisher: { '@id': `${CMS_URL}/#organization` },
    ...(todayEdges.length > 0 && {
      mainEntity: {
        '@type': 'ItemList',
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        numberOfItems: todayEdges.length,
        itemListElement: todayEdges.map(({ node }, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${CMS_URL}${node.uri}`,
          name: node.title
        }))
      }
    })
  }

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionPageJsonLd)
        }}
      />
      <PageTitle text={titleFromSlug(slug)} />
      {slug === 'mundial-2026' && <MatchesSection />}
      <Container className='pt-4'>
        <CategoryIntro slug={slug} />
        <CategorySubmenu slug={slug} />
        <CategoryTagCloud slug={slug} />
      </Container>

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
      {slug === 'opinion' && (
        <Container className='pt-4'>
          <div className='flex items-start gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300'>
            <svg
              aria-hidden='true'
              className='mt-0.5 size-4 shrink-0'
              fill='currentColor'
              viewBox='0 0 20 20'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                clipRule='evenodd'
                d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z'
                fillRule='evenodd'
              />
            </svg>
            <p>
              ¿Quieres publicar tu artículo de opinión?{' '}
              <a
                className='font-semibold underline underline-offset-2 hover:opacity-80'
                href='mailto:prensa@noticiascol.com'
              >
                Escríbenos a prensa@noticiascol.com
              </a>
            </p>
          </div>
        </Container>
      )}
      {shownCount >= 1 && <TodayHeroSection posts={todayPosts!} />}
      <Container className='py-10' sidebar>
        <section
          id='noticias-recientes'
          className='w-full md:w-2/3 md:pr-8 lg:w-3/4'
        >
          {shownCount >= 1 && <TodaySecondaryGrid posts={todayPosts!} />}
          <NcolAdSlot slot='article-top' className='my-4 flex justify-center' />
          <Suspense fallback={<Loading />}>
            <Content slug={slug} excludeIds={excludeIds} />
          </Suspense>
        </section>
        <Sidebar servicesFirst />
      </Container>
    </>
  )
}
