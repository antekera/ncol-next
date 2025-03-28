'use client'

import { LoaderCircle, Plus } from 'lucide-react'
import { useState } from 'react'
import * as Sentry from '@sentry/browser'
import { CategoryArticle } from '@components/CategoryArticle'
import { STATUS } from '@lib/constants'
import { PostQueried, PostsCategoryQueried } from '@lib/types'
import { GAEvent } from '@lib/utils/ga'

type LoadMoreButtonProps = {
  status: string
  onLoadMore: () => void
}
type SetPosts = PostQueried[]
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
  const [lastPostId, setLastPostId] = useState(endCursor)
  const [posts, setPosts] = useState<SetPosts>()
  const [status, setStatus] = useState<string>(STATUS.Success)

  const handleLoadPosts = async () => {
    try {
      setStatus(STATUS.Loading)
      const { edges, pageInfo } =
        (await getCategoryPagePosts(slug, postsQty, lastPostId)) ?? {}

      if (!edges) {
        setStatus(STATUS.Error)
        return
      }

      setLastPostId(pageInfo.endCursor)
      setPosts(
        prevState => (prevState ? [...prevState, ...edges] : edges) ?? []
      )
      GAEvent({
        category: 'CATEGORY_PAGE',
        label: `LOAD_MORE_POSTS_${slug.toUpperCase()}`
      })
      setStatus(STATUS.Success)
    } catch (err) {
      Sentry.captureException(err)
      setStatus(STATUS.Error)
    }
  }

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
      <LoadMoreButton status={status} onLoadMore={handleLoadPosts} />
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
