import { Container } from '@components/Container'
import { Header } from '@components/Header'
import { cn } from '@lib/shared'
import './clean-layout.css'

export default async function CleanLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      <Container className='py-12'>
        <section className={cn('clean-layout-section', 'clean-layout-content')}>
          {children}
        </section>
      </Container>
    </>
  )
}