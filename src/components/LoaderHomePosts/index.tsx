'use client'

import { LoaderCircle } from 'lucide-react'
import { CategoryArticle } from '@components/CategoryArticle'
import { useLoadMorePosts } from '@lib/hooks/useLoadMorePosts'
import { LoaderProps } from '@lib/types'

export function LoaderHomePosts({
  slug,
  qty,
  cursor,
  onFetchMoreAction
}: LoaderProps) {
  const { posts, loaderRef, isLoading } = useLoadMorePosts({
    cursor,
    slug,
    qty,
    gaCategory: 'HOME',
    onFetchMoreAction,
    loadOnScroll: true
  })

  return (
    <>
      {posts?.edges?.map(({ node }) => (
        <CategoryArticle
          {...node}
          key={node.id}
          type='secondary'
          excerpt={undefined}
        />
      ))}
      <div ref={loaderRef} className='h-10' />
      {isLoading && (
        <div className='mb-6 flex w-full items-center justify-center rounded bg-slate-200 p-4 text-center'>
          <span className='flex items-center gap-2 font-sans'>
            <LoaderCircle className='animate-spin' />
            Cargando más noticias...
          </span>
        </div>
      )}
    </>
  )
}
