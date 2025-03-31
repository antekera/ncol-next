import { useCallback, useEffect, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import * as Sentry from '@sentry/browser'
import { STATUS } from '@lib/constants'
import { LoaderProps, PostsFetcherReturn } from '@lib/types'
import { GAEvent } from '@lib/utils/ga'

interface Props extends LoaderProps {
  gaCategory: string
  loadOnScroll?: boolean
  maxRuns?: number
}

export const useLoadMorePosts = ({
  cursor,
  gaCategory,
  loadOnScroll,
  onFetchMoreAction,
  qty,
  slug,
  maxRuns = 3
}: Props) => {
  const [lastPostId, setLastPostId] = useState(cursor ?? '')
  const [posts, setPosts] = useState<PostsFetcherReturn | undefined>()
  const [status, setStatus] = useState<string>(STATUS.Success)

  const loadingRef = useRef(false)
  const runCountRef = useRef(0)
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false
  })

  const loadMorePosts = useCallback(async () => {
    try {
      setStatus(STATUS.Loading)
      const response = await onFetchMoreAction({
        slug,
        qty,
        cursor: lastPostId
      })

      if (!response?.edges?.length) {
        setStatus(STATUS.Error)
        return
      }

      setPosts(prevPosts => ({
        edges: [...(prevPosts?.edges ?? []), ...response.edges],
        pageInfo: response.pageInfo
      }))
      setLastPostId(response.pageInfo.endCursor)

      GAEvent({
        category: 'LOAD_MORE_POSTS',
        label: `LOAD_MORE_POSTS_${gaCategory.toUpperCase()}`
      })
      setStatus(STATUS.Success)
    } catch (err) {
      Sentry.captureException(err)
      setStatus(STATUS.Error)
    }
  }, [lastPostId, onFetchMoreAction, qty, slug, gaCategory])

  useEffect(() => {
    if (loadOnScroll) {
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
    }
  }, [inView, status, loadMorePosts, loadOnScroll, maxRuns])

  return {
    posts,
    status,
    loadMorePosts,
    isLoading: status === STATUS.Loading,
    loaderRef: ref
  }
}
