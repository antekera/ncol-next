'use client'

import * as Sentry from '@sentry/browser'
import { notFound } from 'next/navigation'
import { CategoryArticle } from '@components/CategoryArticle'
import { Loading } from '@components/LoadingSingle'
import { NotFoundAlert } from '@components/NotFoundAlert'
import { useSinglePost } from '@lib/hooks/data/useSinglePost'
import { PostContent } from '@components/PostContent'
import { RECENT_NEWS } from '@lib/constants'
import { getCategoryNode, splitPost } from '@lib/utils'
import { Container } from '@components/Container'

export const Content = ({ slug }: { slug: string }) => {
  const { data, error, isLoading } = useSinglePost(slug)
  const { post, posts } = data ?? {}

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
  const filteredPostByPostSlug =
    posts?.edges
      ?.filter(
        ({ node }) =>
          node.categories.edges.find(({ node }) => node.slug === postSlug) &&
          node.title !== title
      )
      .slice(0, 6) ?? []
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
    relatedPosts: filteredPostByPostSlug
  }

  return (
    <>
      <PostContent
        {...props}
        sidebarContent={
          <>
            {filteredPostByPostSlug.length > 0 &&
              filteredPostByPostSlug.length < 3 && (
                <div className='hidden md:block'>
                  <h5 className='link-post-category border-primary bg-primary relative mb-4 inline-block rounded-sm px-1 pt-1 pb-[3px] font-sans text-xs leading-none text-white uppercase'>
                    {RECENT_NEWS}
                  </h5>
                  {filteredPostByPostSlug.map(({ node }, index) => {
                    return (
                      <CategoryArticle
                        key={node.id}
                        type='sidebar'
                        {...node}
                        isFirst={index === 0}
                        isLast={index + 1 === filteredPostByPostSlug.length}
                        excerpt={undefined}
                      />
                    )
                  })}
                </div>
              )}
          </>
        }
      />
    </>
  )
}
