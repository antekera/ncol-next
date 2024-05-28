import type { Metadata } from 'next'

import { getPostsForHome } from '@app/actions/getAllPostsForHome'
import { AdDfpSlot } from '@components/AdDfpSlot'
import { Container } from '@components/Container'
import { Header } from '@components/Header'
import { Newsletter } from '@components/Newsletter'
import { PostHero } from '@components/PostHero'
import { Sidebar } from '@components/Sidebar'
import { DFP_ADS_PAGES as ads } from '@lib/ads'
import { CATEGORIES } from '@lib/constants'
import { HOME_PAGE_TITLE } from '@lib/constants'

import { LeftPosts } from '../templates/LeftPosts'
import { RightPosts } from '../templates/RightPosts'

export const metadata: Metadata = {
  title: HOME_PAGE_TITLE
}

export default async function Page() {
  const mainPost = getPostsForHome(CATEGORIES.COVER, 1, 'large')
  const leftPosts = getPostsForHome(CATEGORIES.COL_LEFT, 30, 'large')
  const rightPosts = getPostsForHome(CATEGORIES.COL_RIGHT, 30, 'large')

  const [main, left, right] = await Promise.all([
    mainPost,
    leftPosts,
    rightPosts
  ])

  const leftPosts1 = left.edges.slice(0, 4)
  const leftPosts2 = left.edges.slice(4, 8)
  const leftPosts3 = left.edges.slice(8, 14)
  const leftPosts4 = left.edges.slice(15, 30)
  const rightPosts1 = right.edges.slice(0, 4)
  const rightPosts2 = right.edges.slice(4, 9)
  const rightPosts3 = right.edges.slice(9, 13)
  const rightPosts4 = right.edges.slice(14, 30)

  return (
    <>
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
        <section className='w-full md:w-2/3 md:pr-8 lg:w-3/4'>
          <PostHero {...main.edges[0].node} adId={ads.cover.id} />
          <div className='-ml-1 mb-10 md:ml-0 md:mt-4 md:flex'>
            <div className='flex-none md:w-3/5 md:pl-5 md:pr-3'>
              <LeftPosts posts={leftPosts1} />
              <AdDfpSlot
                id={ads.homeFeed.id}
                className='bloque-adv-list pb-6'
              />
              <LeftPosts posts={leftPosts2} />
              <AdDfpSlot
                id={ads.squareC1.id}
                className='show-mobile bloque-adv-list pb-6'
              />
              <LeftPosts posts={leftPosts3} />
            </div>
            <div className='flex-none md:w-2/5 md:pl-4'>
              <Newsletter className='my-4 md:hidden' />
              <RightPosts posts={rightPosts1} />
              <AdDfpSlot
                id={ads.homeFeed2.id}
                className='bloque-adv-list mb-6'
              />
              <RightPosts posts={rightPosts2} />
              <AdDfpSlot
                id={ads.homeFeed3.id}
                className='bloque-adv-list mb-6'
              />
              <RightPosts posts={rightPosts3} />
              <AdDfpSlot
                id={ads.squareC2.id}
                className='show-mobile bloque-adv-list mb-6'
              />
            </div>
          </div>
          <div className='mb-10 p-2 md:ml-0 md:flex md:bg-slate-100'></div>
          <div className='-ml-1 mb-10 md:ml-0 md:mt-4 md:flex'>
            <div className='flex-none md:w-3/5 md:pl-5 md:pr-3'>
              <LeftPosts posts={leftPosts4} />
            </div>
            <div className='flex-none md:w-2/5 md:pl-4'>
              <RightPosts posts={rightPosts4} />
            </div>
          </div>
        </section>
        <Sidebar adID={ads.sidebar.id} adID2={ads.sidebar.id} />
      </Container>
    </>
  )
}
