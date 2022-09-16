/**
 * Home Page
 */
import React from 'react'

import { NextPage, GetStaticProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { isMobile } from 'react-device-detect'

const SLICE_RIGHT_A = 0
const SLICE_RIGHT_B = 13
const SLICE_LEFT_A = 15
const SLICE_LEFT_B = 30

import { HeaderType } from '@components/Header'
import {
  Container,
  Layout,
  LoadingPage,
  PostHero,
  Meta,
  AdDfpSlot
} from '@components/index'
import { getPostsForHome } from '@lib/api'
import {
  AD_DFP_MENU,
  AD_DFP_MENU_MOBILE,
  HOME_PAGE_TITLE
} from '@lib/constants'
import { HomePage } from '@lib/types'

import { LeftPosts } from '../templates/LeftPosts'
import { RightPosts } from '../templates/RightPosts'

const Index: NextPage<HomePage> = ({ mainPost, leftPosts, rightPosts }) => {
  const router = useRouter()
  const isLoading = router.isFallback

  if (isLoading) {
    return <LoadingPage />
  }

  return (
    <Layout headerType={HeaderType.Main}>
      <Head>
        <title>{HOME_PAGE_TITLE}</title>
        <Meta />
      </Head>
      <Container>
        {isMobile ? (
          <AdDfpSlot
            id={AD_DFP_MENU_MOBILE.ID}
            style={AD_DFP_MENU_MOBILE.STYLE}
            width={300}
            height={100}
            className='pt-4'
          />
        ) : (
          <AdDfpSlot
            id={AD_DFP_MENU.ID}
            style={AD_DFP_MENU.STYLE}
            width={1000}
            height={250}
            className='pt-4'
          />
        )}
      </Container>
      <Container className='pt-6' sidebar>
        <PostHero {...mainPost} />
        <div className='mb-10 -ml-1 md:flex md:mt-4 md:ml-0'>
          <div className='flex-none md:w-3/5 md:pl-5 md:pr-3'>
            <LeftPosts posts={leftPosts.slice(SLICE_RIGHT_A, SLICE_RIGHT_B)} />
          </div>
          <div className='flex-none md:w-2/5 md:pl-4'>
            <RightPosts
              posts={rightPosts.slice(SLICE_RIGHT_A, SLICE_RIGHT_B)}
            />
          </div>
        </div>
        <div className='p-2 mb-10 md:flex md:ml-0 bg-slate-100'></div>
        <div className='mb-10 -ml-1 md:flex md:mt-4 md:ml-0'>
          <div className='flex-none md:w-3/5 md:pl-5 md:pr-3'>
            <LeftPosts posts={leftPosts.slice(SLICE_LEFT_A, SLICE_LEFT_B)} />
          </div>
          <div className='flex-none md:w-2/5 md:pl-4'>
            <RightPosts posts={rightPosts.slice(SLICE_LEFT_A, SLICE_LEFT_B)} />
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
      redirect: {
        destination: '/pagina-no-encontrada',
        permanent: true
      }
    }

  return {
    props: {
      pageTitle: 'HOME',
      pageType: '/HOME',
      mainPost: main.edges[0].node,
      leftPosts: left.edges,
      rightPosts: right.edges
    },
    revalidate: 1800
  }
}
