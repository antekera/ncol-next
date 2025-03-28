'use client'

import { LoaderCircle } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import { CategoryArticle } from '@components/CategoryArticle'
import { STATUS } from '@lib/constants'
import { useLoadMorePosts } from '@lib/hooks/useLoadMorePosts'
import { HomePageQueried } from '@lib/types'

type Props = {
  identifier: string
  postsQty: number
  endCursor: string
  onFetchMoreAction: (
    identifier: string,
    postsQty: number,
    endCursor: string
  ) => Promise<HomePageQueried>
  gaCategory?: string
}

export function InfiniteHomePosts({
  identifier,
  postsQty,
  endCursor,
  onFetchMoreAction,
  gaCategory = 'HOME_PAGE'
}: Props) {
  const { posts, status, loadMorePosts, isLoading } = useLoadMorePosts({
    initialCursor: endCursor,
    identifier,
    postsQty,
    gaCategory,
    fetchAction: onFetchMoreAction
  })

  const loadingRef = useRef(false)
  const runCountRef = useRef(0)
  const maxRuns = 3
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false
  })

  useEffect(() => {
    if (
      inView &&
      status !== STATUS.Loading &&
      !loadingRef.current &&
      runCountRef.current < maxRuns
    ) {
      loadingRef.current = true
      runCountRef.current++

      loadMorePosts().finally(() => {
        loadingRef.current = false
      })
    }
  }, [inView, status, loadMorePosts])

  return (
    <>
      {posts.map(({ node }, index) => (
        <CategoryArticle
          key={node.id}
          {...node}
          isFirst={index === 0}
          isLast={index + 1 === posts.length}
          type='secondary'
          excerpt={undefined}
        />
      ))}
      <div ref={ref} className='h-10' />
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
