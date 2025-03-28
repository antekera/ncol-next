'use client'

import { CircleCheckBig, LoaderCircle, Plus } from 'lucide-react'
import { useState } from 'react'
import { getCategoryPagePosts } from '@app/actions/getCategoryPagePosts'
import * as Sentry from '@sentry/browser'
import { CategoryArticle } from '@components/CategoryArticle'
import { STATUS } from '@lib/constants'
import { cn } from '@lib/shared'
import { PostQueried } from '@lib/types'
import { GAEvent } from '@lib/utils/ga'

const CategoryLoadPosts = ({
  slug,
  className,
  postsQty,
  endCursor
}: {
  slug: string
  endCursor: string
  className?: string
  postsQty: number
}) => {
  const [lastPostId, setLastPostId] = useState(endCursor)
  const [posts, setPosts] = useState<PostQueried[]>()
  const [status, setStatus] = useState<string>(STATUS.Success)
  const classes = cn(
    'button focus:shadow-outline mt-4 mb-8 block w-full cursor-pointer p-3! text-center disabled:cursor-not-allowed disabled:bg-slate-400',
    className
  )

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
      <button
        disabled={status === STATUS.Error || status === STATUS.Loading}
        type='button'
        onClick={handleLoadPosts}
        className={classes}
      >
        <span className='mx-auto flex gap-2 text-lg'>
          {status === STATUS.Error && (
            <>
              <CircleCheckBig /> Todas las noticias has sido cargadas
            </>
          )}
          {status === STATUS.Loading && (
            <LoaderCircle className='animate-spin' />
          )}
          {status === STATUS.Success && (
            <>
              <Plus /> Ver más noticias
            </>
          )}
        </span>
      </button>
    </div>
  )
}

export { CategoryLoadPosts }
