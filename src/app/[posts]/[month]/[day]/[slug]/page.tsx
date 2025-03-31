import { Suspense } from 'react'
import { getLeftPostsForHome } from '@app/actions/getAllPostsForHome'
import { getAllPostsWithSlug } from '@app/actions/getAllPostsWithSlug'
import { getPostAndMorePosts } from '@app/actions/getPostAndMorePosts'
import * as Sentry from '@sentry/browser'
import { notFound } from 'next/navigation'
import { AdSenseBanner } from '@components/AdSenseBanner'
import { CategoryArticle } from '@components/CategoryArticle'
import { Header } from '@components/Header'
import { LoaderSinglePost } from '@components/LoaderSinglePost'
import { Loading } from '@components/LoadingSingle'
import { PostContent } from '@components/PostContent'
import { ad } from '@lib/ads'
import { CMS_URL, RECENT_NEWS } from '@lib/constants'
import { sharedOpenGraph } from '@lib/sharedOpenGraph'
import { PostPath } from '@lib/types'
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
  const content = splitPost({ post })
  const { featuredImage, title, date, categories, customFields, tags, uri } =
    post ?? {}
  const [firstParagraph, secondParagraph] = Array.isArray(content)
    ? content
    : []
  const filteredPostByPostSlug =
    posts?.edges
      ?.filter(
        ({ node }) =>
          node.categories.edges.find(({ node }) => node.slug === postSlug) &&
          node.title !== title
      )
      .slice(0, 6) ?? []
  const props = {
    title,
    uri,
    date,
    categories,
    tags,
    customFields,
    featuredImage,
    firstParagraph,
    secondParagraph,
    relatedPosts: filteredPostByPostSlug
  }

  return (
    <>
      <PostContent
        {...props}
        sidebarContent={
          <>
            {filteredPostByPostSlug.length > 0 &&
              filteredPostByPostSlug.length < 3 && (
                <div className='hidden md:block'>
                  <h5 className='link-post-category border-primary bg-primary relative mb-4 inline-block rounded-sm px-1 pt-1 pb-[3px] font-sans text-xs leading-none text-white uppercase'>
                    {RECENT_NEWS}
                  </h5>
                  {filteredPostByPostSlug.map(({ node }, index) => {
                    return (
                      <CategoryArticle
                        key={node.id}
                        type='sidebar'
                        {...node}
                        isFirst={index === 0}
                        isLast={index + 1 === filteredPostByPostSlug.length}
                        excerpt={undefined}
                      />
                    )
                  })}
                </div>
              )}
          </>
        }
      />
      <LoaderSinglePost
        slug={postSlug}
        cursor={post.contentType?.cursor}
        onFetchMoreAction={getLeftPostsForHome}
        qty={1}
      />
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
      <Header headerType='single' uri={buildSlug} />
      <div className='container mx-auto mt-4'>
        <AdSenseBanner {...ad.global.top_header} />
      </div>
      <Suspense fallback={<Loading slug={buildSlug} />}>
        <Content slug={buildSlug} />
      </Suspense>
    </>
  )
}
