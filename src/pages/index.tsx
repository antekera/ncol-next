import React, { useRef } from 'react'

import { isBefore, sub, parseISO } from 'date-fns'
import { NextPage, GetStaticProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { AdDfpSlot } from '@components/AdDfpSlot'
import { Container } from '@components/Container'
import { HeaderType } from '@components/Header'
import { Layout } from '@components/Layout'
import { LoadingPage } from '@components/LoadingPage'
import { Meta } from '@components/Meta'
import { Newsletter } from '@components/Newsletter'
import { PostHero } from '@components/PostHero'
import { Sidebar } from '@components/Sidebar'
import { DFP_ADS_PAGES } from '@lib/ads'
import { getPostsForHome } from '@lib/api'
import { HOME_PAGE_TITLE, CATEGORIES } from '@lib/constants'
import { HomePage } from '@lib/types'

import { LeftPosts } from '../templates/LeftPosts'
import { RightPosts } from '../templates/RightPosts'

const isPostTooOld = (date: string, hours: number) => {
  return isBefore(parseISO(date), sub(new Date(), { hours: hours }))
}

const { HOME_REVALIDATE_TIME, REVALIDATE_KEY, ALLOW_REVALIDATE } =
  process.env || {}

const Index: NextPage<HomePage> = ({
  mainPost,
  leftPosts_1,
  leftPosts_2,
  leftPosts_3,
  leftPosts_4,
  rightPosts_1,
  rightPosts_2,
  rightPosts_3,
  rightPosts_4,
  ads,
  allowRevalidate
}) => {
  const router = useRouter()
  const isLoading = router.isFallback
  const refLoaded = useRef(false)

  if (
    (isLoading && !refLoaded.current) ||
    (!refLoaded.current && allowRevalidate && router.query?.revalidate)
  ) {
    fetch(`/api/revalidate?path=${router.asPath}&token=${REVALIDATE_KEY}`).then(
      () => {
        refLoaded.current = true
        router.replace(router.asPath)
      }
    )
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
          <PostHero {...mainPost} adId={ads.cover.id} />
          <div className='mb-10 -ml-1 md:flex md:mt-4 md:ml-0'>
            <div className='flex-none md:w-3/5 md:pl-5 md:pr-3'>
              <LeftPosts posts={leftPosts_1} />
              <AdDfpSlot
                id={ads.homeFeed.id}
                className='pb-6 bloque-adv-list'
              />
              <LeftPosts posts={leftPosts_2} />
              <AdDfpSlot
                id={ads.squareC1.id}
                className='pb-6 show-mobile bloque-adv-list'
              />
              <LeftPosts posts={leftPosts_3} />
            </div>
            <div className='flex-none md:w-2/5 md:pl-4'>
              <Newsletter className='my-4 md:hidden' />
              <RightPosts posts={rightPosts_1} />
              <AdDfpSlot
                id={ads.homeFeed2.id}
                className='mb-6 bloque-adv-list'
              />
              <RightPosts posts={rightPosts_2} />
              <AdDfpSlot
                id={ads.homeFeed3.id}
                className='mb-6 bloque-adv-list'
              />
              <RightPosts posts={rightPosts_3} />
              <AdDfpSlot
                id={ads.squareC2.id}
                className='mb-6 show-mobile bloque-adv-list'
              />
            </div>
          </div>
          <div className='p-2 mb-10 md:flex md:ml-0 md:bg-slate-100'></div>
          <div className='mb-10 -ml-1 md:flex md:mt-4 md:ml-0'>
            <div className='flex-none md:w-3/5 md:pl-5 md:pr-3'>
              <LeftPosts posts={leftPosts_4} />
            </div>
            <div className='flex-none md:w-2/5 md:pl-4'>
              <RightPosts posts={rightPosts_4} />
            </div>
          </div>
        </section>
        <Sidebar adID={ads.sidebar.id} adID2={ads.sidebar.id} />
      </Container>
    </Layout>
  )
}

export default Index

export const getStaticProps: GetStaticProps = async () => {
  const mainPost = getPostsForHome(CATEGORIES.COVER, 1, 'large')
  const leftPosts = getPostsForHome(CATEGORIES.COL_LEFT, 30, 'large')
  const rightPosts = getPostsForHome(CATEGORIES.COL_RIGHT, 30, 'large')

  const [main, left, right] = await Promise.all([
    mainPost,
    leftPosts,
    rightPosts
  ])

  if (!main || !left || !right) {
    return {
      notFound: true
    }
  }

  let coverPost = main.edges[0].node

  if (isPostTooOld(main.edges[0].node.date, 24)) {
    const leftSlicedPosts = left.edges.slice(0, 3)
    coverPost =
      leftSlicedPosts[Math.floor(Math.random() * leftSlicedPosts.length)].node
  }

  return {
    props: {
      pageTitle: 'HOME',
      pageType: '/HOME',
      mainPost: coverPost,
      leftPosts_1: left.edges.slice(0, 4),
      leftPosts_2: left.edges.slice(4, 8),
      leftPosts_3: left.edges.slice(8, 14),
      leftPosts_4: left.edges.slice(15, 30),
      rightPosts_1: right.edges.slice(0, 4),
      rightPosts_2: right.edges.slice(4, 9),
      rightPosts_3: right.edges.slice(9, 13),
      rightPosts_4: right.edges.slice(14, 30),
      ads: DFP_ADS_PAGES,
      allowRevalidate: ALLOW_REVALIDATE === 'true'
    },
    revalidate: HOME_REVALIDATE_TIME ? Number(HOME_REVALIDATE_TIME) : 3600
  }
}
