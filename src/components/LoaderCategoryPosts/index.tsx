'use client'

import { LoaderCircle, Plus } from 'lucide-react'
import { GA_EVENTS, STATUS } from '@lib/constants'
import { LoaderProps } from '@lib/types'
import { useState } from 'react'
import { GAEvent } from '@lib/utils'
import * as Sentry from '@sentry/browser'

const LoaderCategoryPosts = ({ slug, qty, fetchMorePosts }: LoaderProps) => {
  const [offset, setOffset] = useState(qty)
  const [status, setStatus] = useState<string>(STATUS.Success)

  const handleLoadMore = async () => {
    setStatus(STATUS.Loading)
    GAEvent({
      category: GA_EVENTS.LOAD_MORE_POSTS.CATEGORY,
      label: `${slug.toUpperCase()}`
    })
    try {
      await fetchMorePosts(offset)
      setOffset(prev => prev + qty)
    } catch (error) {
      Sentry.captureException(error)
      setStatus(STATUS.Error)
    }
    setStatus(STATUS.Success)
  }

  return (
    <div className='pt-6 md:pt-8'>
      <LoadMoreButton status={status} onLoadMore={handleLoadMore} />
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
