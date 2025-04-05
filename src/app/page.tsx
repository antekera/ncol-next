export const dynamic = 'force-static'
export const revalidate = 7200 // 2 horas

import { Suspense } from 'react'
import { getLeftPostsForHome } from '@app/actions/getAllPostsForHome'
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
import { LeftPosts } from '@blocks/content/LeftPosts'
import { ClientRightPosts } from '@blocks/content/HomeRightPosts'
import { ClientLeftPosts } from '@blocks/content/HomeLeftPosts'

export const metadata: Metadata = sharedOpenGraph

const qty = Number(process.env.NEXT_PUBLIC_POSTS_QTY_HOME ?? 6)

const PageContent = async () => {
  const leftPosts = getLeftPostsForHome({
    slug: CATEGORIES.COL_LEFT,
    qty
  })

  try {
    const { cover, posts } = processHomePosts(await leftPosts)
    return (
      <section className='w-full md:w-2/3 md:pr-8 lg:w-3/4'>
        {cover && <PostHero {...cover} />}
        <div className='mb-10 -ml-1 md:ml-0 md:flex'>
          <div className='flex-none md:w-3/5 md:pr-3 md:pl-5'>
            <LeftPosts posts={posts} />
            <div className='mb-4'>
              <AdSenseBanner {...ad.global.more_news} />
            </div>
            <ClientLeftPosts qty={qty} enableLazyLoad />
          </div>
          <div className='flex-none md:w-2/5 md:pl-4'>
            <Newsletter className='my-4 md:hidden' />
            <ClientRightPosts offset={0} qty={qty} />
            <div className='mb-4'>
              <AdSenseBanner
                className='bloque-adv-list pb-6'
                {...ad.home.in_article_left}
              />
            </div>
            <ClientRightPosts offset={qty} qty={qty} enableLazyLoad />
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
