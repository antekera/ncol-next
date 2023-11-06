import React from 'react'

import { GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'

import { CategoryArticle } from '@components/CategoryArticle'
import { Container } from '@components/Container'
import { Layout } from '@components/Layout'
import { Newsletter } from '@components/Newsletter'
import { getPostsForHome } from '@lib/api'
import { CMS_NAME, CATEGORIES } from '@lib/constants'
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
        <div className='mb-6 flex w-full justify-center rounded-md bg-red-50 py-8'>
          <div className='flex flex-col text-center'>
            <span className='text-center'>
              <span className='material-symbols-rounded mb-1 inline-block w-10 !text-4xl text-red-500'>
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
              <p className='mb-4 px-4 text-sm text-gray-500 md:mb-8 md:text-base'>
                La página solicitada no existe o fue borrada.
              </p>
              <Link
                href='/'
                className='inline-block text-primary hover:text-secondary md:text-lg'
                onClick={() =>
                  GAEvent({
                    category: 'LINK_404',
                    label: 'LINK_404'
                  })
                }
              >
                <span>Ir al inicio</span>
                <span className='material-symbols-rounded relative top-1 ml-1'>
                  arrow_right_alt
                </span>
              </Link>
            </>
            {/* )} */}
          </div>
        </div>
        {posts && posts.length > 0 && (
          <p className='mb-6 border-b border-slate-200 py-4 font-sans_medium text-2xl text-slate-900 md:text-3xl'>
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
  const data = await getPostsForHome(CATEGORIES.COL_LEFT, 30, 'large')

  return {
    props: {
      posts: data ? data?.edges : []
    },
    revalidate: 84600
  }
}

export default NotFound
