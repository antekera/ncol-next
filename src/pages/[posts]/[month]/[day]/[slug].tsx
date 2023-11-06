/**
 * Single Page
 */
import React, { useEffect, useRef, Fragment } from 'react'

import { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { AdDfpSlot } from '@components/AdDfpSlot'
import { CategoryArticle } from '@components/CategoryArticle'
import { Container } from '@components/Container'
import { CoverImage } from '@components/CoverImage'
import { FbComments } from '@components/FbComments'
import { HeaderType } from '@components/Header'
import { Layout } from '@components/Layout'
import { LoadingPage } from '@components/LoadingPage'
import { Meta } from '@components/Meta'
import { Newsletter } from '@components/Newsletter'
import { PostBody } from '@components/PostBody'
import { PostHeader } from '@components/PostHeader'
import { RelatedPosts } from '@components/RelatedPosts'
import { Share } from '@components/Share'
import { Sidebar } from '@components/Sidebar'
import { DFP_ADS_PAGES } from '@lib/ads'
import {
  getAllPostsWithSlug,
  getPostAndMorePosts,
  getPostsPerCategory
} from '@lib/api'
import { CMS_NAME, RECENT_NEWS } from '@lib/constants'
import { usePageStore } from '@lib/hooks/store'
import { PostPage, PostPath } from '@lib/types'
import { getMainWordFromSlug, splitPost, getCategoryNode } from '@lib/utils'

const { SINGLE_REVALIDATE_TIME, REVALIDATE_KEY, ALLOW_REVALIDATE } =
  process.env || {}

const Post: NextPage<PostPage> = ({
  post,
  content,
  ads,
  posts,
  relatedPostsByCategory,
  allowRevalidate
}) => {
  const ref = useRef<HTMLInputElement>(null)
  const slidesContainerRef = useRef<HTMLDivElement>(null)
  const prevButtonRef = useRef<HTMLButtonElement>(null)
  const nextButtonRef = useRef<HTMLButtonElement>(null)
  const refLoaded = useRef(false)

  const { setPageSetupState } = usePageStore()
  const router = useRouter()
  const isLoading = router.isFallback

  useEffect(() => {
    setPageSetupState({
      contentHeight: ref.current?.clientHeight
    })
  }, [isLoading])

  useEffect(() => {
    if (!window) {
      // @ts-ignore
      window._taboola = window._taboola || []
      // @ts-ignore
      _taboola.push({ article: 'auto' })

      // @ts-ignore
      window._taboola.push({
        mode: 'thumbnails-a',
        container: 'taboola-below-article-thumbnails',
        placement: 'Below Article Thumbnails',
        target_type: 'mix'
      })
    }

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    !(function (e, f, u, i) {
      if (!document.getElementById(i)) {
        // @ts-ignore
        e.async = 1
        e.src = u
        e.id = i
        // @ts-ignore
        f.parentNode.insertBefore(e, f)
      }
    })(
      document.createElement('script'),
      document.getElementsByTagName('script')[0],
      '//cdn.taboola.com/libtrc/noticiascol-noticiascol/loader.js',
      'tb_loader_script'
    )
    if (window.performance && typeof window.performance.mark == 'function') {
      window.performance.mark('tbl_ic')
    }
  }, [])

  useEffect(() => {
    const slideWidth =
      slidesContainerRef.current?.querySelector('.slide')?.clientWidth ?? 0
    const gap = 12
    const handleNextClick = () => {
      if (slidesContainerRef.current) {
        slidesContainerRef.current.scrollLeft += slideWidth + gap
      }
    }

    const handlePrevClick = () => {
      if (slidesContainerRef.current) {
        slidesContainerRef.current.scrollLeft -= slideWidth + gap
      }
    }

    const prevButton = prevButtonRef.current
    const nextButton = nextButtonRef.current

    if (nextButton && prevButton) {
      nextButton.addEventListener('click', handleNextClick)
      prevButton.addEventListener('click', handlePrevClick)
    }

    return () => {
      // Cleanup event listeners when component unmounts
      if (nextButton && prevButton) {
        nextButton.removeEventListener('click', handleNextClick)
        prevButton.removeEventListener('click', handlePrevClick)
      }
    }
  }, [])

  if (
    (post && isLoading && !refLoaded.current) ||
    (!refLoaded.current && allowRevalidate && router.query?.revalidate)
  ) {
    fetch(`/api/revalidate?path=${router.asPath}&token=${REVALIDATE_KEY}`).then(
      () => {
        refLoaded.current = true
        router.replace(router.asPath)
      }
    )
    return <LoadingPage />
  }

  const { featuredImage, title, date, categories, customFields } = post
  const headTitle = `${title} | ${CMS_NAME}`
  const [firstParagraph, secondParagraph] = content

  return (
    <Layout headerType={HeaderType.Single} categories={categories}>
      <Head>
        <title>{headTitle}</title>
        <Meta title={title} image={featuredImage?.node?.sourceUrl} />
      </Head>
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
          <section ref={ref}>
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
              <div className='-sm:mx-7 sticky bottom-0 left-0 z-20 -mx-7 border-t border-slate-300 bg-white pt-2 md:hidden'>
                <h5 className='link-post-category relative ml-7 inline-block rounded border-primary bg-primary px-1 pb-[3px] pt-1 text-xs uppercase leading-none text-white'>
                  {RECENT_NEWS}
                </h5>
                <div
                  ref={slidesContainerRef}
                  className='slides-container flex snap-x snap-mandatory flex-nowrap space-x-3 overflow-hidden overflow-x-auto scroll-smooth rounded before:w-7 before:shrink-0 after:w-7 after:shrink-0 md:hidden'
                >
                  {relatedPostsByCategory?.map(({ node }, index) => (
                    <div key={index} className='slide w-48 flex-none pt-2'>
                      <CategoryArticle
                        type='recent_news'
                        {...node}
                        isFirst={index === 0}
                        isLast={index + 1 === relatedPostsByCategory.length}
                      />
                    </div>
                  ))}
                </div>
                <div className='absolute left-2 top-12 z-40 h-full items-center md:flex'>
                  <button
                    ref={prevButtonRef}
                    className='prev group h-10 w-10 rounded-full bg-slate-500 text-neutral-900 '
                    aria-label='prev'
                  >
                    <span className='material-symbols-rounded pointer-events-none relative -left-[1px] -top-[1px] text-4xl text-white transition-all duration-200 ease-linear group-active:-translate-x-1'>
                      chevron_left
                    </span>
                  </button>
                </div>
                <div className='absolute right-2 top-12 z-40 h-full items-center md:flex'>
                  <button
                    ref={nextButtonRef}
                    className='prev group h-10 w-10 rounded-full bg-slate-500 text-neutral-900'
                    aria-label='next'
                  >
                    <span className='material-symbols-rounded pointer-events-none relative -right-[1px] -top-[1px] text-4xl text-white transition-all duration-200 ease-linear group-active:translate-x-1'>
                      chevron_right
                    </span>
                  </button>
                </div>
              </div>
            )}
            <RelatedPosts {...posts} />
            <FbComments url={router.asPath} />
            <div>
              <AdDfpSlot id={ads.squareC1.id} className='show-mobile pb-4' />
              <AdDfpSlot id={ads.cover.id} className='show-desktop pb-4' />
              {/* Taboola */}
              <div id='taboola-below-article-thumbnails'></div>
            </div>
          </section>
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
    </Layout>
  )
}

export default Post

export const getStaticProps: GetStaticProps = async ({
  params = {},
  preview = false,
  previewData
}) => {
  const slug = params.slug ?? ''
  const data = await getPostAndMorePosts(
    slug as string,
    preview,
    previewData,
    getMainWordFromSlug(slug as string)
  )

  if (!data?.post) {
    return {
      notFound: true
    }
  }

  const content = splitPost({ post: data.post })
  const postSlug = getCategoryNode(data.post.categories)?.slug ?? ''

  if (!Array.isArray(content)) {
    return {
      notFound: true
    }
  }

  const relatedCategoryPosts = await getPostsPerCategory(postSlug, 6)
  return {
    props: {
      preview,
      pageTitle: data.post.title,
      pageType: '/SINGLE',
      post: data.post,
      content: content,
      posts: data.posts,
      relatedPostsByCategory: relatedCategoryPosts?.edges || [],
      ads: DFP_ADS_PAGES,
      allowRevalidate: ALLOW_REVALIDATE === 'true'
    },
    revalidate: SINGLE_REVALIDATE_TIME
      ? Number(SINGLE_REVALIDATE_TIME)
      : undefined
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const allPosts: PostPath = await getAllPostsWithSlug()

  if (!allPosts) {
    return { paths: [], fallback: false }
  }

  return {
    paths: allPosts.edges.map(({ node }) => `${node.uri}`) || [],
    fallback: 'blocking'
  }
}
