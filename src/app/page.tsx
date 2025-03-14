import { Suspense } from 'react'

import * as Sentry from '@sentry/browser'
import { isWithinInterval, subDays } from 'date-fns'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import {
  getCoverPostForHome,
  getRightPostsForHome,
  getLeftPostsForHome
} from '@app/actions/getAllPostsForHome'
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
const IGNORE_THES_CAT_MAIN_POST = ['deportes', 'farandula', 'internacionales']

const PageContent = async () => {
  const mainPost = getCoverPostForHome(CATEGORIES.COVER, 1)
  const leftPosts = getLeftPostsForHome(CATEGORIES.COL_LEFT, postsQty)
  const rightPosts = getRightPostsForHome(CATEGORIES.COL_RIGHT, postsQty)

  try {
    const [main, left, right] = await Promise.all([
      mainPost,
      leftPosts,
      rightPosts
    ])

    let coverPost: PostHome | undefined = main?.edges?.[0]?.node
    const leftPosts1 = left.edges.slice(0, 5)
    const leftPosts2 = left.edges.slice(5, 10)
    const leftPosts3 = left.edges.slice(10, 30)
    const rightPosts1 = right.edges.slice(0, 5)
    const rightPosts2 = right.edges.slice(5, 10)
    const rightPosts3 = right.edges.slice(10, 30)

    const coverPostDate = coverPost
      ? new Date(String(coverPost.date))
      : undefined
    const now = new Date()
    const isWithinLastDay = coverPostDate
      ? isWithinInterval(coverPostDate, {
          start: subDays(now, 1),
          end: now
        })
      : false

    if (!isWithinLastDay) {
      const filteredLeftSidePosts = [...leftPosts1, ...leftPosts2].filter(
        item =>
          !IGNORE_THES_CAT_MAIN_POST.some(category =>
            item?.node?.categories?.edges.some(cat =>
              cat?.node?.uri?.includes(category)
            )
          )
      )
      const randomIndex =
        crypto.getRandomValues(new Uint32Array(1))[0] %
        filteredLeftSidePosts.length
      const randomCoverPost = filteredLeftSidePosts[randomIndex]?.node as
        | PostHome
        | undefined
      coverPost = randomCoverPost || coverPost
    }

    return (
      <section className='w-full md:w-2/3 md:pr-8 lg:w-3/4'>
        {coverPost && <PostHero {...coverPost} adId={ads.cover.id} />}
        <div className='mb-10 -ml-1 md:ml-0 md:flex'>
          <div className='flex-none md:w-3/5 md:pr-3 md:pl-5'>
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
  } catch (err) {
    Sentry.captureException(err)
    return notFound()
  }
}

export default async function Page() {
  return (
    <>
      <RevalidateForm />
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
