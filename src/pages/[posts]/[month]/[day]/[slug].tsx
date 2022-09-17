/**
 * Single Page
 */
import React, { useEffect, useRef } from 'react'

import { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { isMobile } from 'react-device-detect'

import { HeaderType } from '@components/Header'
import {
  AdDfpSlot,
  Container,
  CoverImage,
  Layout,
  LoadingPage,
  Meta,
  PostBody,
  PostHeader,
  Share,
  Sidebar
} from '@components/index'
import { DFP_ADS_PAGES } from '@lib/ads'
import { getAllPostsWithSlug, getPostAndMorePosts } from '@lib/api'
import { CMS_NAME } from '@lib/constants'
import { usePageStore } from '@lib/hooks/store'
import { PostPage, PostPath } from '@lib/types'

const Post: NextPage<PostPage> = ({ post, ads }) => {
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

  if (isLoading) {
    return <LoadingPage />
  }

  const { featuredImage, content, title, date, categories, customFields } = post
  const cleanContent = content ? content.replace(/<p>&nbsp;<\/p>/gim, '') : ''
  const headTitle = `${title} | ${CMS_NAME}`

  return (
    <Layout headerType={HeaderType.Single}>
      <Head>
        <title>{headTitle}</title>
        <Meta title={title} image={featuredImage?.node?.sourceUrl} />
      </Head>
      <div className='container mx-auto'>
        <AdDfpSlot id={ads.menu.id} style={ads.menu.style} className='pt-4' />
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
            <PostBody content={cleanContent} ads={ads} />
            <div>
              {isMobile ? (
                <AdDfpSlot id={ads.squareC1.id} className='pb-4' />
              ) : (
                <AdDfpSlot id={ads.cover.id} className='pb-4' />
              )}

              {/* Taboola */}
              <div id='taboola-below-article-thumbnails'></div>
            </div>
          </section>
        </section>
      </Container>
      <Sidebar ads={ads} />
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
  const data = await getPostAndMorePosts(slug, preview, previewData)

  if (!data?.post) {
    return {
      redirect: {
        destination: '/pagina-no-encontrada',
        permanent: true
      }
    }
  }

  return {
    props: {
      preview,
      pageTitle: data?.post?.title,
      pageType: '/SINGLE',
      post: data?.post,
      posts: data?.posts,
      ads: DFP_ADS_PAGES(isMobile)
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
