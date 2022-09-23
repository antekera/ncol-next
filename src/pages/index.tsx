/**
 * Home Page
 */
import React from 'react'

import { NextPage, GetStaticProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { HeaderType } from '@components/Header'
import {
  Container,
  Layout,
  LoadingPage,
  PostHero,
  Meta,
  AdDfpSlot,
  Sidebar
} from '@components/index'
import { DFP_ADS_PAGES } from '@lib/ads'
import { getPostsForHome } from '@lib/api'
import { HOME_PAGE_TITLE } from '@lib/constants'
import { HomePage } from '@lib/types'

import { LeftPosts } from '../templates/LeftPosts'
import { RightPosts } from '../templates/RightPosts'

const Index: NextPage<HomePage> = ({
  mainPost,
  leftPosts,
  rightPosts,
  ads
}) => {
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
      <div className='container mx-auto'>
        <AdDfpSlot
          id={ads.menu.id}
          style={ads.menu.style}
          className='pt-4 show-desktop'
        />
        <AdDfpSlot
          id={ads.menu_mobile.id}
          style={ads.menu_mobile.style}
          className='pt-4 show-mobile'
        />
      </div>
      <Container className='pt-6' sidebar>
        <section className='w-full md:pr-8 md:w-2/3 lg:w-3/4'>
          <PostHero {...mainPost} ads={ads} />
          <div className='mb-10 -ml-1 md:flex md:mt-4 md:ml-0'>
            <div className='flex-none md:w-3/5 md:pl-5 md:pr-3'>
              <LeftPosts posts={leftPosts.slice(0, 4)} />
              <AdDfpSlot
                id={ads.homeFeed.id}
                className='pb-6 bloque-adv-list'
              />
              <LeftPosts posts={leftPosts.slice(4, 8)} />
              <AdDfpSlot
                id={ads.squareC1.id}
                className='pb-6 show-mobile bloque-adv-list'
              />
              <LeftPosts posts={leftPosts.slice(8, 14)} />
            </div>
            <div className='flex-none md:w-2/5 md:pl-4'>
              <RightPosts posts={rightPosts.slice(0, 4)} />
              <AdDfpSlot
                id={ads.homeFeed2.id}
                className='mb-6 bloque-adv-list'
              />
              <RightPosts posts={rightPosts.slice(4, 9)} />
              <AdDfpSlot
                id={ads.homeFeed3.id}
                className='mb-6 bloque-adv-list'
              />
              <RightPosts posts={rightPosts.slice(9, 13)} />
              <AdDfpSlot
                id={ads.squareC2.id}
                className='mb-6 show-mobile bloque-adv-list h-8'
              />
            </div>
          </div>
          <div className='p-2 mb-10 md:flex md:ml-0 bg-slate-100'></div>
          <div className='mb-10 -ml-1 md:flex md:mt-4 md:ml-0'>
            <div className='flex-none md:w-3/5 md:pl-5 md:pr-3'>
              <LeftPosts posts={leftPosts.slice(15, 30)} />
            </div>
            <div className='flex-none md:w-2/5 md:pl-4'>
              <RightPosts posts={rightPosts.slice(14, 30)} />
            </div>
          </div>
        </section>
        <Sidebar ads={ads} />
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
      rightPosts: right.edges,
      ads: DFP_ADS_PAGES
    },
    revalidate: 1800
  }
}
