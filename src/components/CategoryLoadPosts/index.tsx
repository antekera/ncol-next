'use client'

import { LoaderCircle, Plus } from 'lucide-react'
import { CategoryArticle } from '@components/CategoryArticle'
import { STATUS } from '@lib/constants'
import { useLoadMorePosts } from '@lib/hooks/useLoadMorePosts'
import { PostsCategoryQueried } from '@lib/types'

type LoadMoreButtonProps = {
  status: string
  onLoadMore: () => void
}
type Props = {
  slug: string
  postsQty: number
  endCursor: string
  getCategoryPagePosts: (
    slug: string,
    postsQty: number,
    endCursor: string
  ) => Promise<PostsCategoryQueried>
}

const CategoryLoadPosts = ({
  slug,
  postsQty,
  endCursor,
  getCategoryPagePosts
}: Props) => {
  const { posts, status, loadMorePosts } = useLoadMorePosts({
    initialCursor: endCursor,
    identifier: slug,
    postsQty,
    gaCategory: 'CATEGORY_PAGE',
    fetchAction: getCategoryPagePosts
  })

  return (
    <div className='pt-6 md:pt-8'>
      {posts?.map(({ node }, index) => (
        <CategoryArticle
          key={node.id}
          {...node}
          isFirst={index === 0}
          isLast={index + 1 === posts.length}
        />
      ))}
      <LoadMoreButton status={status} onLoadMore={loadMorePosts} />
    </div>
  )
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

export { CategoryLoadPosts }
