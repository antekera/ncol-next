'use client'

import { LoaderCircle } from 'lucide-react'
import { AdSenseBanner } from '@components/AdSenseBanner'
import { Container } from '@components/Container'
import { PostContent } from '@components/PostContent'
import { ad } from '@lib/ads'
import { useLoadMorePosts } from '@lib/hooks/useLoadMorePosts'
import { LoaderProps } from '@lib/types'
import { splitPost } from '@lib/utils'

export const LoaderSinglePost = ({
  cursor,
  onFetchMoreAction,
  qty,
  slug
}: LoaderProps) => {
  const { posts, loaderRef, isLoading } = useLoadMorePosts({
    gaCategory: 'SINGLE',
    cursor,
    loadOnScroll: true,
    onFetchMoreAction,
    qty,
    slug,
    maxRuns: 10
  })

  return (
    <>
      {posts?.edges?.map(({ node }) => {
        const content = splitPost({ post: node })
        const [firstParagraph, secondParagraph] = Array.isArray(content)
          ? content
          : []
        const filteredPostByPostSlug =
          posts?.edges
            ?.filter(
              ({ node: postsNode }) =>
                postsNode.categories.edges.find(
                  ({ node: childPostNode }) => childPostNode.slug === node.slug
                ) && postsNode.title !== node.title
            )
            .slice(0, 6) ?? []
        const props = {
          title: node.title,
          date: node.date,
          categories: node.categories,
          tags: node.tags,
          customFields: node.customFields,
          featuredImage: node.featuredImage,
          firstParagraph,
          secondParagraph,
          relatedPosts: filteredPostByPostSlug
        }

        return (
          <div key={node.id} className='mt-8 border-t border-slate-200 pt-8'>
            <Container className='my-4'>
              <AdSenseBanner {...ad.global.top_header} />
            </Container>
            <PostContent {...props} />
          </div>
        )
      })}
      <div ref={loaderRef} className='h-10' />
      {isLoading && (
        <Container className='my-6 flex w-full items-center justify-center rounded bg-slate-200 p-4 py-4 text-center'>
          <span className='flex items-center gap-2 font-sans'>
            <LoaderCircle className='animate-spin' />
            Cargando el siguiente artículo...
          </span>
        </Container>
      )}
    </>
  )
}
