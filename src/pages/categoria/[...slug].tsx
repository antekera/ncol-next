import { Fragment, useRef } from 'react'

import { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import ErrorPage from 'next/error'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { AdDfpSlot } from '@components/AdDfpSlot'
import { CategoryArticle } from '@components/CategoryArticle'
import { Container } from '@components/Container'
import { HeaderType } from '@components/Header'
import { Layout } from '@components/Layout'
import { LoadingPage } from '@components/LoadingPage'
import { Meta } from '@components/Meta'
import { Newsletter } from '@components/Newsletter'
import { PageTitle } from '@components/PageTitle'
import { Sidebar } from '@components/Sidebar'
import { DFP_ADS_PAGES } from '@lib/ads'
import { getAllCategoriesWithSlug, getCategoryPagePosts } from '@lib/api'
import { CATEGORY_PATH, CMS_NAME } from '@lib/constants'
import { titleFromSlug } from '@lib/utils'
import { CategoriesPath, CategoryPage } from 'lib/types'
import { categoryName } from 'lib/utils'

const { CATEGORY_REVALIDATE_TIME, REVALIDATE_KEY, ALLOW_REVALIDATE } =
  process.env || {}

const Page: NextPage<CategoryPage> = ({
  posts: propPosts,
  title,
  ads,
  allowRevalidate
}) => {
  const router = useRouter()
  const refLoaded = useRef(false)

  const isLoading = router.isFallback
  const allCategories = propPosts?.edges
  const pageTitle = title ? titleFromSlug(title) : `${CMS_NAME}`
  const headTitle = title
    ? `${categoryName(pageTitle, true)} | ${CMS_NAME}`
    : `${CMS_NAME}`

  if (
    (propPosts && isLoading && !refLoaded.current) ||
    (!refLoaded.current && allowRevalidate && router.query?.revalidate)
  ) {
    fetch(`/api/revalidate?path=${router.asPath}&token=${REVALIDATE_KEY}`).then(
      () => {
        refLoaded.current = true
        router.replace(router.asPath)
      }
    )
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
          className='show-desktop pt-4'
        />
        <AdDfpSlot
          id={ads.menu_mobile.id}
          style={ads.menu_mobile.style}
          className='show-mobile pt-4'
        />
      </div>
      <Container className='py-10' sidebar>
        <section className='w-full md:w-2/3 md:pr-8 lg:w-3/4'>
          {allCategories?.map(({ node }, index) => (
            <Fragment key={node.id}>
              <CategoryArticle
                key={node.id}
                {...node}
                isFirst={index === 0}
                isLast={index + 1 === allCategories.length}
              />
              {index === 4 && (
                <>
                  <Newsletter className='my-4 md:hidden' />
                  <AdDfpSlot
                    id={ads.cover.id}
                    className='bloque-adv-list pt-4'
                  />
                </>
              )}
              {index === 9 && (
                <AdDfpSlot
                  id={ads.categoryFeed.id}
                  className='bloque-adv-list pt-4'
                />
              )}
              {index === 14 && (
                <AdDfpSlot
                  id={ads.categoryFeed2.id}
                  className='bloque-adv-list pt-4'
                />
              )}
              {index === 20 && (
                <AdDfpSlot
                  id={ads.squareC2.id}
                  className='show-mobile bloque-adv-list mb-6'
                />
              )}
              {index === 25 && (
                <AdDfpSlot
                  id={ads.squareC3.id}
                  className='show-mobile bloque-adv-list mb-6'
                />
              )}
            </Fragment>
          ))}
        </section>
        <Sidebar adID={ads.sidebar.id} adID2={ads.sidebar.id} />
      </Container>
    </Layout>
  )
}

export default Page

export const getStaticProps: GetStaticProps = async ({ params = {} }) => {
  const postsQty = 40
  const category = String(params.slug)
  const data = await getCategoryPagePosts(category, postsQty)

  if (!data?.edges.length) {
    return {
      notFound: true
    }
  }

  return {
    props: {
      pageTitle: `/CATEGORY/${category.toUpperCase()}`,
      pageType: '/CATEGORY',
      posts: data,
      title: category,
      ads: DFP_ADS_PAGES,
      allowRevalidate: ALLOW_REVALIDATE === 'true'
    },
    revalidate: CATEGORY_REVALIDATE_TIME
      ? Number(CATEGORY_REVALIDATE_TIME)
      : undefined
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
    fallback: 'blocking'
  }
}
