import { renderHook, waitFor } from '@testing-library/react'
import { SWRConfig } from 'swr'
import { useOpinionAuthors } from '../useOpinionAuthors'

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{ provider: () => new Map(), shouldRetryOnError: false }}>
      {children}
    </SWRConfig>
  )
}

describe('opinion authors response handling', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
  })

  it.each([401, 503])(
    'keeps authors usable when HTTP returns %s',
    async status => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status,
        json: async () => ({ message: 'Unavailable' })
      })

      const { result } = renderHook(useOpinionAuthors, { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.authors).toEqual([])
    }
  )

  it.each([null, { message: 'Invalid response' }])(
    'rejects a successful non-list response: %j',
    async payload => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => payload
      })

      const { result } = renderHook(useOpinionAuthors, { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.authors).toEqual([])
    }
  )

  it('waits for visibility before fetching the feed and enables the existing endpoint once requested', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: true, json: async () => [] })
    const { rerender, result } = renderHook(
      ({ enabled }) => useOpinionAuthors({ enabled }),
      {
        initialProps: { enabled: false },
        wrapper
      }
    )
    expect(global.fetch).not.toHaveBeenCalled()
    rerender({ enabled: true })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('preserves valid authors and article identity', async () => {
    const authors = [
      {
        name: 'Columnista',
        slug: 'columnista',
        uri: '/autor/columnista/',
        avatarUrl: '',
        latestPost: {
          id: 'post-123',
          title: 'Una columna',
          uri: '/opinion/una-columna/'
        }
      }
    ]
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => authors
    })

    const { result } = renderHook(useOpinionAuthors, { wrapper })
    await waitFor(() => expect(result.current.authors).toEqual(authors))
    expect(result.current.error).toBeUndefined()
  })
})
