import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Reactions } from '..'
import { HttpClient } from '@lib/httpClient'

jest.mock('@lib/httpClient', () => {
  const get = jest.fn()
  const post = jest.fn()
  return {
    HttpClient: jest.fn().mockImplementation(() => ({ get, post })),
    __get: get,
    __post: post
  }
})

jest.mock('@sentry/nextjs', () => ({ captureException: jest.fn() }))

const mocked: { __get: jest.Mock; __post: jest.Mock } =
  jest.requireMock('@lib/httpClient')

beforeEach(() => {
  mocked.__get.mockReset()
  mocked.__post.mockReset()
  window.localStorage.clear()
  ;(HttpClient as unknown as jest.Mock).mockClear()
})

test('loads initial counts from the API and shows compact formatting', async () => {
  mocked.__get.mockResolvedValueOnce({
    data: { counts: { cry: 2500, love: 313 } },
    status: 200
  })

  render(<Reactions slug='/post-a' />)

  expect(await screen.findByText('2.5K')).toBeInTheDocument()
  expect(screen.getByText('313')).toBeInTheDocument()
})

test('optimistically increments count on click and stores selection', async () => {
  mocked.__get.mockResolvedValueOnce({
    data: { counts: { love: 10 } },
    status: 200
  })
  mocked.__post.mockResolvedValueOnce({
    data: { counts: { love: 11 } },
    status: 200
  })

  render(<Reactions slug='/post-a' />)
  await screen.findByText('10')

  fireEvent.click(screen.getByRole('radio', { name: /Me encanta/i }))

  await waitFor(() =>
    expect(mocked.__post).toHaveBeenCalledWith(
      '/api/reactions/',
      expect.objectContaining({ slug: '/post-a', reaction: 'love' })
    )
  )
  await waitFor(() =>
    expect(window.localStorage.getItem('ncol:reacted:/post-a')).toBe('love')
  )
})

test('sends prev when the user changes their vote', async () => {
  window.localStorage.setItem('ncol:reacted:/post-a', 'love')
  mocked.__get.mockResolvedValueOnce({
    data: { counts: { love: 10, angry: 4 } },
    status: 200
  })
  mocked.__post.mockResolvedValueOnce({
    data: { counts: { love: 9, angry: 5 } },
    status: 200
  })

  render(<Reactions slug='/post-a' />)
  await screen.findByText('10')

  fireEvent.click(screen.getByRole('radio', { name: /Indignante/i }))

  await waitFor(() =>
    expect(mocked.__post).toHaveBeenCalledWith(
      '/api/reactions/',
      expect.objectContaining({ reaction: 'angry', prev: 'love' })
    )
  )
  await waitFor(() =>
    expect(window.localStorage.getItem('ncol:reacted:/post-a')).toBe('angry')
  )
})

test('reverts count and selection when the POST fails', async () => {
  mocked.__get.mockResolvedValueOnce({
    data: { counts: { love: 10 } },
    status: 200
  })
  mocked.__post.mockRejectedValueOnce(new Error('nope'))

  render(<Reactions slug='/post-a' />)
  await screen.findByText('10')

  fireEvent.click(screen.getByRole('radio', { name: /Me encanta/i }))

  await waitFor(() =>
    expect(screen.getByRole('radio', { name: /Me encanta/i })).toHaveAttribute(
      'aria-checked',
      'false'
    )
  )
  expect(window.localStorage.getItem('ncol:reacted:/post-a')).toBeNull()
})

test('ignores clicks on the already-selected reaction', async () => {
  window.localStorage.setItem('ncol:reacted:/post-a', 'love')
  mocked.__get.mockResolvedValueOnce({
    data: { counts: { love: 10 } },
    status: 200
  })

  render(<Reactions slug='/post-a' />)
  await screen.findByText('10')

  fireEvent.click(screen.getByRole('radio', { name: /Me encanta/i }))
  await act(async () => {})

  expect(mocked.__post).not.toHaveBeenCalled()
})
