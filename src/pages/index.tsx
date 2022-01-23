import Head from 'next/head'
import { NextPage, GetStaticProps } from 'next'
import Container from '../components/Container'
import MoreStories from '../components/more-stories'
import HeroPost from '../components/hero-post'
import Intro from '../components/intro'
import Layout from '../components/Layout'
import { getAllPostsForHome } from '../lib/api'
import { IndexPage } from '../lib/types'
import { PAGE_TITLE, PAGE_DESCRIPTION } from '../lib/constants'

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
          <Intro />
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
