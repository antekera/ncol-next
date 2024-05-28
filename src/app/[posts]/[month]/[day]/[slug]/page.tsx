import { Fragment } from 'react'

import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getPostAndMorePosts } from '@app/actions/getPostAndMorePosts'
import { getPostsPerCategory } from '@app/actions/getPostsPerCategory'
import { AdDfpSlot } from '@components/AdDfpSlot'
import { CategoryArticle } from '@components/CategoryArticle'
import { Container } from '@components/Container'
import { CoverImage } from '@components/CoverImage'
import { FbComments } from '@components/FbComments'
import { Header } from '@components/Header'
import { Newsletter } from '@components/Newsletter'
import { PostBody } from '@components/PostBody'
import { PostHeader } from '@components/PostHeader'
import { RelatedPosts } from '@components/RelatedPosts'
import { RelatedPostsByCategory } from '@components/RelatedPostsByCategory'
import { Share } from '@components/Share'
import { Sidebar } from '@components/Sidebar'
import { TaboolaFeed } from '@components/TaboolaFeed'
import { DFP_ADS_PAGES as ads } from '@lib/ads'
import { RECENT_NEWS } from '@lib/constants'
import { MetadataProps, PostsCategoryQueried } from '@lib/types'
import { getMainWordFromSlug, splitPost, getCategoryNode } from '@lib/utils'
import { titleFromSlug } from '@lib/utils'

export async function generateMetadata({
  params
}: MetadataProps): Promise<Metadata> {
  const { slug } = params
  return {
    title: slug ? titleFromSlug(String(slug)) : ''
  }
}

export default async function Page({ params }: { params: { slug: string } }) {
  const { post, posts } = await getPostAndMorePosts(
    params.slug,
    false,
    undefined,
    getMainWordFromSlug(params.slug)
  )

  if (!post) {
    return notFound()
  }

  const postSlug = getCategoryNode(post.categories)?.slug ?? ''
  const relatedCategoryPosts: PostsCategoryQueried = await getPostsPerCategory(
    postSlug,
    6
  )
  const relatedPostsByCategory = relatedCategoryPosts?.edges ?? []
  const content = splitPost({ post })
  const { featuredImage, title, date, categories, customFields } = post ?? {}
  const [firstParagraph, secondParagraph] = Array.isArray(content)
    ? content
    : []

  return (
    <>
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
          />
          <Newsletter className='mx-4 mb-4 md:hidden' />
          {relatedPostsByCategory.length > 0 && (
            <RelatedPostsByCategory posts={relatedPostsByCategory} />
          )}
          <RelatedPosts posts={posts} />
          <FbComments />
          <div>
            <AdDfpSlot id={ads.squareC1.id} className='show-mobile pb-4' />
            <AdDfpSlot id={ads.cover.id} className='show-desktop pb-4' />
            <TaboolaFeed />
          </div>
        </section>
        <Sidebar adID={ads.sidebar.id} adID2={ads.sidebar.id}>
          {relatedPostsByCategory.length > 0 && (
            <div className='hidden md:block'>
              <h5 className='link-post-category relative mb-4 inline-block rounded border-primary bg-primary px-1 pb-[3px] pt-1 text-xs uppercase leading-none text-white'>
                {RECENT_NEWS}
              </h5>
              {relatedPostsByCategory.map(({ node }, index) => {
                if (node.title === title || index > 5) {
                  return undefined
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
