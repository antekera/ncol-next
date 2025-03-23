import { Suspense } from 'react'
import {
  getCoverPostForHome,
  getLeftPostsForHome,
  getRightPostsForHome
} from '@app/actions/getAllPostsForHome'
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
import { RevalidateForm } from '@components/RevalidateForm'
import { Sidebar } from '@components/Sidebar'
import { ad } from '@lib/ads'
import { CATEGORIES, HOME_PAGE_TITLE } from '@lib/constants'
import { PostHome } from '@lib/types'
import { LeftPosts } from '../templates/LeftPosts'
import { RightPosts } from '../templates/RightPosts'

export const revalidate = 0

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
          !IGNORE_THES_CAT_MAIN_POST.some(category =>
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
          </div>
          <div className='flex-none md:w-2/5 md:pl-4'>
            <Newsletter className='my-4 md:hidden' />
            <RightPosts posts={right.edges} />
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
      <div className='container mx-auto mt-4'>
        <AdSenseBanner {...ad.global.top_header} />
      </div>
      <Container className='pt-6' sidebar>
        <Suspense fallback={<Loading />}>
          <PageContent />
        </Suspense>
        <Sidebar />
      </Container>
    </>
  )
}
