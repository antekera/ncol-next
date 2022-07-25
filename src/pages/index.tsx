/**
 * Home Page
 */

import { NextPage, GetStaticProps } from 'next'
import Head from 'next/head'

import { HeaderType } from '@components/Header'
import { Container, Layout, PostHero } from '@components/index'
import { getPostsForHome } from '@lib/api'
import { PAGE_TITLE, PAGE_DESCRIPTION } from '@lib/constants'
import { HomePage } from '@lib/types'
import MoreStories from 'components/more-stories'

const Index: NextPage<HomePage> = ({ mainPost, leftPosts, rightPosts }) => {
  return (
    <>
      <Layout headerType={HeaderType.Main}>
        <Head>
          <title>{PAGE_TITLE}</title>
          <meta name='description' content={PAGE_DESCRIPTION} />
        </Head>
        <Container sidebar>
          {mainPost && <PostHero {...mainPost} />}
          {leftPosts.length > 0 && <MoreStories posts={leftPosts} />}
          {rightPosts.length > 0 && <MoreStories posts={rightPosts} />}
        </Container>
      </Layout>
    </>
  )
}

export default Index

export const getStaticProps: GetStaticProps = async () => {
  const mainPost = getPostsForHome('_Pos_Destacado', 1, 'large')
  const leftPosts = getPostsForHome('_Pos_Columna_izq', 3, 'large')
  const rightPosts = getPostsForHome('_Pos_Columna_der', 3, 'large')

  const [main, left, right] = await Promise.all([
    mainPost,
    leftPosts,
    rightPosts
  ])

  return {
    props: {
      mainPost: main.edges[0].node,
      leftPosts: left.edges,
      rightPosts: right.edges
    },
    revalidate: 3600
  }
}
