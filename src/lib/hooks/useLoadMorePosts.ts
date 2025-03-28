import { useState } from 'react'
import * as Sentry from '@sentry/browser'
import { STATUS } from '@lib/constants'
import { GAEvent } from '@lib/utils/ga'

type FetchResponse = {
  edges: any[]
  pageInfo: { endCursor: string }
}

type UseLoadMorePostsProps = {
  initialCursor: string
  identifier: string
  postsQty: number
  gaCategory: string
  fetchAction: (
    identifier: string,
    qty: number,
    cursor: string
  ) => Promise<FetchResponse>
}

export function useLoadMorePosts({
  initialCursor,
  identifier,
  postsQty,
  gaCategory,
  fetchAction
}: UseLoadMorePostsProps) {
  const [lastPostId, setLastPostId] = useState(initialCursor)
  const [posts, setPosts] = useState<any[]>([])
  const [status, setStatus] = useState<string>(STATUS.Success)

  const loadMorePosts = async () => {
    try {
      setStatus(STATUS.Loading)
      const { edges, pageInfo } = await fetchAction(
        identifier,
        postsQty,
        lastPostId
      )

      if (!edges?.length) {
        setStatus(STATUS.Error)
        return
      }

      setLastPostId(pageInfo.endCursor)
      setPosts(prevPosts => [...prevPosts, ...edges])

      GAEvent({
        category: gaCategory,
        label: `LOAD_MORE_POSTS_${identifier.toUpperCase()}`
      })

      setStatus(STATUS.Success)
    } catch (err) {
      Sentry.captureException(err)
      setStatus(STATUS.Error)
    }
  }

  return {
    posts,
    status,
    loadMorePosts,
    isLoading: status === STATUS.Loading
  }
}
