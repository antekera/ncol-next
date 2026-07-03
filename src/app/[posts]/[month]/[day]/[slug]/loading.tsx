import { Header } from '@components/Header'
import { Container } from '@components/Container'
import { Loading } from '@components/LoadingSingle'
import { Sidebar } from '@components/Sidebar'

export default function LoadingPage() {
  return (
    <>
      <Header headerType='single' uri='' />
      <Container className='py-0 md:py-6' sidebar>
        <section className='w-full md:w-2/3 md:pr-8 lg:w-3/4'>
          <Loading slug='' />
        </section>
        <Sidebar offsetTop={80} />
      </Container>
    </>
  )
}
