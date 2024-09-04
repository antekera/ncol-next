export const revalidate = 21600 // 6 hours

import { Fragment, Suspense } from 'react'

import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getAllCategoriesWithSlug } from '@app/actions/getAllCategoriesWithSlug'
import { getCategoryPagePosts } from '@app/actions/getCategoryPagePosts'
import { AdDfpSlot } from '@components/AdDfpSlot'
import { CategoryArticle } from '@components/CategoryArticle'
import { CategoryLoadPosts } from '@components/CategoryLoadPosts'
import { Container } from '@components/Container'
import { Header } from '@components/Header'
import { Loading } from '@components/LoadingCategory'
import { Newsletter } from '@components/Newsletter'
import { PageTitle } from '@components/PageTitle'
import { RevalidateForm } from '@components/RevalidateForm'
import { Sidebar } from '@components/Sidebar'
import { DFP_ADS_PAGES as ads } from '@lib/ads'
import { CATEGORY_PATH } from '@lib/constants'
import { CategoriesPath, MetadataProps } from '@lib/types'
import { categoryName, titleFromSlug } from '@lib/utils'

const postsQty = Number(process.env.NEXT_PUBLIC_POSTS_QTY_CATEGORY ?? 10)

export async function generateMetadata({
  params
}: MetadataProps): Promise<Metadata> {
  const { slug } = params
  return {
    title: categoryName(titleFromSlug(String(slug)), true)
  }
}

export async function generateStaticParams() {
  const categoryList: CategoriesPath = await getAllCategoriesWithSlug()

  return (
    categoryList?.edges.map(({ node }) => ({
      slug: `${CATEGORY_PATH}/${node.slug}/`
    })) ?? []
  )
}

const Content = async ({ slug }: { slug: string }) => {
  const { edges, pageInfo, ...rest } =
    (await getCategoryPagePosts(slug, postsQty, '')) ?? {}

  // eslint-disable-next-line no-console
  console.log({ edges, pageInfo, rest, slug, postsQty })

  if (!edges) {
    return notFound()
  }

  return (
    <>
      {edges?.map(({ node }, index) => (
        <Fragment key={node.id}>
          <CategoryArticle
            key={node.id}
            {...node}
            isFirst={index === 0}
            isLast={index + 1 === edges.length}
          />
          {index === 4 && (
            <>
              <Newsletter className='my-4 md:hidden' />
              <AdDfpSlot
                id={ads.cover.id}
                style={ads.cover.style}
                className='bloque-adv-list pt-4'
              />
            </>
          )}
          {index === 9 && (
            <AdDfpSlot
              id={ads.categoryFeed.id}
              style={ads.categoryFeed.style}
              className='bloque-adv-list pt-4'
            />
          )}
          {index === 14 && (
            <AdDfpSlot
              id={ads.categoryFeed2.id}
              style={ads.categoryFeed2.style}
              className='bloque-adv-list pt-4'
            />
          )}
          {index === 20 && (
            <AdDfpSlot
              id={ads.squareC2.id}
              style={ads.squareC2.style}
              className='show-mobile bloque-adv-list mb-6'
            />
          )}
          {index === 25 && (
            <AdDfpSlot
              id={ads.squareC3.id}
              style={ads.squareC3.style}
              className='show-mobile bloque-adv-list mb-6'
            />
          )}
        </Fragment>
      ))}
      {edges.length > 9 && (
        <CategoryLoadPosts
          slug={slug}
          postsQty={postsQty}
          endCursor={pageInfo.endCursor}
        />
      )}
    </>
  )
}

export default async function Page({
  params
}: {
  readonly params: { readonly slug: string }
}) {
  const { slug } = params
  return (
    <>
      <RevalidateForm />
      <Header headerType='primary' />
      <PageTitle text={titleFromSlug(slug)} />
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
          <Suspense fallback={<Loading />}>
            <Content slug={slug} />
          </Suspense>
        </section>
        <Sidebar
          style={ads.sidebar.style}
          adID={ads.sidebar.id}
          adID2={ads.sidebar.id}
        />
      </Container>
    </>
  )
}
