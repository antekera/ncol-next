export const dynamic = 'force-static'

import { Suspense } from 'react'
import { getAllTagsWithSlug } from '@app/actions/getAllTagsWithSlug'
import { AdSenseBanner } from '@components/AdSenseBanner'
import { Container } from '@components/Container'
import { Loading } from '@components/LoadingCategory'
import { PageTitle } from '@components/PageTitle'
import { Sidebar } from '@components/Sidebar'
import { ad } from '@lib/ads'
import { sharedOpenGraph } from '@lib/sharedOpenGraph'
import { TagsPath } from '@lib/types'
import { categoryName, titleFromSlug } from '@lib/utils'
import { Content } from '@blocks/content/TagPosts'

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
  const tagList: TagsPath = await getAllTagsWithSlug()

  return (
    tagList?.edges.map(({ node }) => ({
      slug: node.slug
    })) ?? []
  )
}

export default async function Page(props: {
  params: Params
  searchParams: SearchParams
}) {
  const params = await props.params
  const slug = params.slug

  return (
    <>
      <PageTitle text={`#${titleFromSlug(slug)}`} className='bg-slate-500' />
      <div className='container mx-auto mt-4'>
        <AdSenseBanner {...ad.global.top_header} />
      </div>
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
