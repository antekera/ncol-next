export const dynamic = 'force-static'
export const revalidate = 604800 // 1 week

import { getMetadataPosts } from '@app/actions/getPostAndMorePosts'
import { Header } from '@components/Header'
import { Content } from '@blocks/content/SinglePost'
import { CMS_URL } from '@lib/constants'
import { sharedOpenGraph } from '@lib/sharedOpenGraph'
import { cleanExcerpt } from '@lib/utils/cleanExcerpt'
import { MobileRankingLinks } from '@components/MobileRankingLinks'
import { GoToBottom } from '@components/GoToBottom'

type Params = Promise<{
  slug: string
  posts: string
  month: string
  day: string
}>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export async function generateMetadata({
  params
}: {
  params: Params
  searchParams: SearchParams
}) {
  const { posts, month, day, slug } = await params
  const slugUrl = `/${[posts, month, day, slug].filter(Boolean).join('/')}`
  const { post } = (await getMetadataPosts(slugUrl)) ?? {}
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
  params: Promise<Params>
  searchParams: Promise<SearchParams>
}) {
  const params = await props.params
  const slug = params.slug
  const posts = params.posts
  const month = params.month
  const day = params.day
  const buildSlug = `/${[posts, month, day, slug].filter(Boolean).join('/')}`

  return (
    <>
      <Header uri={buildSlug} />
      <MobileRankingLinks />
      <Content slug={buildSlug} rawSlug={slug} />
      <GoToBottom />
    </>
  )
}
