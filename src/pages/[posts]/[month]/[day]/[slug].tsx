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
  const morePosts = posts?.edges

  if (!post || !posts) {
    return <ErrorPage statusCode={404} />
  }

  if (router.isFallback) {
    return <div>Loading...</div>
  }

  return (
    <Layout preview={preview}>
      <Head>
        <title>
          {post.title} | {CMS_NAME}
        </title>
        <meta
          property='og:image'
          content={post.featuredImage?.node?.sourceUrl}
        />
      </Head>
      <PostHeader
        title={post.title}
        date={post.date}
        categories={post.categories}
      />
      <Container className='flex flex-row flex-wrap py-4' sidebar>
        <CoverImage title={post.title} coverImage={post.featuredImage?.node} />
        <section>
          <PostBody content={post.content} />
          {post.tags.edges.length > 0 && (
            <footer>
              <Tags tags={post.tags} />
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
