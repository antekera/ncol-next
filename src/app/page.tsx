export const revalidate = 10800 // 3 horas

import { Suspense } from 'react'
import { getHomePosts } from '@app/actions/getAllPostsForHome'
import * as Sentry from '@sentry/browser'
import { isWithinInterval, subDays } from 'date-fns'
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
import { CATEGORIES } from '@lib/constants'
import { sharedOpenGraph } from '@lib/sharedOpenGraph'
import { PostHome } from '@lib/types'
import { LeftPosts } from '../blocks/LeftPosts'
import { RightPosts } from '../blocks/RightPosts'

export const metadata: Metadata = sharedOpenGraph

const qty = Number(process.env.NEXT_PUBLIC_POSTS_QTY_HOME ?? 10)
const IGNORE_THESE_CAT_MAIN_POST = ['deportes', 'farandula']

const PageContent = async () => {
  const postsPromise = getHomePosts({
    coverSlug: CATEGORIES.COVER,
    leftCursor: CATEGORIES.COL_LEFT,
    leftSlug: CATEGORIES.COL_LEFT,
    qty,
    rightCursor: CATEGORIES.COL_RIGHT,
    rightSlug: CATEGORIES.COL_RIGHT
  })

  try {
    const { cover, left, right } = await postsPromise
    let coverPost: PostHome | undefined = cover?.edges?.[0]?.node
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
      const filteredLeftSidePosts = left.edges?.filter(
        item =>
          !IGNORE_THESE_CAT_MAIN_POST.some(category =>
            item?.node?.categories?.edges.some(cat =>
              cat?.node?.uri?.includes(category)
            )
          )
      )
      const randomIndex =
        crypto.getRandomValues(new Uint32Array(1))[0] %
        filteredLeftSidePosts.length
      const randomCoverPost = filteredLeftSidePosts[`${randomIndex}`]?.node as
        | PostHome
        | undefined
      coverPost = randomCoverPost || coverPost
    }

    return (
      <section className='w-full md:w-2/3 md:pr-8 lg:w-3/4'>
        {coverPost && <PostHero {...coverPost} />}
        <div className='mb-10 -ml-1 md:ml-0 md:flex'>
          <div className='flex-none md:w-3/5 md:pr-3 md:pl-5'>
            <LeftPosts posts={left.edges} />
            <AdSenseBanner {...ad.global.more_news} />
          </div>
          <div className='flex-none md:w-2/5 md:pl-4'>
            <Newsletter className='my-4 md:hidden' />
            <RightPosts posts={right.edges} />
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
