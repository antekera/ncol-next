/**
 * Home Page
 */

import { NextPage, GetStaticProps } from 'next'
import Head from 'next/head'

import { HeaderType } from '@components/Header'
import HeroPost from '@components/hero-post'
import { Container, Layout } from '@components/index'
//  import MoreStories from 'components/more-stories'
import { getAllPostsForHome } from '@lib/api'
import { PAGE_TITLE, PAGE_DESCRIPTION } from '@lib/constants'
import { IndexPage } from '@lib/types'

const Index: NextPage<IndexPage> = ({ allPosts: { edges } }) => {
  const heroPost = edges[0]?.node
  // const morePosts = edges.slice(1)

  return (
    <>
      <Layout headerType={HeaderType.Main}>
        <Head>
          <title>{PAGE_TITLE}</title>
          <meta name='description' content={PAGE_DESCRIPTION} />
        </Head>
        <Container>
          {heroPost && (
            <HeroPost
              title={heroPost.title}
              coverImage={heroPost.featuredImage?.node.sourceUrl}
              date={heroPost.date}
              uri={heroPost.uri}
              excerpt={heroPost.excerpt}
            />
          )}
          {/*{morePosts.length > 0 && <MoreStories posts={morePosts} />}*/}
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
