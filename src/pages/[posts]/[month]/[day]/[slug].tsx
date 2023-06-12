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
  getCategoryPagePosts
} from '@lib/api'
import { CMS_NAME, RECENT_NEWS } from '@lib/constants'
import { usePageStore } from '@lib/hooks/store'
import { PostPage, PostPath } from '@lib/types'
import { getMainWordFromSlug, splitPost, getCategoryNode } from '@lib/utils'

const Post: NextPage<PostPage> = ({
  post,
  content,
  ads,
  posts,
  relatedPostsByCategory
}) => {
  const ref = useRef<HTMLInputElement>(null)
  const slidesContainerRef = useRef<HTMLDivElement>(null)
  const prevButtonRef = useRef<HTMLButtonElement>(null)
  const nextButtonRef = useRef<HTMLButtonElement>(null)

  const { setPageSetupState } = usePageStore()
  const router = useRouter()
  const isLoading = router.isFallback

  useEffect(() => {
    setPageSetupState({
      contentHeight: ref.current?.clientHeight
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      slidesContainerRef.current?.querySelector('.slide')?.clientWidth || 0
    const handleNextClick = () => {
      if (slidesContainerRef.current) {
        slidesContainerRef.current.scrollLeft += slideWidth
      }
    }

    const handlePrevClick = () => {
      if (slidesContainerRef.current) {
        slidesContainerRef.current.scrollLeft -= slideWidth
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

  if (isLoading || router.query?.revalidate) {
    fetch(
      `/api/revalidate?path=${router.asPath}&token=${process.env.REVALIDATE_KEY}`
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
          className='pt-4 show-desktop'
        />
        <AdDfpSlot
          id={ads.menu_mobile.id}
          style={ads.menu_mobile.style}
          className='pt-4 show-mobile'
        />
      </div>
      <PostHeader
        title={title}
        date={date}
        categories={categories}
        {...customFields}
      />
      <Container className='py-4' sidebar>
        <section className='w-full md:pr-8 md:w-2/3 lg:w-3/4'>
          <section ref={ref}>
            {featuredImage && (
              <div className='relative w-full h-48 mb-4 sm:h-48 lg:h-80'>
                <CoverImage
                  className='relative block w-full h-48 mb-4 overflow-hidden rounded sm:h-48 lg:h-80'
                  priority={true}
                  title={title}
                  coverImage={featuredImage?.node?.sourceUrl}
                />
              </div>
            )}
            <div className='pb-4 border-b border-solid md:hidden border-slate-300 text-slate-500'>
              <Share />
            </div>
            <PostBody
              firstParagraph={firstParagraph}
              secondParagraph={secondParagraph}
              adId={ads.squareC1.id}
            />
            <Newsletter className='mx-4 mb-4 md:hidden' />
            {relatedPostsByCategory.length > 0 && (
              <div className='sticky bottom-0 left-0 z-20 pt-2 bg-white border-t -mx-7 -sm:mx-7 md:hidden border-slate-200'>
                <h5 className='relative inline-block px-1 pt-1 text-xs leading-none text-white uppercase rounded ml-7 link-post-category bg-primary border-primary pb-[3px]'>
                  {RECENT_NEWS}
                </h5>
                <div
                  ref={slidesContainerRef}
                  className='flex overflow-hidden overflow-x-auto rounded flex-nowrap slides-container snap-x snap-mandatory space-x-3 scroll-smooth md:hidden before:w-7 before:shrink-0 after:w-7 after:shrink-0'
                >
                  {relatedPostsByCategory?.map(({ node }, index) => (
                    <div key={index} className='flex-none w-48 pt-2 slide'>
                      <CategoryArticle
                        type='recent_news'
                        {...node}
                        isFirst={index === 0}
                        isLast={index + 1 === relatedPostsByCategory.length}
                      />
                    </div>
                  ))}
                </div>
                <div className='absolute z-40 items-center h-full top-12 left-2 md:flex'>
                  <button
                    ref={prevButtonRef}
                    className='w-10 h-10 rounded-full prev bg-slate-500 text-neutral-900 group '
                    aria-label='prev'
                  >
                    <span className='relative text-4xl text-white pointer-events-none material-symbols-rounded -top-[1px] -left-[1px] group-active:-translate-x-1 transition-all duration-200 ease-linear'>
                      chevron_left
                    </span>
                  </button>
                </div>
                <div className='absolute z-40 items-center h-full top-12 right-2 md:flex'>
                  <button
                    ref={nextButtonRef}
                    className='w-10 h-10 rounded-full prev bg-slate-500 text-neutral-900 group'
                    aria-label='next'
                  >
                    <span className='relative text-4xl text-white pointer-events-none material-symbols-rounded -top-[1px] -right-[1px] group-active:translate-x-1 transition-all duration-200 ease-linear'>
                      chevron_right
                    </span>
                  </button>
                </div>
              </div>
            )}
            <RelatedPosts {...posts} />
            <FbComments url={router.asPath} />
            <div>
              <AdDfpSlot id={ads.squareC1.id} className='pb-4 show-mobile' />
              <AdDfpSlot id={ads.cover.id} className='pb-4 show-desktop' />
              {/* Taboola */}
              <div id='taboola-below-article-thumbnails'></div>
            </div>
          </section>
        </section>
        <Sidebar adID={ads.sidebar.id} adID2={ads.sidebar.id}>
          {relatedPostsByCategory.length > 0 && (
            <div className='hidden md:block'>
              <h5 className='relative inline-block px-1 pt-1 mb-4 text-xs leading-none text-white uppercase rounded link-post-category bg-primary border-primary pb-[3px]'>
                {RECENT_NEWS}
              </h5>
              {relatedPostsByCategory.map(({ node }, index) => {
                if (node.title === title || index > 5) {
                  return null
                }
                return (
                  <Fragment key={node.id}>
                    <CategoryArticle
                      type='recent_news'
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
  const slug = params.slug || ''
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
  const postSlug = getCategoryNode(data.post.categories)?.slug || ''

  const relatedCategoryPosts = await getCategoryPagePosts(postSlug, 6)

  return {
    props: {
      preview,
      pageTitle: data.post.title,
      pageType: '/SINGLE',
      post: data.post,
      content: content,
      posts: data.posts || [],
      relatedPostsByCategory: relatedCategoryPosts?.edges || [],
      ads: DFP_ADS_PAGES
    },
    revalidate: 84600
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const allPosts: PostPath = await getAllPostsWithSlug()

  if (!allPosts) {
    return { paths: [], fallback: false }
  }

  return {
    paths: allPosts.edges.map(({ node }) => `${node.uri}`) || [],
    fallback: true
  }
}
