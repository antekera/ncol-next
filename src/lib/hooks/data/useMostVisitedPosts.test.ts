import { renderHook } from '@testing-library/react'
import { useMostVisitedPosts } from '@lib/hooks/data/useMostVisitedPosts'
import { fetcher } from '@lib/utils/utils'

jest.mock('@lib/utils/utils', () => ({
  fetcher: jest.fn()
}))

describe('useMostVisitedPosts', () => {
  it('should call the fetcher with the correct query', () => {
    renderHook(() => useMostVisitedPosts({ limit: 10, period: '24h' }))
    expect(fetcher).toHaveBeenCalledWith('/api/most-visited/?limit=10&period=24h')
  })

  it('should call the fetcher with no query params', () => {
    renderHook(() => useMostVisitedPosts({}))
    expect(fetcher).toHaveBeenCalledWith('/api/most-visited/')
  })

  it('should call the fetcher with only a limit', () => {
    renderHook(() => useMostVisitedPosts({ limit: 5 }))
    expect(fetcher).toHaveBeenCalledWith('/api/most-visited/?limit=5')
  })

  it('should call the fetcher with only a period', () => {
    renderHook(() => useMostVisitedPosts({ period: 'weekly' }))
    expect(fetcher).toHaveBeenCalledWith('/api/most-visited/?period=weekly')
  })
})
