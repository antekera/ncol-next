import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { LoaderCategoryPosts } from '..'

describe('LoaderCategoryPosts', () => {
  beforeEach(() => {
    jest.useRealTimers()
  })

  test('click disables button while loading and calls fetchMorePosts', async () => {
    let resolvePromise: (value: any) => void = () => {}
    const promise = new Promise(resolve => {
      resolvePromise = resolve
    })
    const fetchMorePosts = jest.fn().mockReturnValue(promise)
    render(
      <LoaderCategoryPosts
        slug='news'
        qty={5}
        fetchMorePosts={fetchMorePosts}
      />
    )

    const button = screen.getByRole('button', { name: /ver más noticias/i })
    expect(button).not.toBeDisabled()

    act(() => {
      fireEvent.click(button)
    })

    expect(fetchMorePosts).toHaveBeenCalledWith(5)
    expect(button).toBeDisabled()

    await act(async () => {
      resolvePromise({
        posts: {
          edges: Array(5).fill({ node: { id: '1' } })
        }
      })
    })

    expect(button).not.toBeDisabled()
  })

  test('does not fetch again if already loading', async () => {
    const fetchMorePosts = jest.fn().mockReturnValue(new Promise(() => {}))
    render(
      <LoaderCategoryPosts
        slug='news'
        qty={5}
        fetchMorePosts={fetchMorePosts}
      />
    )

    const button = screen.getByRole('button', { name: /ver más noticias/i })

    await act(async () => {
      fireEvent.click(button)
    })
    await act(async () => {
      fireEvent.click(button)
    })

    expect(fetchMorePosts).toHaveBeenCalledTimes(1)
  })

  test('hides button when fetched posts are less than qty', async () => {
    const fetchMorePosts = jest.fn().mockResolvedValue({
      posts: {
        edges: Array(3).fill({ node: { id: '1' } }) // Less than qty=5
      }
    })
    render(
      <LoaderCategoryPosts
        slug='news'
        qty={5}
        fetchMorePosts={fetchMorePosts}
      />
    )

    const button = screen.getByRole('button', { name: /ver más noticias/i })

    await act(async () => {
      fireEvent.click(button)
    })

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: /ver más noticias/i })
      ).not.toBeInTheDocument()
    })
  })

  test('hides button when fetchMorePosts returns no posts', async () => {
    const fetchMorePosts = jest.fn().mockResolvedValue({
      posts: {
        edges: []
      }
    })
    render(
      <LoaderCategoryPosts
        slug='news'
        qty={5}
        fetchMorePosts={fetchMorePosts}
      />
    )

    const button = screen.getByRole('button', { name: /ver más noticias/i })

    await act(async () => {
      fireEvent.click(button)
    })

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: /ver más noticias/i })
      ).not.toBeInTheDocument()
    })
  })

  test('hides button when fetchMorePosts fails with an error', async () => {
    const fetchMorePosts = jest
      .fn()
      .mockRejectedValue(new Error('Network error'))
    render(
      <LoaderCategoryPosts
        slug='news'
        qty={5}
        fetchMorePosts={fetchMorePosts}
      />
    )

    const button = screen.getByRole('button', { name: /ver más noticias/i })

    await act(async () => {
      fireEvent.click(button)
    })

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: /ver más noticias/i })
      ).not.toBeInTheDocument()
    })
  })
})
