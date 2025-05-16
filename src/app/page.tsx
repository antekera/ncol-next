export const dynamic = 'force-static'

import { Suspense } from 'react'
import { getHomePosts } from '@app/actions/getAllPostsForHome'
import * as Sentry from '@sentry/browser'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AdSenseBanner } from '@components/AdSenseBanner'
import { Container } from '@components/Container'
import { Header } from '@components/Header'
import { Loading } from '@components/LoadingHome'
import { Newsletter } from '@components/Newsletter'
import { PostHero } from '@components/PostHero'
import { Sidebar } from '@components/Sidebar'
import { ad } from '@lib/ads'
import { processHomePosts } from '@lib/utils/processHomePosts'
import { CATEGORIES } from '@lib/constants'
import { sharedOpenGraph } from '@lib/sharedOpenGraph'
import { ClientRightPosts } from '@blocks/content/HomeRightPosts'
import { ClientLeftPosts } from '@blocks/content/HomeLeftPosts'
import { SocialLinks } from '@components/SocialLinks'

export const metadata: Metadata = sharedOpenGraph

const coverQty = 3
const leftQty = 5
const rightQty = 6

const PageContent = async () => {
  const coverPost = getHomePosts({
    slug: CATEGORIES.COL_LEFT,
    qty: coverQty
  })
  const post = await coverPost
  try {
    const { cover } = processHomePosts(post)
    return (
      <section className='w-full md:w-2/3 md:pr-8 lg:w-3/4'>
        <SocialLinks showBackground className='mb-6 md:hidden' />
        {cover && <PostHero {...cover} />}
        <div className='mb-10 -ml-1 md:ml-0 md:flex'>
          <div className='flex-none md:w-3/5 md:pr-3 md:pl-5'>
            <ClientLeftPosts offset={0} qty={leftQty} enableLazyLoad />
            <div className='mb-4'>
              <AdSenseBanner {...ad.global.more_news} />
            </div>
            <ClientLeftPosts offset={leftQty} qty={leftQty} enableLazyLoad />
          </div>
          <div className='flex-none md:w-2/5 md:pl-4'>
            <Newsletter className='my-4 md:hidden' />
            <ClientRightPosts offset={0} qty={rightQty} />
            <div className='mb-4'>
              <AdSenseBanner
                className='bloque-adv-list'
                {...ad.home.in_article_left}
              />
            </div>
            <ClientRightPosts offset={rightQty} qty={rightQty} enableLazyLoad />
          </div>
        </div>
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
      <Header />
      <Container className='pt-6' sidebar>
        <Suspense fallback={<Loading />}>
          <PageContent />
        </Suspense>
        <Sidebar />
      </Container>
    </>
  )
}
