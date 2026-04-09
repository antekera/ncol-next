'use client'

import * as Sentry from '@sentry/nextjs'
import { notFound } from 'next/navigation'
import { Loading } from '@components/LoadingSingle'
import { useSinglePost } from '@lib/hooks/data/useSinglePost'
import { PostContent } from '@components/PostContent'
import { getCategoryNode, splitPost } from '@lib/utils'
import { Container } from '@components/Container'
import { processCategories } from '@lib/utils/processCategories'
import { LoaderSinglePost } from '@components/LoaderSinglePosts'

import { Sidebar } from '@components/Sidebar'

export const Content = ({
  slug,
  rawSlug
}: {
  slug: string
  rawSlug: string
}) => {
  const { data, error, isLoading } = useSinglePost(slug)
  const post = data?.post

  if (error) {
    Sentry.captureException(error, {
      tags: { component: 'SinglePost' },
      extra: { slug }
    })
    return notFound()
  }

  if (isLoading) {
    return (
      <Container className='py-4' sidebar>
        <section className='w-full md:w-2/3 md:pr-8 lg:w-3/4'>
          <Loading slug={slug} />
        </section>
        <Sidebar offsetTop={80} />
      </Container>
    )
  }

  if (!post) {
    return notFound()
  }

  const postSlug = getCategoryNode(post.categories)?.slug ?? ''
  const content = splitPost({ post })
  const {
    featuredImage,
    title,
    date,
    categories,
    customFields,
    tags,
    uri,
    content: rawContent
  } = post
  const [firstParagraph, secondParagraph] = Array.isArray(content)
    ? content
    : []

  const props = {
    title: title || '',
    uri: uri || '',
    date: date || '',
    categories: categories || { edges: [] },
    tags: tags || { edges: [] },
    customFields: customFields || {},
    featuredImage: featuredImage || { node: {} },
    firstParagraph,
    secondParagraph,
    slug: postSlug,
    rawSlug,
    content: rawContent
  }
  const slugPost: string | undefined = processCategories(
    categories?.edges,
    1
  )?.[0]?.node?.slug

  return (
    <Container className='py-4' sidebar>
      <section className='w-full md:w-2/3 md:pr-8 lg:w-3/4'>
        <PostContent {...(props as any)} />
      </section>
      <Sidebar offsetTop={80} />
      {slugPost && title && <LoaderSinglePost slug={slugPost} title={title} />}
    </Container>
  )
}
