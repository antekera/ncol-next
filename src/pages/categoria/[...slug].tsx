import React from 'react'

import { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import ErrorPage from 'next/error'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { isMobile } from 'react-device-detect'

import { HeaderType } from '@components/Header'
import {
  CategoryArticle,
  Container,
  Layout,
  LoadingPage,
  Meta,
  PageTitle,
  AdDfpSlot
} from '@components/index'
import { getAllCategoriesWithSlug, getCategoryPagePosts } from '@lib/api'
import { CATEGORY_PATH, CMS_NAME } from '@lib/constants'
import {
  AD_DFP_CATEGORY_FEED,
  AD_DFP_CATEGORY_FEED_2,
  AD_DFP_COVER,
  AD_DFP_MENU,
  AD_DFP_MENU_MOBILE,
  SQUARE_C2,
  SQUARE_C3
} from '@lib/ads'
import { titleFromSlug } from '@lib/utils'
import { CategoriesPath, CategoryPage } from 'lib/types'
import { categoryName } from 'lib/utils'

const Page: NextPage<CategoryPage> = ({ posts: propPosts, title }) => {
  const router = useRouter()
  const isLoading = router.isFallback

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
      <div className='container mx-auto'>
        <AdDfpSlot
          id={isMobile ? AD_DFP_MENU_MOBILE.ID : AD_DFP_MENU.ID}
          style={isMobile ? AD_DFP_MENU_MOBILE.STYLE : AD_DFP_MENU.STYLE}
          className='pt-4'
        />
      </div>
      <Container className='py-10' sidebar>
        {allCategories &&
          allCategories.map(({ node }, index) => (
            <React.Fragment key={node.id}>
              <CategoryArticle
                key={node.id}
                {...node}
                isFirst={index === 0}
                isLast={index + 1 === allCategories.length}
              />
              {index === 4 && (
                <AdDfpSlot id={AD_DFP_COVER.ID} className='pt-4' />
              )}
              {index === 9 && (
                <AdDfpSlot id={AD_DFP_CATEGORY_FEED.ID} className='pt-4' />
              )}
              {index === 14 && (
                <AdDfpSlot id={AD_DFP_CATEGORY_FEED_2.ID} className='pt-4' />
              )}
              {index === 20 && isMobile && (
                <AdDfpSlot id={SQUARE_C2.ID} className='mb-6' />
              )}
              {index === 25 && isMobile && (
                <AdDfpSlot id={SQUARE_C3.ID} className='mb-6' />
              )}
            </React.Fragment>
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

  if (!data) {
    return {
      redirect: {
        destination: '/pagina-no-encontrada',
        permanent: true
      }
    }
  }

  return {
    props: {
      pageTitle: `/CATEGORY/${category.toUpperCase()}`,
      pageType: '/CATEGORY',
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
