import { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import ErrorPage from 'next/error'
import Head from 'next/head'

import { HeaderType } from '@components/Header'
import {
  CategoryArticle,
  Container,
  Layout,
  LoadingPage,
  PageTitle
} from '@components/index'
import { getAllCategoriesWithSlug, getPostsByCategory } from '@lib/api'
import { titleFromSlug } from '@lib/utils'
import { CATEGORY_PATH, CMS_NAME } from 'lib/constants'
import { usePageStore } from 'lib/hooks/store'
import { CategoriesPath, CategoryPage } from 'lib/types'
import { categoryName } from 'lib/utils'

const Page: NextPage<CategoryPage> = ({ posts: propPosts, title }) => {
  const { isLoading } = usePageStore()

  if (isLoading) {
    return <LoadingPage />
  }

  if (!propPosts) {
    return <ErrorPage statusCode={404} />
  }

  const allCategories = propPosts?.edges
  const pageTitle = titleFromSlug(title)
  const headTitle = `${categoryName(pageTitle, true)} | ${CMS_NAME}`

  return (
    <Layout headerType={HeaderType.Primary}>
      <Head>
        <title>{headTitle}</title>
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
      posts: data,
      // childrenCategories: data?.categories,
      title: category
    },
    revalidate: 84600
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const categoryList: CategoriesPath = await getAllCategoriesWithSlug()

  if (!categoryList) {
    return { paths: [], fallback: false }
  }

  return {
    paths:
      categoryList.edges.map(({ node }) => `${CATEGORY_PATH}/${node.slug}/`) ||
      [],
    fallback: true
  }
}
