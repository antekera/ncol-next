import { useEffect } from 'react'

import { capitalCase } from 'change-case'
import { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import ErrorPage from 'next/error'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { Container, Layout, LoadingPage } from 'components'
import { getAllCategoriesWithSlug, getPostsByCategory } from 'lib/api'
import { CATEGORY_PATH, CMS_NAME, HEADER_TYPE } from 'lib/constants'
import { CategoryPage, PostsQueried } from 'lib/types'

import { usePageStore } from '../../lib/hooks/store'

const Page: NextPage<CategoryPage> = ({ posts, title }) => {
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

  if (!posts) {
    return <ErrorPage statusCode={404} />
  }

  const allCategories = posts?.edges

  return (
    <Layout headerType={HEADER_TYPE.CATEGORY}>
      <Head>
        <title>
          {capitalCase(title)} | {CMS_NAME}
        </title>
      </Head>
      <Container sidebar>
        {allCategories &&
          allCategories.map(({ node }) => (
            <div key={node.title} className='border-2 border-top'>
              {/* <Image
                width={100}
                height={100}
                alt={node.title}
                src={'node ? node.featuredImage?.node.sourceUrl : null'}
              />*/}
              <h1 className='py-5'>{node.title}</h1>
              {/*<h2>
                {node.categories.edges.map((item, i) => (
                  <Link key={i} href={`${item.node.uri}`}>
                    <a aria-label={item.node.name}>{item.node.name}</a>
                  </Link>
                ))}
              </h2>*/}
              <Link href={`${node.uri}`}>
                <a aria-label={node.title}>Ver más</a>
              </Link>
            </div>
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
      posts: data,
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
