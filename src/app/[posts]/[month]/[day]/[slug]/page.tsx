export const revalidate = 0

import { Fragment, Suspense } from 'react'

import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getAllPostsWithSlug } from '@app/actions/getAllPostsWithSlug'
import { getPostAndMorePosts } from '@app/actions/getPostAndMorePosts'
import { getPostsPerCategorySingle } from '@app/actions/getPostsPerCategory'
import { AdDfpSlot } from '@components/AdDfpSlot'
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
import { RevalidateForm } from '@components/RevalidateForm'
import { Share } from '@components/Share'
import { Sidebar } from '@components/Sidebar'
import { TaboolaFeed } from '@components/TaboolaFeed'
import { DFP_ADS_PAGES as ads } from '@lib/ads'
import { RECENT_NEWS } from '@lib/constants'
import { MetadataProps, PostPath, PostsCategoryQueried } from '@lib/types'
import {
  getMainWordFromSlug,
  retryFetch,
  splitPost,
  getCategoryNode,
  titleFromSlug
} from '@lib/utils'

export async function generateMetadata({
  params
}: MetadataProps): Promise<Metadata> {
  const { slug } = params
  return {
    title: slug ? titleFromSlug(String(slug)) : ''
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
  const result = await retryFetch(
    () =>
      getPostAndMorePosts(slug, false, undefined, getMainWordFromSlug(slug)),
    {
      maxRetries: 2,
      delayMs: 1000,
      // eslint-disable-next-line no-console
      onRetry: attempt => console.log(`Retry post ${attempt} for slug: ${slug}`)
    }
  )

  if (!result?.post) {
    // eslint-disable-next-line no-console
    console.error(`Failed to fetch posts for post: ${slug}`)
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
            <div className='relative mb-4 h-48 w-full sm:h-48 lg:h-80'>
              <CoverImage
                className='relative mb-4 block h-48 w-full overflow-hidden rounded sm:h-48 lg:h-80'
                priority={true}
                title={title}
                coverImage={featuredImage?.node?.sourceUrl}
              />
            </div>
          )}
          <div className='border-b border-solid border-slate-300 pb-4 text-slate-500 md:hidden'>
            <Share />
          </div>
          <PostBody
            firstParagraph={firstParagraph}
            secondParagraph={secondParagraph}
            adId={ads.squareC1.id}
            style={ads.squareC1.style}
          />
          <Newsletter className='mx-4 mb-4 md:hidden' />
          {relatedPostsByCategory.length > 0 && (
            <RelatedPostsByCategory posts={relatedPostsByCategory} />
          )}
          <RelatedPosts posts={posts} />
          <FbComments />
          <div>
            <AdDfpSlot
              id={ads.squareC1.id}
              style={ads.squareC1.style}
              className='show-mobile pb-4'
            />
            <AdDfpSlot
              id={ads.cover.id}
              style={ads.cover.style}
              className='show-desktop pb-4'
            />
            <TaboolaFeed slug={slug} />
          </div>
        </section>
        <Sidebar
          adID={ads.sidebar.id}
          style={ads.sidebar.style}
          adID2={ads.sidebar.id}
        >
          {relatedPostsByCategory.length > 0 && (
            <div className='hidden md:block'>
              <h5 className='link-post-category relative mb-4 inline-block rounded border-primary bg-primary px-1 pb-[3px] pt-1 text-xs uppercase leading-none text-white'>
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

export default async function Page({
  params
}: {
  readonly params: { slug: string; posts: string; month: string; day: string }
}) {
  const { slug, posts, month, day } = params
  const buildSlug = `/${[posts, month, day, slug].filter(Boolean).join('/')}`
  return (
    <>
      <RevalidateForm />
      <Header headerType='single' />
      <div className='container mx-auto'>
        <AdDfpSlot
          id={ads.menu.id}
          style={ads.menu.style}
          className='show-desktop pt-4'
        />
        <AdDfpSlot
          id={ads.menu_mobile.id}
          style={ads.menu_mobile.style}
          className='show-mobile pt-4'
        />
      </div>
      <Suspense fallback={<Loading slug={buildSlug} />}>
        <Content slug={buildSlug} />
      </Suspense>
    </>
  )
}
