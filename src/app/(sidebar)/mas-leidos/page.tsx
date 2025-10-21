'use client'

import { Container } from '@components/Container'
import { Sidebar } from '@components/Sidebar'
import { RankedPostsList } from '@components/RankedPostsList'
import { useMasLeidosPosts } from '@lib/hooks/data/useMasLeidosPosts'

import { TITLE_LEIDO } from '@components/MobileRankingLinks'

export default function Page() {
  const { data, error, isLoading } = useMasLeidosPosts()
  return (
    <>
      <div className='border-b border-slate-200 text-slate-900 dark:border-neutral-500'>
        <Container className='text-left'>
          <h1 className='py-3 font-sans text-2xl md:py-6 md:text-3xl'>
            <span>{TITLE_LEIDO}</span>
          </h1>
        </Container>
      </div>
      <Container className='py-10' sidebar>
        <section className='w-full md:w-2/3 md:pr-8 lg:w-3/4'>
          <RankedPostsList data={data} error={error} isLoading={isLoading} />
        </section>
        <Sidebar hideMostVisited />
      </Container>
    </>
  )
}
