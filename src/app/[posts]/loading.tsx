import { Container } from '@components/Container'
import { Header } from '@components/Header'

export default function Loading() {
  return (
    <>
      <Header headerType='single' />
      <Container className='py-10'>Cargando...</Container>
    </>
  )
}
