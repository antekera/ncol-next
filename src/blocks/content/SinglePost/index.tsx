'use client'

import { notFound } from 'next/navigation'
import { PostContent } from '@components/PostContent'
import { getCategoryNode, splitPost } from '@lib/utils'
import { Container } from '@components/Container'
import { processCategories } from '@lib/utils/processCategories'
import { LoaderSinglePost } from '@components/LoaderSinglePosts'

import { Sidebar } from '@components/Sidebar'

export const Content = ({
  rawSlug,
  data
}: {
  slug: string
  rawSlug: string
  data?: any
}) => {
  const post = data?.post

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
  const inlineRelatedPost = data?.inlineRelatedPost
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
    content: rawContent,
    inlineRelatedPost
  }
  const slugPost: string | undefined = processCategories(
    categories?.edges,
    1
  )?.[0]?.node?.slug

  return (
    <Container className='py-0 md:py-6' sidebar>
      <section className='w-full md:w-2/3 md:pr-8 lg:w-3/4'>
        <PostContent {...props} />
      </section>
      <Sidebar offsetTop={80} />
      {slugPost && title && <LoaderSinglePost slug={slugPost} title={title} />}
    </Container>
  )
}
