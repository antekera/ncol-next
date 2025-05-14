'use client'

import * as Sentry from '@sentry/browser'
import { notFound } from 'next/navigation'
import { Loading } from '@components/LoadingSingle'
import { NotFoundAlert } from '@components/NotFoundAlert'
import { useSinglePost } from '@lib/hooks/data/useSinglePost'
import { PostContent } from '@components/PostContent'
import { getCategoryNode, splitPost } from '@lib/utils'
import { Container } from '@components/Container'

export const Content = ({ slug }: { slug: string }) => {
  const { data, error, isLoading } = useSinglePost(slug)
  const { post } = data ?? {}

  if (error) {
    Sentry.captureException('Failed to fetch single post')
    return notFound()
  }

  if (!post && !isLoading) {
    return (
      <Container>
        <NotFoundAlert />
      </Container>
    )
  }

  if (!post || isLoading) {
    return <Loading slug={slug} />
  }

  const postSlug = getCategoryNode(post.categories)?.slug ?? ''
  const content = splitPost({ post })
  const { featuredImage, title, date, categories, customFields, tags, uri } =
    post ?? {}
  const [firstParagraph, secondParagraph] = Array.isArray(content)
    ? content
    : []

  const props = {
    title,
    uri,
    date,
    categories,
    tags,
    customFields,
    featuredImage,
    firstParagraph,
    secondParagraph,
    slug: postSlug
  }

  return <PostContent {...props} />
}
