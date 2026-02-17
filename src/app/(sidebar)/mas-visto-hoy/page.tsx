'use client'

import { Container } from '@components/Container'
import { Sidebar } from '@components/Sidebar'
import { RankedPostsList } from '@components/RankedPostsList'
import { useMostVisitedPosts } from '@lib/hooks/data/useMostVisitedPosts'

import { TITLE_VISTO } from '@components/MobileRankingLinks'
import { Newsletter } from '@components/Newsletter'

export default function Page() {
  const { data, error, isLoading } = useMostVisitedPosts({
    load: true,
    limit: 10,
    days: 1
  })
  return (
    <>
      <div className='border-b border-slate-200 text-slate-900 dark:border-neutral-500'>
        <Container className='text-left'>
          <h1 className='py-3 font-sans text-2xl md:py-6 md:text-3xl dark:text-neutral-300'>
            <span>{TITLE_VISTO}</span>
          </h1>
        </Container>
      </div>
      <Container className='py-10' sidebar>
        <Newsletter className='mb-4 w-full md:hidden' />
        <section className='w-full md:w-2/3 md:pr-8 lg:w-3/4'>
          <RankedPostsList data={data} error={error} isLoading={isLoading} />
        </section>
        <Sidebar hideMostVisited />
      </Container>
    </>
  )
}
