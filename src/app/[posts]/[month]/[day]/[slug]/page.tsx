export const dynamic = 'force-static'
export const revalidate = 604800 // 1 week

import {
  getMetadataPosts,
  getSinglePost
} from '@app/actions/getPostAndMorePosts'
import { Header } from '@components/Header'
import { Content } from '@blocks/content/SinglePost'
import { CMS_NAME, CMS_URL } from '@lib/constants'
import { sharedOpenGraph } from '@lib/sharedOpenGraph'
import { cleanExcerpt } from '@lib/utils/cleanExcerpt'
import { MobileRankingLinks } from '@components/MobileRankingLinks'
import { GoToBottom } from '@components/GoToBottom'

type Params = {
  slug: string
  posts: string
  month: string
  day: string
}
type SearchParams = { [key: string]: string | string[] | undefined }

export async function generateMetadata({
  params
}: {
  params: Promise<Params>
  searchParams: Promise<SearchParams>
}) {
  const { posts, month, day, slug } = await params
  const slugUrl = `/${[posts, month, day, slug].filter(Boolean).join('/')}`
  const { post } = (await getMetadataPosts(slugUrl)) ?? {}
  const { featuredImage, title, uri, excerpt, date, modified } = post ?? {}
  const description = cleanExcerpt(excerpt)
  const url = featuredImage?.node?.sourceUrl ?? ''
  const canonicalUrl = uri ? `${CMS_URL}${uri}` : undefined

  return {
    ...sharedOpenGraph,
    title,
    description,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      ...sharedOpenGraph.openGraph,
      title,
      description,
      url: canonicalUrl,
      images: [
        {
          url,
          width: 800,
          height: 600,
          alt: title
        }
      ],
      type: 'article',
      publishedTime: date ? new Date(date).toISOString() : '',
      modifiedTime: modified ? new Date(modified).toISOString() : undefined
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

  const [initialData, metaData] = await Promise.all([
    getSinglePost(buildSlug),
    getMetadataPosts(buildSlug)
  ])

  const { post } = metaData ?? {}
  const newsArticleJsonLd = post
    ? {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: post.title,
        description: cleanExcerpt(post.excerpt),
        datePublished: post.date
          ? new Date(post.date).toISOString()
          : undefined,
        dateModified: post.modified
          ? new Date(post.modified).toISOString()
          : undefined,
        url: `${CMS_URL}${post.uri}`,
        image: post.featuredImage?.node?.sourceUrl
          ? [post.featuredImage.node.sourceUrl]
          : undefined,
        isAccessibleForFree: true,
        publisher: {
          '@type': 'NewsMediaOrganization',
          name: CMS_NAME,
          url: CMS_URL,
          logo: {
            '@type': 'ImageObject',
            url: 'https://noticiascol.com/media/logo-plain.png',
            width: 200,
            height: 60
          }
        }
      }
    : null

  return (
    <>
      {newsArticleJsonLd && (
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(newsArticleJsonLd)
          }}
        />
      )}
      <Header uri={buildSlug} />
      <MobileRankingLinks />
      <Content slug={buildSlug} rawSlug={slug} fallbackData={initialData} />
      <GoToBottom />
    </>
  )
}
