export const dynamic = 'force-static'
export const revalidate = 31536000 // 1 year cache — on-demand revalidation handles fresh content

import {
  getMetadataPosts,
  getSinglePost
} from '@app/actions/getPostAndMorePosts'
import { DeferredRender } from '@components/DeferredRender'
import { Header } from '@components/Header'
import { Content } from '@blocks/content/SinglePost'
import { CMS_URL, S3_IMAGE_MAX_AGE_DAYS } from '@lib/constants'
import { sharedOpenGraph } from '@lib/sharedOpenGraph'
import { isPostPublishedWithinDays } from '@lib/utils/isPostPublishedWithinDays'
import { cleanExcerpt } from '@lib/utils/cleanExcerpt'
import { getCategoryNode } from '@lib/utils/getCategoryNode'
import type { Post } from '@lib/types'
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
  const canonicalUrl = uri ? `${CMS_URL}${uri}` : undefined
  const rawImageUrl = featuredImage?.node?.sourceUrl
  const isCdnImage = rawImageUrl?.includes('cdn.noticiascol.com')
  const imageUrl =
    rawImageUrl &&
    (!isCdnImage || isPostPublishedWithinDays(date, S3_IMAGE_MAX_AGE_DAYS))
      ? rawImageUrl
      : undefined

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
      images: imageUrl
        ? [{ url: imageUrl, width: 800, height: 600, alt: title }]
        : undefined,
      type: 'article',
      publishedTime: date ? new Date(date).toISOString() : '',
      modifiedTime: modified ? new Date(modified).toISOString() : undefined
    },
    twitter: {
      ...sharedOpenGraph.twitter,
      title,
      description,
      images: imageUrl ? { url: imageUrl, alt: title } : undefined
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

  const fallbackData = (() => {
    const p = initialData?.post as any
    const src: string = p?.featuredImage?.node?.sourceUrl ?? ''
    if (!src) return initialData
    const isCdn = src.includes('cdn.noticiascol.com')
    if (
      !isCdn ||
      isPostPublishedWithinDays(p?.date as string, S3_IMAGE_MAX_AGE_DAYS)
    )
      return initialData
    return { ...initialData, post: { ...p, featuredImage: null } }
  })()

  const { post } = metaData ?? {}
  // Categorías, etiquetas y slug de autor no están en queryMetaData, pero sí en
  // el post completo que ya se resolvió arriba. Se reutiliza en vez de pedir más.
  const fullPost: Post | undefined = fallbackData?.post
  const authorSlug = fullPost?.author?.node?.slug
  const articleSection = getCategoryNode(fullPost?.categories)?.name
  const keywords = fullPost?.tags?.edges
    ?.map(edge => edge.node.name)
    .filter(Boolean)
    .join(', ')

  const newsArticleJsonLd = post
    ? {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        '@id': `${CMS_URL}${post.uri}#article`,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${CMS_URL}${post.uri}`
        },
        headline: post.title,
        description: cleanExcerpt(post.excerpt),
        inLanguage: 'es-VE',
        datePublished: post.date
          ? new Date(post.date).toISOString()
          : undefined,
        dateModified: post.modified
          ? new Date(post.modified).toISOString()
          : undefined,
        url: `${CMS_URL}${post.uri}`,
        articleSection: articleSection || undefined,
        keywords: keywords || undefined,
        // Señal geográfica: la cobertura regional del medio solo existía en el
        // cuerpo del texto, no en datos estructurados.
        contentLocation: {
          '@type': 'Place',
          name: 'Venezuela',
          address: { '@type': 'PostalAddress', addressCountry: 'VE' }
        },
        image: (() => {
          const src = post.featuredImage?.node?.sourceUrl
          const isCdn = src?.includes('cdn.noticiascol.com')
          const expired =
            isCdn &&
            !isPostPublishedWithinDays(post.date, S3_IMAGE_MAX_AGE_DAYS)
          // Nunca dejar el artículo sin imagen: las notas antiguas cuya imagen
          // ya no existe en el CDN caen a la imagen social por defecto.
          return {
            '@type': 'ImageObject',
            url: src && !expired ? src : `${CMS_URL}/media/fb.png`
          }
        })(),
        isAccessibleForFree: true,
        author: post.author?.node?.name
          ? {
              '@type': 'Person',
              name: post.author.node.name,
              url: authorSlug ? `${CMS_URL}/autor/${authorSlug}/` : undefined
            }
          : undefined,
        publisher: { '@id': `${CMS_URL}/#organization` }
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
      <Header headerType='single' uri={buildSlug} />
      <Content slug={buildSlug} rawSlug={slug} data={fallbackData} />
      <MobileRankingLinks />
      <DeferredRender timeoutMs={2000}>
        <GoToBottom />
      </DeferredRender>
    </>
  )
}
