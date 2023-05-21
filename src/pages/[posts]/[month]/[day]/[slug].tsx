/**
 * Single Page
 */
import React, { useEffect, useRef } from 'react'

import { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { AdDfpSlot } from '@components/AdDfpSlot'
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
import { getAllPostsWithSlug, getPostAndMorePosts } from '@lib/api'
import { CMS_NAME } from '@lib/constants'
import { usePageStore } from '@lib/hooks/store'
import { PostPage, PostPath } from '@lib/types'
import { getMainWordFromSlug, splitPost } from '@lib/utils'

const Post: NextPage<PostPage> = ({ post, content, ads, posts }) => {
  const ref = useRef<HTMLInputElement>(null)
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

  if (isLoading) {
    fetch(
      `/api/revalidate?path=${router.asPath}&token=${process.env.REVALIDATE_KEY}`
    )
    return <LoadingPage />
  }

  const { featuredImage, title, date, categories, customFields } = post
  const headTitle = `${title} | ${CMS_NAME}`
  const [firstParagraph, secondParagraph] = content

  return (
    <Layout headerType={HeaderType.Single}>
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
            <RelatedPosts {...posts} />
            <Newsletter className='my-4 md:hidden' />
            <FbComments url={router.asPath} />
            <div>
              <AdDfpSlot id={ads.squareC1.id} className='pb-4 show-mobile' />
              <AdDfpSlot id={ads.cover.id} className='pb-4 show-desktop' />
              {/* Taboola */}
              <div id='taboola-below-article-thumbnails'></div>
            </div>
          </section>
        </section>
        <Sidebar adID={ads.sidebar.id} adID2={ads.sidebar.id} />
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

  const content = splitPost({ post: data?.post })

  return {
    props: {
      preview,
      pageTitle: data.post?.title,
      pageType: '/SINGLE',
      post: data.post,
      content: content,
      posts: data?.posts || [],
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
