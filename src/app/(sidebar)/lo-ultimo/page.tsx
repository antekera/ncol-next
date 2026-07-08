import type { Metadata } from 'next'
import { Container } from '@components/Container'
import { Sidebar } from '@components/Sidebar'
import { Content } from '@blocks/content/RecentPosts'
import { NcolAdSlot } from '@components/NcolAdSlot'
import { CMS_URL } from '@lib/constants'
import { sharedOpenGraph } from '@lib/sharedOpenGraph'
import { MobileRankingLinks } from '@components/MobileRankingLinks'
import { MainMenu } from '@components/Header/menu/Main'

const canonicalUrl = `${CMS_URL}/lo-ultimo/`
const description =
  'Lo más reciente publicado en Noticiascol: Venezuela, sucesos, política, deportes y actualidad al instante.'

export const metadata: Metadata = {
  ...sharedOpenGraph,
  title: 'Lo último',
  description,
  alternates: { canonical: canonicalUrl },
  openGraph: {
    ...sharedOpenGraph.openGraph,
    url: canonicalUrl,
    title: 'Lo último',
    description
  },
  twitter: {
    ...sharedOpenGraph.twitter,
    title: 'Lo último',
    description
  }
}

export default function Page() {
  return (
    <>
      <MainMenu />
      <MobileRankingLinks />
      <div className='border-b border-slate-200 text-slate-900 dark:border-neutral-500'>
        <Container className='text-left'>
          <h1 className='py-3 font-sans text-2xl md:py-6 md:text-3xl dark:text-neutral-300'>
            Lo último
          </h1>
          <p className='pb-4 text-sm text-slate-600 dark:text-neutral-400'>
            {description}
          </p>
        </Container>
      </div>
      <Container className='py-10' sidebar>
        <NcolAdSlot
          slot='article-top'
          className='mb-6 flex w-full justify-center'
        />
        <section className='w-full md:w-2/3 md:pr-8 lg:w-3/4'>
          <Content />
        </section>
        <Sidebar hideMostVisited />
      </Container>
    </>
  )
}
