import { NextPage } from 'next'
import Head from 'next/head'

import { Container, Layout } from 'components'

import { HeaderType } from '../Header'
import styles from './style.module.css'

type LegalPageProps = {
  children: React.ReactNode
  title: string
}

const LegalPage: NextPage<LegalPageProps> = ({ title, children }) => {
  return (
    <>
      <Layout headerType={HeaderType.Main}>
        <Head>
          <title>{title}</title>
        </Head>
        <Container className='py-12'>
          <div className='xl:w-5/6'>
            <h1 className='mb-4 text-3xl md:text-4xl'>{title}</h1>
            <section
              className={`text-slate-800 font-sans_light ${styles.content}`}
            >
              {children}
            </section>
          </div>
        </Container>
      </Layout>
    </>
  )
}

export { LegalPage }
