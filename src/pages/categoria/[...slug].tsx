import React from 'react'

import { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import ErrorPage from 'next/error'
import Head from 'next/head'

import { HeaderType } from '@components/Header'
import {
  CategoryArticle,
  Container,
  Layout,
  LoadingPage,
  Meta,
  PageTitle
} from '@components/index'
import { getAllCategoriesWithSlug, getCategoryPagePosts } from '@lib/api'
import { usePageStore } from '@lib/hooks/store'
import { titleFromSlug } from '@lib/utils'
import { CATEGORY_PATH, CMS_NAME } from 'lib/constants'
import { CategoriesPath, CategoryPage } from 'lib/types'
import { categoryName } from 'lib/utils'

const Page: NextPage<CategoryPage> = ({ posts: propPosts, title }) => {
  const { isLoading } = usePageStore()

  const allCategories = propPosts?.edges
  const pageTitle = title ? titleFromSlug(title) : `${CMS_NAME}`
  const headTitle = title
    ? `${categoryName(pageTitle, true)} | ${CMS_NAME}`
    : `${CMS_NAME}`

  if (isLoading) {
    return <LoadingPage />
  }

  if (!propPosts) {
    return <ErrorPage statusCode={500} />
  }

  return (
    <Layout headerType={HeaderType.Primary}>
      <Head>
        <title>{headTitle}</title>
        <Meta
          title={pageTitle}
          description={`${categoryName(pageTitle, true)} | ${CMS_NAME}`}
        />
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
  const postsQty = 40
  const category = String(params.slug)
  const data = await getCategoryPagePosts(category, postsQty)

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
    fallback: false
  }
}
