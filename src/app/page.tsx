export const dynamic = 'force-static'

import { Suspense } from 'react'
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
import { CATEGORIES } from '@lib/constants'
import { sharedOpenGraph } from '@lib/sharedOpenGraph'
import { ClientRightPosts } from '@blocks/content/HomeRightPosts'
import { ClientLeftPosts } from '@blocks/content/HomeLeftPosts'
import { SocialLinks } from '@components/SocialLinks'
import { ExchangeRateBanner } from '@components/ExchangeRateBanner'
import './page.css'

export const metadata: Metadata = sharedOpenGraph

const leftQty = 6
const rightQty = 6

const PageContent = async () => {
  try {
    return (
      <section className='page-content'>
        <SocialLinks showBackground className='page-content-social-links' />
        <PostHero qty={leftQty} slug={CATEGORIES.COL_LEFT} />
        <div className='page-content-main'>
          <div className='page-content-left'>
            <ClientLeftPosts offset={0} qty={leftQty} />
            <div className='page-content-left-ad'>
              <AdSenseBanner {...ad.global.more_news} />
            </div>
            <ClientLeftPosts offset={leftQty} qty={leftQty} enableLazyLoad />
          </div>
          <div className='page-content-right'>
            <Newsletter className='page-content-right-newsletter' />
            <ClientRightPosts offset={0} qty={rightQty} />
            <div className='page-content-right-ad'>
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
      <ExchangeRateBanner />
      <Container className='pt-6' sidebar>
        <Suspense fallback={<Loading />}>
          <PageContent />
        </Suspense>
        <Sidebar />
      </Container>
    </>
  )
}