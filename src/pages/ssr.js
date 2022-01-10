// import PostList, {
//   ALL_POSTS_QUERY,
//   allPostsQueryVars,
// } from '../components/PostList'
// import MoreStories from '../components/more-stories'
// import { getAllPostsForHome } from '../lib/api'
import Head from 'next/head'
// import { NextPage, GetStaticProps } from 'next'
import Container from '../components/container'
import MoreStories from '../components/more-stories'
import HeroPost from '../components/hero-post'
import Intro from '../components/intro'
import Layout from '../components/layout'
import { getAllPostsForHome } from '../lib/api'
// import { IndexPage } from '../lib/types'
import { PAGE_TITLE, PAGE_DESCRIPTION } from '../lib/constants'

const SSRPage = ({ allPosts: { edges }, preview }) => {
  const heroPost = edges[0]?.node
  const morePosts = edges.slice(1)

  return (
    <>
      <Layout preview={preview}>
        <Head>
          <title>{PAGE_TITLE}</title>
          <meta name='description' content={PAGE_DESCRIPTION} />
        </Head>
        <Container>
          <Intro />
          {heroPost && (
            <HeroPost
              title={heroPost.title}
              coverImage={heroPost.featuredImage?.node}
              date={heroPost.date}
              author={heroPost.author?.node}
              slug={heroPost.slug}
              excerpt={heroPost.excerpt}
            />
          )}
          {morePosts.length > 0 && <MoreStories posts={morePosts} />}
        </Container>
      </Layout>
    </>
  )
}

export const getServerSideProps = async ({ preview = false }) => {
  const allPosts = await getAllPostsForHome(preview)

  return {
    props: { allPosts: allPosts, preview: preview },
  }
}

export default SSRPage
