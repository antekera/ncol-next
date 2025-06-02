export const dynamic = 'force-static'

import { MENU, MENU_B } from '@lib/constants'
import { Content } from '@blocks/content/CategoryPosts'
import { Container } from '@components/Container'
import { PageTitle } from '@components/PageTitle'
import { Sidebar } from '@components/Sidebar'
import { sharedOpenGraph } from '@lib/sharedOpenGraph'
import { categoryName, titleFromSlug } from '@lib/utils'
import { getStaticSlugs } from '@lib/utils/getStaticSlugs'
import { Suspense } from 'react'
import { Loading } from '@components/LoadingCategory'
import { ExchangeRateBanner } from '@components/ExchangeRateBanner'

type Params = Promise<{ slug: string }>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export async function generateMetadata({
  params
}: {
  params: Params
  searchParams: SearchParams
}) {
  const { slug } = await params
  return {
    ...sharedOpenGraph,
    title: categoryName(titleFromSlug(String(slug)), true)
  }
}

export async function generateStaticParams() {
  const slugs = getStaticSlugs([...MENU, ...MENU_B])
  return slugs.map(slug => ({
    slug: [slug.replace(/^categoria\//, '')]
  }))
}

export default async function Page(props: {
  params: Params
  searchParams: SearchParams
}) {
  const params = await props.params
  const slug = Array.isArray(params.slug)
    ? params.slug[params.slug.length - 1]
    : params.slug

  return (
    <>
      <PageTitle text={titleFromSlug(slug)} />
      <ExchangeRateBanner />
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
      <Container className='py-10' sidebar>
        <section className='w-full md:w-2/3 md:pr-8 lg:w-3/4'>
          <Suspense fallback={<Loading />}>
            <Content slug={slug} />
          </Suspense>
        </section>
        <Sidebar />
      </Container>
    </>
  )
}
