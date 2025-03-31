'use client'

import { LoaderCircle, Plus } from 'lucide-react'
import { CategoryArticle } from '@components/CategoryArticle'
import { STATUS } from '@lib/constants'
import { useLoadMorePosts } from '@lib/hooks/useLoadMorePosts'
import { LoaderProps } from '@lib/types'

const LoaderCategoryPosts = ({
  slug,
  qty,
  cursor,
  onFetchMoreAction
}: LoaderProps) => {
  const { posts, status, loadMorePosts } = useLoadMorePosts({
    cursor,
    slug,
    qty,
    gaCategory: 'CATEGORY',
    onFetchMoreAction
  })

  return (
    <div className='pt-6 md:pt-8'>
      {posts?.edges?.map(({ node }) => (
        <CategoryArticle key={node.id} {...node} />
      ))}
      <LoadMoreButton status={status} onLoadMore={loadMorePosts} />
    </div>
  )
}

type LoadMoreButtonProps = {
  status: string
  onLoadMore: () => void
}

const LoadMoreButton = ({ status, onLoadMore }: LoadMoreButtonProps) => {
  if (status === STATUS.Error) {
    return null
  }

  return (
    <button
      disabled={status === STATUS.Loading}
      type='button'
      onClick={onLoadMore}
      className={
        'button focus:shadow-outline mt-4 mb-8 block w-full cursor-pointer p-3! text-center disabled:cursor-not-allowed disabled:bg-slate-400'
      }
    >
      <span className='mx-auto flex gap-2 text-lg'>
        {status === STATUS.Loading && <LoaderCircle className='animate-spin' />}
        {status === STATUS.Success && <Plus />}
        {' Ver más noticias'}
      </span>
    </button>
  )
}

export { LoaderCategoryPosts }
