import { NextPage } from 'next'
import Head from 'next/head'

import { Container } from '@components/Container'
import { Layout } from '@components/Layout'
import { CMS_NAME } from '@lib/constants'

import styles from './style.module.css'
import { HeaderType } from '../Header'

type LegalPageProps = {
  children: React.ReactNode
  title: string
}

const LegalPage: NextPage<LegalPageProps> = ({ title, children }) => {
  const headTitle = `${title} | ${CMS_NAME}`

  return (
    <Layout headerType={HeaderType.Main}>
      <Head>
        <title>{headTitle}</title>
      </Head>
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
    </Layout>
  )
}

export { LegalPage }
