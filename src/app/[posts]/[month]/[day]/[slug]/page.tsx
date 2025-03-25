import { Fragment, Suspense } from 'react'
import { getAllPostsWithSlug } from '@app/actions/getAllPostsWithSlug'
import { getPostAndMorePosts } from '@app/actions/getPostAndMorePosts'
import { getPostsPerCategorySingle } from '@app/actions/getPostsPerCategory'
import * as Sentry from '@sentry/browser'
import { notFound } from 'next/navigation'
import { AdSenseBanner } from '@components/AdSenseBanner'
import { CategoryArticle } from '@components/CategoryArticle'
import { Container } from '@components/Container'
import { CoverImage } from '@components/CoverImage'
import { FbComments } from '@components/FbComments'
import { Header } from '@components/Header'
import { Loading } from '@components/LoadingSingle'
import { Newsletter } from '@components/Newsletter'
import { PostBody } from '@components/PostBody'
import { PostHeader } from '@components/PostHeader'
import { RelatedPosts } from '@components/RelatedPosts'
import { RelatedPostsByCategory } from '@components/RelatedPostsByCategory'
import { Share } from '@components/Share'
import { Sidebar } from '@components/Sidebar'
import { ad } from '@lib/ads'
import { CMS_URL, RECENT_NEWS } from '@lib/constants'
import { sharedOpenGraph } from '@lib/sharedOpenGraph'
import { PostPath, PostsCategoryQueried } from '@lib/types'
import {
  getCategoryNode,
  getMainWordFromSlug,
  retryFetch,
  splitPost
} from '@lib/utils'
import { cleanExcerpt } from '@lib/utils/cleanExcerpt'

type Params = Promise<{
  slug: string
  posts: string
  month: string
  day: string
}>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

async function getPostData(slug: string) {
  return retryFetch(
    () =>
      getPostAndMorePosts(slug, false, undefined, getMainWordFromSlug(slug)),
    {
      maxRetries: 2,
      delayMs: 1000,
      onRetry: attempt =>
        // eslint-disable-next-line no-console
        console.log(`Retry post ${attempt} for slug: ${slug}`)
    }
  )
}

export async function generateMetadata({
  params
}: {
  params: Params
  searchParams: SearchParams
}) {
  const { posts, month, day, slug } = await params

  const slugUrl = `/${[posts, month, day, slug].filter(Boolean).join('/')}`
  const { post } = (await getPostData(slugUrl)) ?? {}
  const { featuredImage, title, uri, excerpt, date } = post ?? {}
  const description = cleanExcerpt(excerpt)
  const url = featuredImage?.node?.sourceUrl ?? ''

  return {
    ...sharedOpenGraph,
    title,
    description,
    openGraph: {
      ...sharedOpenGraph.openGraph,
      title,
      description,
      url: `${CMS_URL}${uri}`,
      images: [
        {
          url,
          width: 800,
          height: 600,
          alt: title
        }
      ],
      type: 'article',
      publishedTime: date ? new Date(date).toISOString() : ''
    },
    twitter: {
      ...sharedOpenGraph.twitter,
      title,
      description,
      images: {
        url,
        alt: title
      }
    }
  }
}

export async function generateStaticParams() {
  const allPosts: PostPath = await getAllPostsWithSlug()

  return (
    allPosts?.edges.map(({ node }) => {
      const { uri } = node
      const [posts, month, day, slug] = uri.split('/').filter(Boolean)
      return { posts, month, day, slug }
    }) ?? []
  )
}

const Content = async ({ slug }: { slug: string }) => {
  const result = await getPostData(slug)

  if (!result?.post) {
    Sentry.captureException(`Failed to fetch posts for post: ${slug}`)
    return notFound()
  }

  const { post, posts } = result

  const postSlug = getCategoryNode(post.categories)?.slug ?? ''
  const relatedCategoryPosts: PostsCategoryQueried =
    await getPostsPerCategorySingle(postSlug, 6)
  const relatedPostsByCategory = relatedCategoryPosts?.edges ?? []
  const content = splitPost({ post })
  const { featuredImage, title, date, categories, customFields } = post ?? {}
  const [firstParagraph, secondParagraph] = Array.isArray(content)
    ? content
    : []

  return (
    <>
      <PostHeader
        title={title}
        date={date}
        categories={categories}
        {...customFields}
      />
      <Container className='py-4' sidebar>
        <section className='w-full md:w-2/3 md:pr-8 lg:w-3/4'>
          {featuredImage && (
            <div className='relative mb-4 w-full lg:max-h-[500px]'>
              <CoverImage
                className='relative mb-4 block w-full overflow-hidden rounded-sm lg:max-h-[500px]'
                priority={true}
                title={title}
                coverImage={featuredImage?.node?.sourceUrl}
                fullHeight
              />
            </div>
          )}
          <div className='border-b border-solid border-slate-300 pb-4 text-slate-500 md:hidden'>
            <Share />
          </div>
          <PostBody
            firstParagraph={firstParagraph}
            secondParagraph={secondParagraph}
          />
          <Newsletter className='mx-4 mb-4 md:hidden' />
          {relatedPostsByCategory.length > 0 && (
            <RelatedPostsByCategory posts={relatedPostsByCategory} />
          )}
          <RelatedPosts posts={posts} />
          <FbComments />
          <AdSenseBanner {...ad.global.more_news} />
        </section>
        <Sidebar>
          {relatedPostsByCategory.length > 0 && (
            <div className='hidden md:block'>
              <h5 className='link-post-category border-primary bg-primary relative mb-4 inline-block rounded-sm px-1 pt-1 pb-[3px] font-sans text-xs leading-none text-white uppercase'>
                {RECENT_NEWS}
              </h5>
              {relatedPostsByCategory.map(({ node }, index) => {
                if (node.title === title || index > 5) {
                  return null
                }
                return (
                  <Fragment key={node.id}>
                    <CategoryArticle
                      type='sidebar'
                      key={node.id}
                      {...node}
                      isFirst={index === 0}
                      isLast={index + 1 === relatedPostsByCategory.length}
                    />
                  </Fragment>
                )
              })}
            </div>
          )}
        </Sidebar>
      </Container>
    </>
  )
}

export default async function Page(props: {
  params: Params
  searchParams: SearchParams
}) {
  const params = await props.params
  const slug = params.slug
  const posts = params.posts
  const month = params.month
  const day = params.day

  const buildSlug = `/${[posts, month, day, slug].filter(Boolean).join('/')}`
  return (
    <>
      <Header headerType='single' />
      <div className='container mx-auto mt-4'>
        <AdSenseBanner {...ad.global.top_header} />
      </div>
      <Suspense fallback={<Loading slug={buildSlug} />}>
        <Content slug={buildSlug} />
      </Suspense>
    </>
  )
}
