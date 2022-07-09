import { useEffect } from 'react'

import { capitalCase } from 'change-case'
import { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import ErrorPage from 'next/error'
import Head from 'next/head'
import { useRouter } from 'next/router'

import {
  CategoryArticle,
  Container,
  Layout,
  LoadingPage,
  PageTitle,
} from 'components'
import { getAllCategoriesWithSlug, getPostsByCategory } from 'lib/api'
import { CATEGORY_PATH, CMS_NAME, HEADER_TYPE } from 'lib/constants'
import { usePageStore } from 'lib/hooks/store'
import { CategoryPage, PostsQueried } from 'lib/types'
import { categoryName } from 'lib/utils'

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
    <Layout headerType={HEADER_TYPE.PRIMARY}>
      <Head>
        <title>
          {categoryName(pageTitle, true)} | {CMS_NAME}
        </title>
      </Head>

      <PageTitle text={pageTitle} />

      <Container className='flex-col py-10 md:flex-row' sidebar>
        {allCategories &&
          allCategories.map(({ node }, index) => (
            <CategoryArticle
              key={node.id}
              {...node}
              isFirst={index === 0}
              isLast={index + 1 === allCategories.length}
            />
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
