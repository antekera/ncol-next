import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Reactions } from '..'

jest.mock('@lib/api', () => {
  const getCounts = jest.fn()
  const vote = jest.fn()
  return {
    reactionsClient: { getCounts, vote },
    __getCounts: getCounts,
    __vote: vote
  }
})

jest.mock('@sentry/nextjs', () => ({ captureException: jest.fn() }))

const mocked: { __getCounts: jest.Mock; __vote: jest.Mock } =
  jest.requireMock('@lib/api')

beforeEach(() => {
  mocked.__getCounts.mockReset()
  mocked.__vote.mockReset()
  window.localStorage.clear()
})

test('loads initial counts from the API and shows compact formatting', async () => {
  mocked.__getCounts.mockResolvedValueOnce({ cry: 2500, love: 313 })

  render(<Reactions slug='/post-a' />)

  expect(await screen.findByText('2.5K')).toBeInTheDocument()
  expect(screen.getByText('313')).toBeInTheDocument()
})

test('optimistically increments count on click and stores selection', async () => {
  mocked.__getCounts.mockResolvedValueOnce({ love: 10 })
  mocked.__vote.mockResolvedValueOnce({ love: 11 })

  render(<Reactions slug='/post-a' />)
  await screen.findByText('10')

  fireEvent.click(screen.getByRole('radio', { name: /Me encanta/i }))

  await waitFor(() =>
    expect(mocked.__vote).toHaveBeenCalledWith(
      expect.objectContaining({ slug: '/post-a', reaction: 'love' })
    )
  )
  await waitFor(() =>
    expect(window.localStorage.getItem('ncol:reacted:/post-a')).toBe('love')
  )
})

test('sends prev when the user changes their vote', async () => {
  window.localStorage.setItem('ncol:reacted:/post-a', 'love')
  mocked.__getCounts.mockResolvedValueOnce({ love: 10, angry: 4 })
  mocked.__vote.mockResolvedValueOnce({ love: 9, angry: 5 })

  render(<Reactions slug='/post-a' />)
  await screen.findByText('10')

  fireEvent.click(screen.getByRole('radio', { name: /Indignante/i }))

  await waitFor(() =>
    expect(mocked.__vote).toHaveBeenCalledWith(
      expect.objectContaining({ reaction: 'angry', prev: 'love' })
    )
  )
  await waitFor(() =>
    expect(window.localStorage.getItem('ncol:reacted:/post-a')).toBe('angry')
  )
})

test('reverts count and selection when the vote throws', async () => {
  mocked.__getCounts.mockResolvedValueOnce({ love: 10 })
  mocked.__vote.mockRejectedValueOnce(new Error('nope'))

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
  mocked.__getCounts.mockResolvedValueOnce({ love: 10 })

  render(<Reactions slug='/post-a' />)
  await screen.findByText('10')

  fireEvent.click(screen.getByRole('radio', { name: /Me encanta/i }))
  await act(async () => {})

  expect(mocked.__vote).not.toHaveBeenCalled()
})
