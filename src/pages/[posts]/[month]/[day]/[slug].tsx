/**
 * Single Page
 */
import { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import ErrorPage from 'next/error'
import Head from 'next/head'
import { useRouter } from 'next/router'

import {
  Layout,
  PostHeader,
  Container,
  CoverImage,
  PostBody,
  SectionSeparator,
} from 'components'
import MoreStories from 'components/more-stories'
import Tags from 'components/tags'
import { getAllPostsWithSlug, getPostAndMorePosts } from 'lib/api'
import { CMS_NAME } from 'lib/constants'
import { PostPage, PostsQueried } from 'lib/types'

const Post: NextPage<PostPage> = ({ post, posts, preview }) => {
  const router = useRouter()

  if (!post || !posts) {
    return <ErrorPage statusCode={404} />
  }

  const morePosts = posts?.edges
  const { featuredImage, content, tags, title, date, categories } = post

  if (router.isFallback) {
    return <div>Loading...</div>
  }

  return (
    <Layout preview={preview}>
      <Head>
        <title>
          {title} | {CMS_NAME}
        </title>
        <meta property='og:image' content={featuredImage?.node.sourceUrl} />
      </Head>
      <PostHeader title={title} date={date} categories={categories} />
      <Container className='flex flex-row flex-wrap py-4' sidebar>
        {featuredImage && (
          <CoverImage
            title={title}
            coverImage={featuredImage?.node?.sourceUrl}
          />
        )}
        <section>
          {content && <PostBody content={content} />}
          {tags.edges.length > 0 && (
            <footer>
              <Tags tags={tags} />
            </footer>
          )}
        </section>
        <SectionSeparator />
        {morePosts.length > 0 && <MoreStories posts={morePosts} />}
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
