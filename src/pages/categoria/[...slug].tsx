import React from 'react'

import { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import ErrorPage from 'next/error'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { HeaderType } from '@components/Header'
import {
  CategoryArticle,
  Container,
  Layout,
  LoadingPage,
  Meta,
  PageTitle,
  AdDfpSlot,
  Sidebar
} from '@components/index'
import { DFP_ADS_PAGES } from '@lib/ads'
import { getAllCategoriesWithSlug, getCategoryPagePosts } from '@lib/api'
import { CATEGORY_PATH, CMS_NAME } from '@lib/constants'
import { titleFromSlug } from '@lib/utils'
import { CategoriesPath, CategoryPage } from 'lib/types'
import { categoryName } from 'lib/utils'

const Page: NextPage<CategoryPage> = ({ posts: propPosts, title, ads }) => {
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
          id={ads.menu.id}
          style={ads.menu.style}
          className='pt-4 show-desktop'
        />
        <AdDfpSlot
          id={ads.menu_mobile.id}
          style={ads.menu_mobile.style}
          className='pt-4 show-mobile'
        />
      </div>
      <Container className='py-10' sidebar>
        <section className='w-full md:pr-8 md:w-2/3 lg:w-3/4'>
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
                  <AdDfpSlot id={ads.cover.id} className='pt-4' />
                )}
                {index === 9 && (
                  <AdDfpSlot id={ads.categoryFeed.id} className='pt-4' />
                )}
                {index === 14 && (
                  <AdDfpSlot id={ads.categoryFeed2.id} className='pt-4' />
                )}
                {index === 20 && (
                  <AdDfpSlot
                    id={ads.squareC2.id}
                    className='mb-6 show-mobile'
                  />
                )}
                {index === 25 && (
                  <AdDfpSlot
                    id={ads.squareC3.id}
                    className='mb-6 show-mobile'
                  />
                )}
              </React.Fragment>
            ))}
        </section>
        <Sidebar ads={ads} />
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
      title: category,
      ads: DFP_ADS_PAGES
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
