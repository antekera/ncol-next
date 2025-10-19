'use client'
import { Container } from '@components/Container'
import { PageTitle } from '@components/PageTitle'
import { Sidebar } from '@components/Sidebar'
import { ExchangeRateBanner } from '@components/ExchangeRateBanner'
import { RankedPostsList } from '@components/RankedPostsList'
import { useMasLeidosPosts } from '@lib/hooks/data/useMasLeidosPosts'

export default function Page() {
  const { data, error } = useMasLeidosPosts()
  return (
    <>
      <PageTitle text="Más leídos" />
      <ExchangeRateBanner />
      <Container className="py-10" sidebar>
        <section className="w-full md:w-2/3 md:pr-8 lg:w-3/4">
          <RankedPostsList data={data} error={error} title="Más leídos" />
        </section>
        <Sidebar />
      </Container>
    </>
  )
}