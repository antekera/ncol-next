/**
 * Home Page
 */
import React from 'react'

import { NextPage, GetStaticProps } from 'next'
import Head from 'next/head'

import { HeaderType } from '@components/Header'
import {
  Container,
  Layout,
  LoadingPage,
  PostHero,
  Meta
} from '@components/index'
import { getPostsForHome } from '@lib/api'
import { HOME_PAGE_TITLE } from '@lib/constants'
import { usePageStore } from '@lib/hooks/store'
import { HomePage } from '@lib/types'

import { LeftPosts } from '../templates/LeftPosts'
import { RightPosts } from '../templates/RightPosts'

const Index: NextPage<HomePage> = ({ mainPost, leftPosts, rightPosts }) => {
  const { isLoading } = usePageStore()

  if (isLoading) {
    return <LoadingPage />
  }

  return (
    <Layout headerType={HeaderType.Main}>
      <Head>
        <title>{HOME_PAGE_TITLE}</title>
        <Meta />
      </Head>
      <Container sidebar>
        <PostHero {...mainPost} />
        <div className='mb-10 -ml-1 md:flex md:mt-4 md:ml-0'>
          <div className='flex-none md:w-3/5 md:pl-5 md:pr-3'>
            <LeftPosts posts={leftPosts.slice(0, 15)} />
          </div>
          <div className='flex-none md:w-2/5 md:pl-4'>
            <RightPosts posts={rightPosts.slice(0, 15)} />
          </div>
        </div>
        <div className='p-2 mb-10 md:flex md:ml-0 bg-slate-100'></div>
        <div className='mb-10 -ml-1 md:flex md:mt-4 md:ml-0'>
          <div className='flex-none md:w-3/5 md:pl-5 md:pr-3'>
            <LeftPosts posts={leftPosts.slice(16, 30)} />
          </div>
          <div className='flex-none md:w-2/5 md:pl-4'>
            <RightPosts posts={rightPosts.slice(16, 30)} />
          </div>
        </div>
      </Container>
    </Layout>
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

  if (!main || !left || !right)
    return {
      notFound: true
    }

  return {
    props: {
      mainPost: main.edges[0].node,
      leftPosts: left.edges,
      rightPosts: right.edges
    },
    revalidate: 3600
  }
}
