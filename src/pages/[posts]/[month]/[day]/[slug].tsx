/**
 * Single Page
 */
import { useEffect } from 'react'

import { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import ErrorPage from 'next/error'
import Head from 'next/head'
import { useRouter } from 'next/router'

import {
  Container,
  CoverImage,
  Layout,
  LoadingPage,
  PostBody,
  PostHeader,
  Share,
} from 'components'
import { getAllPostsWithSlug, getPostAndMorePosts } from 'lib/api'
import { CMS_NAME, HEADER_TYPE } from 'lib/constants'
import { usePageStore } from 'lib/hooks/store'
import { PostPage, PostsQueried } from 'lib/types'

const Post: NextPage<PostPage> = ({ post, posts }) => {
  const router = useRouter()
  const isLoading = router.isFallback

  const { setPageSetupState } = usePageStore()

  useEffect(() => {
    setPageSetupState({
      headerType: HEADER_TYPE.SINGLE,
      isLoading,
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setPageSetupState({
      isLoading,
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  if (isLoading) {
    return <LoadingPage />
  }

  if (!post || !posts) {
    return <ErrorPage statusCode={404} />
  }
  const { featuredImage, content, title, date, categories, customFields } = post

  return (
    <Layout>
      <Head>
        <title>
          {title} | {CMS_NAME}
        </title>
        <meta property='og:image' content={featuredImage?.node.sourceUrl} />
      </Head>
      <PostHeader
        title={title}
        date={date}
        categories={categories}
        {...customFields}
      />
      <Container className='flex flex-row flex-wrap py-4' sidebar>
        {featuredImage && (
          <CoverImage
            title={title}
            coverImage={featuredImage?.node?.sourceUrl}
          />
        )}
        <div className='pb-4 border-b md:hidden border-slate-300 text-slate-500'>
          <Share />
        </div>
        <section>{content && <PostBody content={content} />}</section>
      </Container>
    </Layout>
  )
}

export default Post

export const getStaticProps: GetStaticProps = async ({
  params = {},
  preview = false,
  previewData,
}) => {
  const data = await getPostAndMorePosts(params.slug, preview, previewData)
  return {
    props: {
      preview,
      post: data.post,
      posts: data.posts,
    },
    revalidate: 84600,
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const allPosts: PostsQueried = await getAllPostsWithSlug()

  return {
    paths: allPosts.edges.map(({ node }) => `${node.uri}`) || [],
    fallback: true,
  }
}
