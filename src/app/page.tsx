export const revalidate = 3600

import { Suspense } from 'react'

import type { Metadata } from 'next'

import { AdSenseBanner } from '@components/AdSenseBanner'
import { Container } from '@components/Container'
import { DeferredRender } from '@components/DeferredRender'
import { Header } from '@components/Header'
import { WorldCupBanner } from '@components/mundial/WorldCupBanner'
import { Loading } from '@components/LoadingHome'
import { Newsletter } from '@components/Newsletter'
import { PostHero } from '@components/PostHero'
import { MostVisitedPostsMobile } from '@components/PostHero/MostVisitedPostsMobile'
import { Sidebar } from '@components/Sidebar'
import { ad } from '@lib/ads'
import { sharedOpenGraph } from '@lib/sharedOpenGraph'
import { ClientRightPosts } from '@blocks/content/HomeRightPosts'
import { ClientLeftPosts } from '@blocks/content/HomeLeftPosts'
import { MobileRankingLinks } from '@components/MobileRankingLinks'
import { getFeaturedPost } from '@app/actions/getFeaturedPost'
import { VideoCarousel } from '@components/VideoCarousel'

export const metadata: Metadata = sharedOpenGraph

const leftQty = 10
const rightQty = 10

const FirstBlock = ({ featuredPost }: { featuredPost: any }) => {
  return (
    <div className='mb-10 -ml-1 md:ml-0 md:flex'>
      <div className='flex-none md:w-3/5 md:pr-3 md:pl-5'>
        <ClientLeftPosts
          offset={0}
          qty={leftQty}
          excludeUri={featuredPost?.uri}
        />
      </div>
      <div className='flex-none md:w-2/5 md:pl-4'>
        <Newsletter className='my-4 md:hidden' />
        <ClientRightPosts offset={0} qty={rightQty} />
      </div>
    </div>
  )
}

const SecondBlock = ({ featuredPost }: { featuredPost: any }) => {
  return (
    <div className='mb-10 -ml-1 md:ml-0 md:flex'>
      <div className='flex-none md:w-3/5 md:pr-3 md:pl-5'>
        <div className='mb-4'>
          <AdSenseBanner {...ad.global.more_news} />
        </div>
        <ClientLeftPosts
          offset={leftQty}
          qty={leftQty}
          excludeUri={featuredPost?.uri}
          enableLazyLoad
        />
      </div>
      <div className='flex-none md:w-2/5 md:pl-4'>
        <div className='mb-4'>
          <AdSenseBanner
            className='bloque-adv-list'
            {...ad.home.in_article_left}
          />
        </div>
        <ClientRightPosts offset={rightQty} qty={rightQty} enableLazyLoad />
      </div>
    </div>
  )
}

export default async function Page() {
  const featuredPost = await getFeaturedPost()

  return (
    <>
      <Header />
      <WorldCupBanner />
      <DeferredRender timeoutMs={2000}>
        <MobileRankingLinks />
      </DeferredRender>
      <Container className='pt-6' sidebar>
        <section className='w-full pb-2 md:w-2/3 md:pr-8 lg:w-3/4'>
          <div className='-mt-6 sm:mt-0'>
            <PostHero post={featuredPost} />
            <MostVisitedPostsMobile />
          </div>

          <Suspense fallback={<Loading />}>
            <FirstBlock featuredPost={featuredPost} />
          </Suspense>
        </section>
        <Sidebar />
      </Container>

      <Container className='mb-8'>
        <VideoCarousel />
      </Container>

      <Container sidebar>
        <section className='w-full pb-2 md:w-2/3 md:pr-8 lg:w-3/4'>
          <Suspense fallback={<Loading />}>
            <SecondBlock featuredPost={featuredPost} />
          </Suspense>
        </section>
        <aside className='w-full px-2 md:w-1/3 lg:w-1/4'>
          <AdSenseBanner {...ad.global.sidebar} className='mb-2' />
        </aside>
      </Container>
    </>
  )
}
