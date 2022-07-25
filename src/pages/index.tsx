/**
 * Home Page
 */

import { NextPage, GetStaticProps } from 'next'
import Head from 'next/head'

import { HeaderType } from '@components/Header'
import { CategoryArticle, Container, Layout, PostHero } from '@components/index'
import { getPostsForHome } from '@lib/api'
import { PAGE_TITLE, PAGE_DESCRIPTION } from '@lib/constants'
import { HomePage } from '@lib/types'

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
          <div className='mb-10 -ml-1 md:flex md:mt-4 md:ml-0'>
            <div className='flex-none md:w-3/5 md:pl-5 md:pr-3'>
              {leftPosts &&
                leftPosts
                  .slice(0, 15)
                  .map(({ node }, index) => (
                    <CategoryArticle
                      key={node.id}
                      {...node}
                      excerpt={undefined}
                      type='secondary'
                      isFirst={index === 0}
                      isLast={index + 1 === leftPosts.length}
                    />
                  ))}
            </div>
            <div className='flex-none md:w-2/5 md:pl-4'>
              {rightPosts &&
                rightPosts
                  .slice(0, 15)
                  .map(({ node }, index) => (
                    <CategoryArticle
                      key={node.id}
                      {...node}
                      excerpt={undefined}
                      type='thumbnail'
                      isFirst={index === 0}
                      isLast={index + 1 === leftPosts.length}
                    />
                  ))}
            </div>
          </div>

          <div className='p-2 mb-10 md:flex md:ml-0 bg-slate-100'></div>

          <div className='mb-10 -ml-1 md:flex md:mt-4 md:ml-0'>
            <div className='flex-none md:w-3/5 md:pl-5 md:pr-3'>
              {leftPosts &&
                leftPosts
                  .slice(16, 30)
                  .map(({ node }, index) => (
                    <CategoryArticle
                      key={node.id}
                      {...node}
                      excerpt={undefined}
                      type='secondary'
                      isFirst={index === 0}
                      isLast={index + 1 === leftPosts.length}
                    />
                  ))}
            </div>
            <div className='flex-none md:w-2/5 md:pl-4'>
              {rightPosts &&
                rightPosts
                  .slice(16, 30)
                  .map(({ node }, index) => (
                    <CategoryArticle
                      key={node.id}
                      {...node}
                      excerpt={undefined}
                      type='thumbnail'
                      isFirst={index === 0}
                      isLast={index + 1 === leftPosts.length}
                    />
                  ))}
            </div>
          </div>
        </Container>
      </Layout>
    </>
  )
}

export default Index

export const getStaticProps: GetStaticProps = async () => {
  const mainPost = getPostsForHome('_Pos_Destacado', 1, 'large')
  const leftPosts = getPostsForHome('_Pos_Columna_izq', 30, 'large')
  const rightPosts = getPostsForHome('_Pos_Columna_der', 30, 'large')

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
