'use client'

import { Container } from '@components/Container'
import { Sidebar } from '@components/Sidebar'
import { RankedPostsList } from '@components/RankedPostsList'
import { useMostVisitedPosts } from '@lib/hooks/data/useMostVisitedPosts'
import { MobileRankingLinks } from '@components/MobileRankingLinks'
import { MainMenu } from '@components/Header/menu/Main'
import { NcolAdSlot } from '@components/NcolAdSlot'

export default function Page() {
  const { data, error, isLoading } = useMostVisitedPosts({
    load: true,
    limit: 10,
    days: 5
  })
  return (
    <>
      <MainMenu />
      <MobileRankingLinks />
      <div className='border-b border-slate-200 text-slate-900 dark:border-neutral-500'>
        <Container className='text-left'>
          <h1 className='py-3 font-sans text-2xl md:py-6 md:text-3xl dark:text-neutral-300'>
            <span>Más leído</span>
          </h1>
          <p className='pb-4 text-sm text-slate-600 dark:text-neutral-400'>
            Las noticias más leídas en Noticiascol durante los últimos días.
          </p>
        </Container>
      </div>
      <Container className='py-10' sidebar>
        <NcolAdSlot
          slot='article-top'
          className='mb-6 flex w-full justify-center'
        />
        <section className='w-full md:w-2/3 md:pr-8 lg:w-3/4'>
          <RankedPostsList data={data} error={error} isLoading={isLoading} />
        </section>
        <Sidebar hideMostVisited />
      </Container>
    </>
  )
}
