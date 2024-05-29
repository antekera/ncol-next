import { NextPage } from 'next'

import { Container } from '@components/Container'
import { Header } from '@components/Header'

import styles from './style.module.css'

type LegalPageProps = {
  children: React.ReactNode
  title: string
}

const LegalPage: NextPage<LegalPageProps> = ({ title, children }) => {
  return (
    <>
      <Header />
      <Container className='py-12'>
        <section className='w-full md:w-2/3 md:pr-8 lg:w-3/4'>
          <div className='xl:w-5/6'>
            <h1 className='mb-4 text-3xl md:text-4xl'>{title}</h1>
            <section
              className={`font-sans_light text-slate-800 ${styles.content}`}
            >
              {children}
            </section>
          </div>
        </section>
      </Container>
    </>
  )
}

export { LegalPage }
