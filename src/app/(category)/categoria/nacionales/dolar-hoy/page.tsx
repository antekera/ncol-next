export const dynamic = 'force-static'

import { Content } from '@blocks/content/CategoryPosts'
import { Container } from '@components/Container'
import { PageTitle } from '@components/PageTitle'
import { Sidebar } from '@components/Sidebar'
import { sharedOpenGraph } from '@lib/sharedOpenGraph'
import { categoryName, titleFromSlug } from '@lib/utils'
import { Suspense } from 'react'
import { Loading } from '@components/LoadingCategory'

import { DollarCalculator } from '@components/DollarCalculator'
import { DOLAR_HOY_SLUG } from '@lib/constants'

export async function generateMetadata() {
  return {
    ...sharedOpenGraph,
    title: categoryName(titleFromSlug(DOLAR_HOY_SLUG), false)
  }
}

export default function Page() {
  const slug = DOLAR_HOY_SLUG

  return (
    <>
      <PageTitle text='Dólar Hoy' />
      <Container className='py-10' sidebar>
        <section className='w-full md:w-2/3 md:pr-8 lg:w-3/4'>
          <DollarCalculator />
          <Suspense fallback={<Loading />}>
            <Content slug={slug} />
          </Suspense>
        </section>
        <Sidebar />
      </Container>
    </>
  )
}
