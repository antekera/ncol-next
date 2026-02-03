import { Header } from '@components/Header'
import { Container } from '@components/Container'

export default function CenteredLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <Container className='py-12'>
        <div className='mx-auto w-full max-w-6xl px-4'>{children}</div>
      </Container>
    </>
  )
}
