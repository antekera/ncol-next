import { useEffect } from 'react'

import { capitalCase } from 'change-case'
import { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import ErrorPage from 'next/error'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { Container, Layout, LoadingPage } from 'components'
import { getAllCategoriesWithSlug, getPostsByCategory } from 'lib/api'
import { CATEGORY_PATH, CMS_NAME, HEADER_TYPE } from 'lib/constants'
import { CategoryPage, PostsQueried } from 'lib/types'

import { usePageStore } from '../../lib/hooks/store'

const Page: NextPage<CategoryPage> = ({ posts: propPosts, title }) => {
  const router = useRouter()
  const isLoading = router.isFallback

  const { setPageSetupState } = usePageStore()

  useEffect(() => {
    setPageSetupState({
      isLoading,
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setPageSetupState({
      isLoading,
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  if (isLoading) {
    return <LoadingPage />
  }

  if (!propPosts) {
    return <ErrorPage statusCode={404} />
  }

  const allCategories = propPosts?.edges
  const pageTitle = capitalCase(title)

  return (
    <Layout headerType={HEADER_TYPE.CATEGORY}>
      <Head>
        <title>
          {pageTitle} | {CMS_NAME}
        </title>
      </Head>

      <Container className='flex-col py-10 md:flex-row' sidebar>
        <h1 className='pb-4 text-4xl border-b border-slate-200'>{pageTitle}</h1>
        {allCategories &&
          allCategories.map(({ node }) => (
            <article
              key={node.id}
              className='flex flex-col w-full border-b sm:flex-row sm:flex-row-reverse border-slate-200'
            >
              <div className='relative image-wrapper sm:ml-4 sm:w-4/12'>
                <Link href={node.uri}>
                  <a aria-label={node.title}>
                    <Image
                      layout='fill'
                      priority
                      alt={title}
                      src={node.featuredImage?.node.sourceUrl ?? ''}
                    />
                  </a>
                </Link>
              </div>
              <div className='flex-1 content-wrapper'>
                <Link href={node.uri}>
                  <a aria-label={node.title}>
                    <h2 className='mb-1 text-xl'>{node.title}</h2>
                  </a>
                </Link>
                {node.excerpt && (
                  <p className='text-sm md:text-md'>
                    {node.excerpt.replace(
                      /&nbsp; |<p>|<p>&nbsp; |(&#8230)[\s\S]*$/gim,
                      ''
                    )}{' '}
                    ...
                  </p>
                )}
                <div className='flex items-center'>
                  <div className='text-sm md:text-md'>{node.date}</div>
                </div>
                <Link href={node.uri}>
                  <a aria-label={node.title}>Ver noticia →</a>
                </Link>
              </div>
            </article>
          ))}
      </Container>
    </Layout>
  )
}

export default Page

export const getStaticProps: GetStaticProps = async ({ params = {} }) => {
  const category = String(params.slug)
  const data = await getPostsByCategory(category)

  return {
    props: {
      posts: data?.posts,
      childrenCategories: data?.categories,
      title: category,
    },
    revalidate: 84600,
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const allCategories: PostsQueried = await getAllCategoriesWithSlug()

  return {
    paths:
      allCategories.edges.map(({ node }) => `${CATEGORY_PATH}/${node.slug}/`) ||
      [],
    fallback: true,
  }
}
