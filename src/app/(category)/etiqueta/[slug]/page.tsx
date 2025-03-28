import { Fragment, Suspense } from 'react'
import { getAllTagsWithSlug } from '@app/actions/getAllTagsWithSlug'
import { getTagPagePosts } from '@app/actions/getTagPagePosts'
import * as Sentry from '@sentry/browser'
import { notFound } from 'next/navigation'
import { AdSenseBanner } from '@components/AdSenseBanner'
import { CategoryArticle } from '@components/CategoryArticle'
import { Container } from '@components/Container'
import { CategoryLoadPosts } from '@components/LoadMorePosts'
import { Loading } from '@components/LoadingCategory'
import { Newsletter } from '@components/Newsletter'
import { PageTitle } from '@components/PageTitle'
import { Sidebar } from '@components/Sidebar'
import { ad } from '@lib/ads'
import { sharedOpenGraph } from '@lib/sharedOpenGraph'
import { TagsPath } from '@lib/types'
import { categoryName, retryFetch, titleFromSlug } from '@lib/utils'

const postsQty = Number(process.env.NEXT_PUBLIC_POSTS_QTY_CATEGORY ?? 10)

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

const Content = async ({ slug }: { slug: string }) => {
  const result = await retryFetch(() => getTagPagePosts(slug, postsQty, ''), {
    maxRetries: 2,
    delayMs: 1000,
    onRetry: attempt =>
      // eslint-disable-next-line no-console
      console.log(`Retry tag ${attempt}`)
  })

  if (!result?.edges) {
    Sentry.captureException('Failed to fetch tag posts')
    return notFound()
  }

  const { edges, pageInfo } = result

  return (
    <>
      {edges.map(({ node }, index) => (
        <Fragment key={node.id}>
          <CategoryArticle
            {...node}
            isFirst={index === 0}
            isLast={index + 1 === edges.length}
          />
          {index + 1 === 5 && <Newsletter className='my-4 md:hidden' />}
          {(index + 1) % 5 === 0 && index !== edges.length - 1 && (
            <AdSenseBanner
              className='bloque-adv-list'
              {...ad.category.in_article}
            />
          )}
        </Fragment>
      ))}
      {edges.length > 9 && (
        <CategoryLoadPosts
          slug={slug}
          postsQty={postsQty}
          endCursor={pageInfo.endCursor}
          getCategoryPagePosts={getTagPagePosts}
        />
      )}
      <AdSenseBanner {...ad.global.more_news} />
    </>
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
