/**
 * Single Page
 */
import React, { useEffect, useRef } from 'react'

import { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import ErrorPage from 'next/error'
import Head from 'next/head'
import Script from 'next/script'

import { HeaderType } from '@components/Header'
import {
  Container,
  CoverImage,
  Layout,
  LoadingPage,
  Meta,
  PostBody,
  PostHeader,
  Share
} from '@components/index'
import { getAllPostsWithSlug, getPostAndMorePosts } from '@lib/api'
import { CMS_NAME } from '@lib/constants'
import { usePageStore } from '@lib/hooks/store'
import { PostPage, PostPath } from '@lib/types'

const Post: NextPage<PostPage> = ({ post }) => {
  const ref = useRef<HTMLInputElement>(null)
  const { isLoading, setPageSetupState } = usePageStore()

  useEffect(() => {
    setPageSetupState({
      contentHeight: ref.current?.clientHeight
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  if (isLoading) {
    return <LoadingPage />
  }

  if (!post) {
    return <ErrorPage statusCode={500} />
  }

  const { featuredImage, content, title, date, categories, customFields } = post
  const headTitle = `${title} | ${CMS_NAME}`

  return (
    <Layout headerType={HeaderType.Single}>
      <Head>
        <title>{headTitle}</title>
        <Meta title={title} image={featuredImage?.node?.sourceUrl} />
      </Head>
      <PostHeader
        title={title}
        date={date}
        categories={categories}
        {...customFields}
      />
      <Container className='flex flex-row flex-wrap py-4' sidebar>
        <section ref={ref}>
          {featuredImage && (
            <div className='relative w-full h-48 mb-4 sm:h-48 lg:h-80'>
              <CoverImage
                className='rounded'
                priority={true}
                title={title}
                coverImage={featuredImage?.node?.sourceUrl}
              />
            </div>
          )}
          <div className='pb-4 border-b border-solid md:hidden border-slate-300 text-slate-500'>
            <Share />
          </div>
          {content && <PostBody content={content} />}
          <div>
            {/* Google related */}
            <ins
              className='adsbygoogle'
              data-ad-format='autorelaxed'
              data-ad-client='ca-pub-6715059182926587'
              data-ad-slot='5600251209'
            />
            <Script
              id='adsbygoogle'
              strategy='afterInteractive'
              dangerouslySetInnerHTML={{
                __html: `
                      (adsbygoogle = window.adsbygoogle || []).push({});`
              }}
            />
            {/* Taboola */}
            <div id='taboola-below-article-thumbnails'></div>
            <Script
              id='taboola'
              strategy='afterInteractive'
              dangerouslySetInnerHTML={{
                __html: `
                      window._taboola = window._taboola || [];
                    _taboola.push({
                    mode: 'thumbnails-a',
                    container: 'taboola-below-article-thumbnails',
                    placement: 'Below Article Thumbnails',
                    target_type: 'mix'
                  });`
              }}
            />
          </div>
        </section>
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
  const data = await getPostAndMorePosts(slug, preview, previewData)

  return {
    props: {
      preview,
      pageTitle: data?.post?.title,
      pageType: '/SINGLE',
      post: data?.post,
      posts: data?.posts
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
    fallback: false
  }
}
