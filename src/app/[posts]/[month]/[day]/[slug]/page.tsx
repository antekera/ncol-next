export const dynamic = 'force-static'
export const revalidate = 604800 // 1 week

import { Suspense } from 'react'
import { getPostAndMorePosts } from '@app/actions/getPostAndMorePosts'
import { AdSenseBanner } from '@components/AdSenseBanner'
import { Header } from '@components/Header'
import { Loading } from '@components/LoadingSingle'
import { Content } from '@blocks/content/SinglePost'
import { ad } from '@lib/ads'
import { CMS_URL } from '@lib/constants'
import { sharedOpenGraph } from '@lib/sharedOpenGraph'
import { getMainWordFromSlug } from '@lib/utils'
import { cleanExcerpt } from '@lib/utils/cleanExcerpt'

type Params = Promise<{
  slug: string
  posts: string
  month: string
  day: string
}>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

async function getPostData(slug: string) {
  return getPostAndMorePosts(slug, false, undefined, getMainWordFromSlug(slug))
}

export async function generateMetadata({
  params
}: {
  params: Params
  searchParams: SearchParams
}) {
  const { posts, month, day, slug } = await params

  const slugUrl = `/${[posts, month, day, slug].filter(Boolean).join('/')}`
  const { post } = (await getPostData(slugUrl)) ?? {}
  const { featuredImage, title, uri, excerpt, date } = post ?? {}
  const description = cleanExcerpt(excerpt)
  const url = featuredImage?.node?.sourceUrl ?? ''

  return {
    ...sharedOpenGraph,
    title,
    description,
    openGraph: {
      ...sharedOpenGraph.openGraph,
      title,
      description,
      url: `${CMS_URL}${uri}`,
      images: [
        {
          url,
          width: 800,
          height: 600,
          alt: title
        }
      ],
      type: 'article',
      publishedTime: date ? new Date(date).toISOString() : ''
    },
    twitter: {
      ...sharedOpenGraph.twitter,
      title,
      description,
      images: {
        url,
        alt: title
      }
    }
  }
}

export default async function Page(props: {
  params: Params
  searchParams: SearchParams
}) {
  const params = await props.params
  const slug = params.slug
  const posts = params.posts
  const month = params.month
  const day = params.day

  const buildSlug = `/${[posts, month, day, slug].filter(Boolean).join('/')}`
  return (
    <>
      <Header headerType='single' uri={buildSlug} />
      <div className='container mx-auto mt-4'>
        <AdSenseBanner {...ad.global.top_header} />
      </div>
      <Suspense fallback={<Loading slug={buildSlug} />}>
        <Content slug={buildSlug} />
      </Suspense>
    </>
  )
}
