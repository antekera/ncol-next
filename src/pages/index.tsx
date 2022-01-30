/**
 * Home Page
 */
import { NextPage, GetStaticProps } from 'next'
import Head from 'next/head'

import { Container, Layout } from '../components'
import HeroPost from '../components/hero-post'
import MoreStories from '../components/more-stories'
import { getAllPostsForHome } from '../lib/api'
import { PAGE_TITLE, PAGE_DESCRIPTION } from '../lib/constants'
import { IndexPage } from '../lib/types'

const Index: NextPage<IndexPage> = ({ allPosts: { edges }, preview }) => {
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
          {heroPost && (
            <HeroPost
              title={heroPost.title}
              coverImage={heroPost.featuredImage?.node}
              date={heroPost.date}
              author={heroPost.author?.node}
              uri={heroPost.uri}
              excerpt={heroPost.excerpt}
            />
          )}
          {morePosts.length > 0 && <MoreStories posts={morePosts} />}
        </Container>
      </Layout>
    </>
  )
}

export default Index

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const allPosts = await getAllPostsForHome(preview)
  return {
    props: { allPosts, preview },
    revalidate: 3600,
  }
}
