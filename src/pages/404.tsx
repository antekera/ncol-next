import React from 'react'

import { GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'

import { CategoryArticle } from '@components/CategoryArticle'
import { Container } from '@components/Container'
import { Layout } from '@components/Layout'
import { Newsletter } from '@components/Newsletter'
import { getPostsForHome } from '@lib/api'
import { CMS_NAME } from '@lib/constants'
import { NotFoundPage } from '@lib/types'
import { GAEvent } from '@lib/utils/ga'

const notFoundTitle = 'Página no encontrada'

const NotFound: NextPage<NotFoundPage> = ({ posts }) => {
  const pageTitle = `${notFoundTitle} | ${CMS_NAME}`

  return (
    <Layout>
      <Head>
        <title>{pageTitle}</title>
        <meta key='robots' name='robots' content='noindex,follow' />
        <meta key='googlebot' name='googlebot' content='noindex,follow' />
      </Head>
      <Container className='flex flex-row flex-wrap py-4' sidebar>
        <div className='flex justify-center w-full py-8 mb-6 rounded-md bg-red-50'>
          <div className='flex flex-col text-center'>
            <span className='text-center'>
              <span className='inline-block w-10 mb-1 text-red-500 !text-4xl material-symbols-rounded'>
                warning
              </span>
            </span>
            {/* {posts && posts.length === 0 ? (
              <>
                <p className='mb-2 text-sm text-red-500'>Error 500</p>
                <h1 className='mb-2 text-2xl text-slate-900 md:text-4xl'>
                  Error en el sistema
                </h1>
                <p className='px-4 mb-4 text-sm text-gray-500 md:mb-8 md:text-base'>
                  Por favor regresa más tarde.
                </p>
              </>
            ) : ( */}
            <>
              <p className='mb-2 text-sm text-red-500'>Error 404</p>
              <h1 className='mb-2 text-2xl text-slate-900 md:text-4xl'>
                {notFoundTitle}
              </h1>
              <p className='px-4 mb-4 text-sm text-gray-500 md:mb-8 md:text-base'>
                La página solicitada no existe o fue borrada.
              </p>
              <Link
                href='/'
                className='inline-block md:text-lg text-primary hover:text-secondary'
                onClick={() =>
                  GAEvent({
                    category: 'LINK_404',
                    label: 'LINK_404'
                  })
                }
              >
                <span>Ir al inicio</span>
                <span className='relative ml-1 material-symbols-rounded top-1'>
                  arrow_right_alt
                </span>
              </Link>
            </>
            {/* )} */}
          </div>
        </div>
        {posts && posts.length > 0 && (
          <p className='py-4 mb-6 text-2xl border-b font-sans_medium text-slate-900 md:text-3xl border-slate-200'>
            Noticias recientes:
          </p>
        )}
        {posts &&
          posts.length > 0 &&
          posts.map(({ node }, index) => (
            <CategoryArticle
              key={node.id}
              {...node}
              isFirst={index === 0}
              isLast={index + 1 === posts.length}
            />
          ))}
        <Newsletter className='my-4 md:hidden' />
      </Container>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const data = await getPostsForHome('_Pos_Columna_izq', 30, 'large')

  return {
    props: {
      posts: data ? data?.edges : []
    },
    revalidate: 84600
  }
}

export default NotFound
