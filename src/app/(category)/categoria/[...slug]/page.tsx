export const dynamic = 'force-static'

import { MENU, MENU_B, MAIN_MENU, CATEGORY_PATH } from '@lib/constants'
import { Content } from '@blocks/content/CategoryPosts'
import { Container } from '@components/Container'
import { PageTitle } from '@components/PageTitle'
import { Sidebar } from '@components/Sidebar'
import {
  TodayHeroSection,
  TodaySecondaryGrid
} from '@blocks/content/TodayYesterdayModule'
import { getTodayYesterdayPosts } from '@app/actions/getTodayYesterdayPosts'
import { sharedOpenGraph } from '@lib/sharedOpenGraph'
import { categoryName, titleFromSlug } from '@lib/utils'
import { getStaticSlugs } from '@lib/utils/getStaticSlugs'
import { Suspense } from 'react'
import { Loading } from '@components/LoadingCategory'

const SLUGS_WITH_TODAY_MODULE = new Set(
  MAIN_MENU.map(item => item.href.split('/').pop()).filter(Boolean)
)

type Params = { slug: string[] }
type SearchParams = { [key: string]: string | string[] | undefined }

export async function generateMetadata({
  params
}: {
  params: Promise<Params>
  searchParams: Promise<SearchParams>
}) {
  const { slug } = await params
  const lastSlug = Array.isArray(slug) ? slug[slug.length - 1] : slug
  return {
    ...sharedOpenGraph,
    title: categoryName(titleFromSlug(String(lastSlug)), true)
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

  const shownCount = todayPosts?.edges.length ?? 0

  // Mirror the rounding logic in TodayYesterdayModule so we only exclude posts actually rendered.
  // Secondary grid: rounded down to nearest multiple of 3, capped at 6.
  const secondaryCount =
    shownCount >= 3 ? Math.floor(Math.min(shownCount - 1, 6) / 3) * 3 : 0
  // Total rendered in module: hero (1) + secondary cards
  const renderedCount = shownCount >= 1 ? 1 + secondaryCount : 0

  const excludeIds =
    todayPosts?.edges.slice(0, renderedCount).map(e => e.node.id) ?? []

  return (
    <>
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
          <Suspense fallback={<Loading />}>
            <Content slug={slug} excludeIds={excludeIds} />
          </Suspense>
        </section>
        <Sidebar />
      </Container>
    </>
  )
}
