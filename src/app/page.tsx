export const revalidate = 7200

import { Suspense } from 'react'

import { isWithinInterval, subDays } from 'date-fns'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getPostsForHome } from '@app/actions/getAllPostsForHome'
import { AdDfpSlot } from '@components/AdDfpSlot'
import { Container } from '@components/Container'
import { Header } from '@components/Header'
import { Loading } from '@components/LoadingHome'
import { Newsletter } from '@components/Newsletter'
import { PostHero } from '@components/PostHero'
import { RevalidateForm } from '@components/RevalidateForm'
import { Sidebar } from '@components/Sidebar'
import { DFP_ADS_PAGES as ads } from '@lib/ads'
import { CATEGORIES, HOME_PAGE_TITLE } from '@lib/constants'
import { PostHome } from '@lib/types'

import { LeftPosts } from '../templates/LeftPosts'
import { RightPosts } from '../templates/RightPosts'

export const metadata: Metadata = {
  title: HOME_PAGE_TITLE
}

const postsQty = Number(process.env.NEXT_PUBLIC_POSTS_QTY_HOME ?? 10)

const PageContent = async () => {
  const mainPost = getPostsForHome(CATEGORIES.COVER, 1)
  const leftPosts = getPostsForHome(CATEGORIES.COL_LEFT, postsQty)
  const rightPosts = getPostsForHome(CATEGORIES.COL_RIGHT, postsQty)

  const [main, left, right] = await Promise.all([
    mainPost,
    leftPosts,
    rightPosts
  ])

  if (!main || !left || !right) {
    return notFound()
  }

  let coverPost: PostHome = main.edges[0].node
  const leftPosts1 = left.edges.slice(0, 5)
  const leftPosts2 = left.edges.slice(5, 10)
  const leftPosts3 = left.edges.slice(10, 30)
  const rightPosts1 = right.edges.slice(0, 5)
  const rightPosts2 = right.edges.slice(5, 10)
  const rightPosts3 = right.edges.slice(10, 30)

  const coverPostDate = new Date(String(coverPost.date))
  const now = new Date()
  const isWithinLastDay = isWithinInterval(coverPostDate, {
    start: subDays(now, 1),
    end: now
  })

  if (!isWithinLastDay) {
    const filteredLeftSidePosts = [...leftPosts1, ...leftPosts2].filter(
      item =>
        !['deportes', 'farandula', 'internacionales'].some(category =>
          item.node.categories.edges.some(cat =>
            cat.node.uri?.includes(category)
          )
        )
    )
    const randomCoverPost =
      filteredLeftSidePosts[
        Math.floor(Math.random() * filteredLeftSidePosts.length)
      ].node
    coverPost = randomCoverPost
  }

  return (
    <section className='w-full md:w-2/3 md:pr-8 lg:w-3/4'>
      <PostHero {...coverPost} adId={ads.cover.id} />
      <div className='-ml-1 mb-10 md:ml-0 md:mt-4 md:flex'>
        <div className='flex-none md:w-3/5 md:pl-5 md:pr-3'>
          <LeftPosts posts={leftPosts1} />
          <AdDfpSlot
            id={ads.homeFeed.id}
            style={ads.homeFeed.style}
            className='bloque-adv-list pb-6'
          />
          <LeftPosts posts={leftPosts2} />
          <AdDfpSlot
            id={ads.squareC1.id}
            style={ads.squareC1.style}
            className='show-mobile bloque-adv-list pb-6'
          />
          <LeftPosts posts={leftPosts3} />
        </div>
        <div className='flex-none md:w-2/5 md:pl-4'>
          <Newsletter className='my-4 md:hidden' />
          <RightPosts posts={rightPosts1} />
          <AdDfpSlot
            id={ads.homeFeed2.id}
            style={ads.homeFeed2.style}
            className='bloque-adv-list mb-6'
          />
          <RightPosts posts={rightPosts2} />
          <AdDfpSlot
            id={ads.homeFeed3.id}
            style={ads.homeFeed3.style}
            className='bloque-adv-list mb-6'
          />
          <RightPosts posts={rightPosts3} />
          <AdDfpSlot
            id={ads.squareC2.id}
            style={ads.squareC2.style}
            className='show-mobile bloque-adv-list mb-6'
          />
        </div>
      </div>
      <div className='mb-10 p-2 md:ml-0 md:flex md:bg-slate-100'></div>
    </section>
  )
}

export default async function Page() {
  return (
    <>
      <Suspense>
        <RevalidateForm path='/' />
      </Suspense>
      <Header />
      <div className='container mx-auto'>
        <AdDfpSlot
          id={ads.menu.id}
          style={ads.menu.style}
          className='show-desktop pt-4'
        />
        <AdDfpSlot
          id={ads.menu_mobile.id}
          style={ads.menu_mobile.style}
          className='show-mobile pt-4'
        />
      </div>
      <Container className='pt-6' sidebar>
        <Suspense fallback={<Loading />}>
          <PageContent />
        </Suspense>
        <Sidebar
          style={ads.sidebar.style}
          adID={ads.sidebar.id}
          adID2={ads.sidebar.id}
        />
      </Container>
    </>
  )
}
