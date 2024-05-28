import { Container } from '@components/Container'
import { Header } from '@components/Header'
import { Sidebar } from '@components/Sidebar'
import { DFP_ADS_PAGES as ads } from '@lib/ads'

export default function Loading() {
  return (
    <>
      <Header />
      <Container className='pt-6' sidebar>
        <section className='w-full md:w-2/3 md:pr-8 lg:w-3/4'>
          Cargando...
        </section>
        <Sidebar adID={ads.sidebar.id} adID2={ads.sidebar.id} />
      </Container>
    </>
  )
}
